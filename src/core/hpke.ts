/**
 * RFC 9180 Hybrid Public-Key Encryption (HPKE) — pure Node.js implementation
 * using only `node:crypto`. Supports Auth (mode 0x02) and AuthPSK (mode 0x03)
 * modes which the SATUSEHAT webhook portal requires.
 *
 * Wire format is the standard `base64(enc || ciphertext || tag)`:
 *   - `enc` is the serialized ephemeral public key (Nenc bytes per KEM).
 *   - `ciphertext || tag` is the AEAD output with the 16-byte tag appended.
 *
 * Suite names match the RFC 9180 IANA registry (also used by the SATUSEHAT
 * portal's sample):
 *   KEM:  KEM_X25519_HKDF_SHA256, KEM_X448_HKDF_SHA512,
 *         KEM_P256_HKDF_SHA256, KEM_P384_HKDF_SHA384, KEM_P521_HKDF_SHA512
 *   KDF:  HKDF_SHA256, HKDF_SHA384, HKDF_SHA512
 *   AEAD: AEAD_AESGCM128, AEAD_AESGCM256, AEAD_CHACHA20POLY1305
 *
 * ML-KEM / Kyber are deliberately skipped — `node:crypto` only gained ML-KEM in
 * recent Node releases and the SDK supports Node >= 18. An
 * unknown suite name throws `Unsupported KEM/KDF/AEAD`.
 *
 * Cross-checked against `hpke-js` during development;
 * `scripts/hpke-check.mjs` provides a permanent no-dep round-trip smoke test.
 */
import {
  createCipheriv,
  createDecipheriv,
  createECDH,
  createHmac,
  createPrivateKey,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
} from "node:crypto";
import type {
  CipherChaCha20Poly1305,
  CipherGCM,
  DecipherChaCha20Poly1305,
  DecipherGCM,
} from "node:crypto";

type AeadCipher = CipherGCM | CipherChaCha20Poly1305;
type AeadDecipher = DecipherGCM | DecipherChaCha20Poly1305;

export interface HpkeSuite {
  kem: string;
  kdf: string;
  aead: string;
}

export interface HpkeOptions {
  /** Additional authenticated data, fed as raw bytes to AEAD. */
  aad?: Uint8Array | string;
  /** PSK material; UTF-8 strings, total ≥ 32 bytes when set. Triggers AuthPSK. */
  psk?: { key: string; id: string };
}

/* ============================================================== Suite tables */

type HashName = "sha256" | "sha384" | "sha512";
type KemPrimitive = "P256" | "P384" | "P521" | "X25519" | "X448";
type Mode = 0x02 | 0x03;

interface KemInfo {
  /** RFC 9180 §7.1 KEM code point. */
  kemId: number;
  primitive: KemPrimitive;
  Nsecret: number;
  Nenc: number;
  /** KEM's KDF (used by DHKEM); equals the KDF named in the KEM identifier. */
  kdf: KdfInfo;
}

interface KdfInfo {
  /** RFC 9180 §7.2 KDF code point. */
  kdfId: number;
  hashName: HashName;
  Nh: number;
}

interface AeadInfo {
  /** RFC 9180 §7.3 AEAD code point. */
  aeadId: number;
  cipherName: "aes-128-gcm" | "aes-256-gcm" | "chacha20-poly1305";
  Nk: number;
  Nn: number;
}

const KDF_TABLE: Record<string, KdfInfo> = {
  HKDF_SHA256: { kdfId: 0x0001, hashName: "sha256", Nh: 32 },
  HKDF_SHA384: { kdfId: 0x0002, hashName: "sha384", Nh: 48 },
  HKDF_SHA512: { kdfId: 0x0003, hashName: "sha512", Nh: 64 },
};

const KEM_TABLE: Record<string, KemInfo> = {
  KEM_P256_HKDF_SHA256:   { kemId: 0x0010, primitive: "P256",   Nsecret: 32,  Nenc: 65,  kdf: KDF_TABLE.HKDF_SHA256 },
  KEM_P384_HKDF_SHA384:   { kemId: 0x0011, primitive: "P384",   Nsecret: 48,  Nenc: 97,  kdf: KDF_TABLE.HKDF_SHA384 },
  KEM_P521_HKDF_SHA512:   { kemId: 0x0012, primitive: "P521",   Nsecret: 64,  Nenc: 133, kdf: KDF_TABLE.HKDF_SHA512 },
  KEM_X25519_HKDF_SHA256: { kemId: 0x0020, primitive: "X25519", Nsecret: 32,  Nenc: 32,  kdf: KDF_TABLE.HKDF_SHA256 },
  KEM_X448_HKDF_SHA512:   { kemId: 0x0021, primitive: "X448",   Nsecret: 64,  Nenc: 56,  kdf: KDF_TABLE.HKDF_SHA512 },
};

const AEAD_TABLE: Record<string, AeadInfo> = {
  AEAD_AESGCM128:         { aeadId: 0x0001, cipherName: "aes-128-gcm",         Nk: 16, Nn: 12 },
  AEAD_AESGCM256:         { aeadId: 0x0002, cipherName: "aes-256-gcm",         Nk: 32, Nn: 12 },
  AEAD_CHACHA20POLY1305:  { aeadId: 0x0003, cipherName: "chacha20-poly1305",  Nk: 32, Nn: 12 },
};

const HASH_LEN: Record<HashName, number> = { sha256: 32, sha384: 48, sha512: 64 };

interface ResolvedSuite {
  kem: KemInfo;
  kdf: KdfInfo;
  aead: AeadInfo;
  /** RFC 9180 §5.1 — used outside DHKEM. */
  hpkeSuiteId: Buffer;
  /** RFC 9180 §4.1 — suite_id used inside DHKEM's LabeledExtract/LabeledExpand. */
  kemSuiteId: Buffer;
}

function resolveSuite(suite: HpkeSuite): ResolvedSuite {
  const kem = KEM_TABLE[suite.kem];
  if (!kem) throw new Error(`Unsupported KEM: ${suite.kem}`);
  const kdf = KDF_TABLE[suite.kdf];
  if (!kdf) throw new Error(`Unsupported KDF: ${suite.kdf}`);
  const aead = AEAD_TABLE[suite.aead];
  if (!aead) throw new Error(`Unsupported AEAD: ${suite.aead}`);
  return {
    kem,
    kdf,
    aead,
    hpkeSuiteId: suiteId("HPKE", kem.kemId, kdf.kdfId, aead.aeadId),
    kemSuiteId: suiteId("KEM", kem.kemId),
  };
}

function suiteId(prefix: "HPKE" | "KEM", kemId: number, kdfId = 0, aeadId = 0): Buffer {
  // RFC 9180 §7: HPKE variant is "HPKE" || I2OSP(kem,2) || I2OSP(kdf,2) || I2OSP(aead,2) (10 bytes).
  // KEM variant (used inside DHKEM, §4.1) is "KEM" || I2OSP(kem,2) (5 bytes) — no kdf/aead slots.
  // I2OSP(n, 2) = big-endian 16-bit. `Buffer.from(Uint16Array.of(n))` is only 1 byte
  // because Node's Buffer copies Uint16 values as a single low byte; use writeUInt16BE.
  const i2osp2 = (n: number) => {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(n);
    return buf;
  };
  if (prefix === "KEM") {
    return Buffer.concat([Buffer.from(prefix, "ascii"), i2osp2(kemId)]);
  }
  return Buffer.concat([
    Buffer.from(prefix, "ascii"),
    i2osp2(kemId),
    i2osp2(kdfId),
    i2osp2(aeadId),
  ]);
}

/* ====================================================== RFC 9180 §5.1 Labeled primitives */

/**
 * `LabeledExtract(salt, label, ikm)` = `Extract(salt, "HPKE-v1" || suite_id || label || ikm)`.
 * `LabeledExpand(prk, label, info, L)` = `Expand(prk, I2OSP(L,2) || "HPKE-v1" || suite_id || label || info)`.
 *
 * Note: the `salt` argument is the HMAC key. RFC 9180 calls for `""` for the
 * KDF's identity-style hashes (psk_id_hash, info_hash, eae_prk) and uses
 * `shared_secret` as the salt for the key schedule `secret`.
 */
function labeledExtract(hashName: HashName, salt: Buffer, suiteId: Buffer, label: string, ikm: Buffer): Buffer {
  const labeledIkm = Buffer.concat([Buffer.from("HPKE-v1"), suiteId, Buffer.from(label, "ascii"), ikm]);
  // Node's createHmac accepts an empty Buffer as the HMAC key (treated as zeros).
  return createHmac(hashName, salt).update(labeledIkm).digest();
}

function labeledExpand(
  hashName: HashName,
  prk: Buffer,
  suiteId: Buffer,
  label: string,
  info: Buffer,
  L: number,
): Buffer {
  const lengthPrefix = Buffer.alloc(2);
  lengthPrefix.writeUInt16BE(L);
  const labeledInfo = Buffer.concat([
    lengthPrefix,
    Buffer.from("HPKE-v1"),
    suiteId,
    Buffer.from(label, "ascii"),
    info,
  ]);
  const hashLen = HASH_LEN[hashName];
  const N = Math.ceil(L / hashLen);
  const outputs: Buffer[] = [];
  let prev = Buffer.alloc(0);
  for (let i = 1; i <= N; i++) {
    const h = createHmac(hashName, prk);
    h.update(prev);
    h.update(labeledInfo);
    h.update(Buffer.from([i]));
    prev = h.digest();
    outputs.push(prev);
  }
  return Buffer.concat(outputs).subarray(0, L);
}

/* ============================================================== RFC 9180 §4.1 DHKEM */

/**
 * X25519/X448 raw 32/56-byte keys aren't valid DER on their own, so we wrap
 * them with the RFC 8410 PKCS8/SPKI prefixes (OIDs 1.3.101.110 / 1.3.101.111).
 */
const OKP_DER_PREFIXES: Record<"X25519" | "X448", { pkcs8: Buffer; spki: Buffer }> = {
  // RFC 8410 / RFC 8466. BIT STRING length = 1 unused-bits byte + raw key length.
  // SEQUENCE length = body = algorithm (8 bytes incl. OID 1.3.101.110/.111) + BIT STRING header (3 bytes) + raw key.
  X25519: {
    pkcs8: Buffer.from([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6e, 0x04, 0x22, 0x04, 0x20]),
    spki:  Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6e, 0x03, 0x21, 0x00]),
  },
  X448: {
    pkcs8: Buffer.from([0x30, 0x46, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6f, 0x04, 0x3a, 0x04, 0x38]),
    spki:  Buffer.from([0x30, 0x42, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6f, 0x03, 0x39, 0x00]),
  },
};

function importOKPPrivate(curve: "X25519" | "X448", rawSk: Buffer) {
  return createPrivateKey({
    key: Buffer.concat([OKP_DER_PREFIXES[curve].pkcs8, rawSk]),
    format: "der",
    type: "pkcs8",
  });
}

function importOKPPublic(curve: "X25519" | "X448", rawPk: Buffer) {
  return createPublicKey({
    key: Buffer.concat([OKP_DER_PREFIXES[curve].spki, rawPk]),
    format: "der",
    type: "spki",
  });
}

function dhPrimitive(primitive: KemPrimitive, sk: Buffer, pk: Buffer): Buffer {
  if (primitive === "X25519" || primitive === "X448") {
    return diffieHellman({
      privateKey: importOKPPrivate(primitive, sk),
      publicKey: importOKPPublic(primitive, pk),
    });
  }
  const ecdh = createECDH(primitive === "P256" ? "prime256v1" : primitive === "P384" ? "secp384r1" : "secp521r1");
  ecdh.setPrivateKey(sk);
  return ecdh.computeSecret(pk);
}

/** EC pub-from-priv via Node's createECDH; OKP pub-from-priv via the KeyObject's JWK `x`. */
function pubFromPriv(primitive: KemPrimitive, sk: Buffer): Buffer {
  if (primitive === "X25519" || primitive === "X448") {
    const jwk = createPublicKey(importOKPPrivate(primitive, sk)).export({ format: "jwk" }) as { x: string };
    return Buffer.from(jwk.x, "base64url");
  }
  const ecdh = createECDH(primitive === "P256" ? "prime256v1" : primitive === "P384" ? "secp384r1" : "secp521r1");
  ecdh.setPrivateKey(sk);
  return ecdh.getPublicKey();
}

function generateEphemeralOKP(curve: "X25519" | "X448"): { sk: Buffer; pk: Buffer } {
  // generateKeyPairSync has separate "x25519" and "x448" overloads with no
  // overload matching the union; branch so each call resolves to a literal.
  const { privateKey: skKO, publicKey: pkKO } = curve === "X25519"
    ? generateKeyPairSync("x25519")
    : generateKeyPairSync("x448");
  const skJwk = skKO.export({ format: "jwk" }) as { d: string };
  const pkJwk = pkKO.export({ format: "jwk" }) as { x: string };
  return {
    sk: Buffer.from(skJwk.d, "base64url"),
    pk: Buffer.from(pkJwk.x, "base64url"),
  };
}

function generateEphemeralEC(primitive: "P256" | "P384" | "P521"): { sk: Buffer; pk: Buffer } {
  const ecdh = createECDH(primitive === "P256" ? "prime256v1" : primitive === "P384" ? "secp384r1" : "secp521r1");
  ecdh.generateKeys();
  return { sk: ecdh.getPrivateKey(), pk: ecdh.getPublicKey() };
}

function expectedPrivLength(primitive: KemPrimitive): number {
  switch (primitive) {
    case "X25519": return 32;
    case "X448":   return 56;
    case "P256":   return 32;
    case "P384":   return 48;
    case "P521":   return 66;
  }
}

/** RFC 9180 §4.1 `ExtractAndExpand(dh, kem_context)` → Nsecret bytes. */
function dhkemExtractAndExpand(
  kem: KemInfo,
  kemSuiteId: Buffer,
  dh: Buffer,
  kemContext: Buffer,
): Buffer {
  // Label is `eae_prk` (RFC 9180 §4.1; NOT the older draft's `dkp_prk`).
  const eaePrk = labeledExtract(kem.kdf.hashName, Buffer.alloc(0), kemSuiteId, "eae_prk", dh);
  return labeledExpand(kem.kdf.hashName, eaePrk, kemSuiteId, "shared_secret", kemContext, kem.Nsecret);
}

/* ============================================================ RFC 9180 §5.1 KeySchedule */

/**
 * `KeySchedule(mode, shared_secret, info, psk, psk_id)` — key and base_nonce
 * derivation (exporter_secret is skipped: no Export() API here). RFC 9180 §5.1:
 *   psk_id_hash   = LabeledExtract("", "psk_id_hash", psk_id)
 *   info_hash     = LabeledExtract("", "info_hash",   info)
 *   context       = mode || psk_id_hash || info_hash
 *   secret        = LabeledExtract(shared_secret, "secret", psk)
 *   key           = LabeledExpand(secret, "key",         context, Nk)
 *   base_nonce    = LabeledExpand(secret, "base_nonce",  context, Nn)
 *
 * `info` is the user-supplied context (we treat it as empty to match the
 * SATUSEHAT portal's sample). `psk` is the literal — `""` defaults to Auth mode.
 */
function keySchedule(
  hpkeSuiteId: Buffer,
  hashName: HashName,
  mode: Mode,
  sharedSecret: Buffer,
  info: Buffer,
  psk: Buffer,
  pskID: Buffer,
  aead: AeadInfo,
): { key: Buffer; baseNonce: Buffer } {
  const pskIdHash = labeledExtract(hashName, Buffer.alloc(0), hpkeSuiteId, "psk_id_hash", pskID);
  const infoHash = labeledExtract(hashName, Buffer.alloc(0), hpkeSuiteId, "info_hash", info);
  const context = Buffer.concat([Buffer.from([mode]), pskIdHash, infoHash]);

  const secret = labeledExtract(hashName, sharedSecret, hpkeSuiteId, "secret", psk);

  return {
    key: labeledExpand(hashName, secret, hpkeSuiteId, "key", context, aead.Nk),
    baseNonce: labeledExpand(hashName, secret, hpkeSuiteId, "base_nonce", context, aead.Nn),
  };
}

/* ==================================================================== AEAD */

/** §5.2: nonce = baseNonce XOR I2OSP(seq, Nn). Single-shot → seq = 0 → identity. */
function aeadSeal(aead: AeadInfo, key: Buffer, nonce: Buffer, aad: Buffer, pt: Buffer): Buffer {
  // @types/node widens AeadInfo.cipherName to string when accessed by property,
  // so the generic `createCipheriv(string, ...): Cipher` overload kicks in.
  // Cast back to a tagged type. Both exposed cipher variants accept a buffer
  // argument for `setAAD` (ChaCha20's overload requires a second `options` arg
  // the runtime ignores; we narrow via cast). NOTE: must invoke through the
  // method (not detached) so `this[kHandle]` stays bound in Node's C++ bridge.
  const cipher = createCipheriv(aead.cipherName, key, nonce) as AeadCipher;
  const setAAD = cipher.setAAD as unknown as (b: ArrayBufferView) => void;
  if (aad.length > 0) setAAD.call(cipher, aad);
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  return Buffer.concat([ct, cipher.getAuthTag()]);
}

function aeadOpen(aead: AeadInfo, key: Buffer, nonce: Buffer, aad: Buffer, ctWithTag: Buffer): Buffer {
  if (ctWithTag.length < 16) throw new Error("AEAD.Open: ciphertext too short");
  const tag = ctWithTag.subarray(ctWithTag.length - 16);
  const enc = ctWithTag.subarray(0, ctWithTag.length - 16);
  // Same widen-and-cast shape as `aeadSeal`; DecipherGCM and DecipherChaCha20Poly1305
  // both expose `setAAD` and `setAuthTag` with single-buffer calling patterns.
  const cipher = createDecipheriv(aead.cipherName, key, nonce) as AeadDecipher;
  const setAAD = cipher.setAAD as unknown as (b: ArrayBufferView) => void;
  if (aad.length > 0) setAAD.call(cipher, aad);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(enc), cipher.final()]);
}

/* ============================================================== Public API */

/**
 * Decrypt an HPKE message produced by `sealHpkeMessage` in Auth or AuthPSK
 * mode. Single-shot (`seq = 0`).
 */
export function openHpkeMessage(
  combinedB64: string,
  receiverPriv: string,
  senderPub: string,
  suite: HpkeSuite,
  opts?: HpkeOptions,
): Buffer {
  if (!combinedB64) throw new Error("openHpkeMessage: combined payload is required");
  if (!receiverPriv) throw new Error("openHpkeMessage: receiver private key is required");
  if (!senderPub) throw new Error("openHpkeMessage: sender public key is required");

  const { kem, kdf, aead, hpkeSuiteId, kemSuiteId } = resolveSuite(suite);
  const { mode, psk, pskID } = resolveModeAndPsk(opts);

  const combined = Buffer.from(combinedB64.replace(/\s+/g, ""), "base64");
  if (combined.length < kem.Nenc + 16) {
    throw new Error(
      `openHpkeMessage: combined payload too short (${combined.length} bytes; need >= ${kem.Nenc + 16})`,
    );
  }
  const enc = Buffer.from(combined.subarray(0, kem.Nenc));
  const ciphertext = Buffer.from(combined.subarray(kem.Nenc));

  const skR = Buffer.from(receiverPriv, "base64");
  const pkS = Buffer.from(senderPub, "base64");
  // P-521 scalars may be left-padded to ≤ 66 bytes; all others are fixed-length.
  const skRLen = skR.length;
  const skRExpected = expectedPrivLength(kem.primitive);
  if (kem.primitive === "P521" ? skRLen > skRExpected : skRLen !== skRExpected) {
    throw new Error(`receiverPriv: ${kem.primitive} key length mismatch — got ${skRLen} bytes, expected ${skRExpected}`);
  }
  if (pkS.length !== kem.Nenc) {
    throw new Error(`senderPub: ${kem.primitive} public key length mismatch — got ${pkS.length} bytes, expected ${kem.Nenc}`);
  }

  // AuthDecap (RFC 9180 §4.1): dh = DH(skR, enc) || DH(skR, pkS); kem_context = enc || pkR || pkS.
  const dh = Buffer.concat([dhPrimitive(kem.primitive, skR, enc), dhPrimitive(kem.primitive, skR, pkS)]);
  const kemContext = Buffer.concat([enc, pubFromPriv(kem.primitive, skR), pkS]);
  const sharedSecret = dhkemExtractAndExpand(kem, kemSuiteId, dh, kemContext);

  // KeySchedule uses the ciphersuite hash, not the KEM's KDF — usually identical
  // for our supported suites but keep them distinct in case future ciphersuites
  // mix them.
  const { key, baseNonce } = keySchedule(hpkeSuiteId, kdf.hashName, mode, sharedSecret, Buffer.alloc(0), psk, pskID, aead);

  const aad = opts?.aad === undefined ? Buffer.alloc(0)
    : typeof opts.aad === "string" ? Buffer.from(opts.aad, "utf8")
    : Buffer.from(opts.aad);
  return aeadOpen(aead, key, Buffer.from(baseNonce), aad, ciphertext);
}

/**
 * Encrypt a message under HPKE Auth (or AuthPSK if `opts.psk` is set).
 * Output is `base64(enc || ciphertext || tag)`.
 */
export function sealHpkeMessage(
  plaintext: string | Buffer,
  receiverPub: string,
  senderPriv: string,
  suite: HpkeSuite,
  opts?: HpkeOptions,
): string {
  if (!receiverPub) throw new Error("sealHpkeMessage: receiver public key is required");
  if (!senderPriv) throw new Error("sealHpkeMessage: sender private key is required");

  const { kem, kdf, aead, hpkeSuiteId, kemSuiteId } = resolveSuite(suite);
  const { mode, psk, pskID } = resolveModeAndPsk(opts);

  const pkR = Buffer.from(receiverPub, "base64");
  const skS = Buffer.from(senderPriv, "base64");
  if (pkR.length !== kem.Nenc) {
    throw new Error(`receiverPub: ${kem.primitive} public key length mismatch — got ${pkR.length} bytes, expected ${kem.Nenc}`);
  }
  const skSLen = skS.length;
  const skSExpected = expectedPrivLength(kem.primitive);
  if (kem.primitive === "P521" ? skSLen > skSExpected : skSLen !== skSExpected) {
    throw new Error(`senderPriv: ${kem.primitive} key length mismatch — got ${skSLen} bytes, expected ${skSExpected}`);
  }

  // AuthEncap (RFC 9180 §4.1): ephemeral (skE, pkE); dh = DH(skE, pkR) || DH(skS, pkR);
  // kem_context = enc || pkR || pkS.
  const ephemeral = kem.primitive === "X25519" || kem.primitive === "X448"
    ? generateEphemeralOKP(kem.primitive)
    : generateEphemeralEC(kem.primitive);
  const enc = ephemeral.pk;
  const dh = Buffer.concat([
    dhPrimitive(kem.primitive, ephemeral.sk, pkR),
    dhPrimitive(kem.primitive, skS, pkR),
  ]);
  const pkS = pubFromPriv(kem.primitive, skS);
  const kemContext = Buffer.concat([enc, pkR, pkS]);
  const sharedSecret = dhkemExtractAndExpand(kem, kemSuiteId, dh, kemContext);

  const { key, baseNonce } = keySchedule(hpkeSuiteId, kdf.hashName, mode, sharedSecret, Buffer.alloc(0), psk, pskID, aead);
  const pt = typeof plaintext === "string" ? Buffer.from(plaintext, "utf8") : Buffer.from(plaintext);
  const aad = opts?.aad === undefined ? Buffer.alloc(0)
    : typeof opts.aad === "string" ? Buffer.from(opts.aad, "utf8")
    : Buffer.from(opts.aad);
  const ciphertext = aeadSeal(aead, key, Buffer.from(baseNonce), aad, pt);

  return Buffer.concat([enc, ciphertext]).toString("base64");
}

function resolveModeAndPsk(opts?: HpkeOptions): { mode: Mode; psk: Buffer; pskID: Buffer } {
  if (!opts?.psk) {
    return { mode: 0x02, psk: Buffer.alloc(0), pskID: Buffer.alloc(0) };
  }
  const psk = Buffer.from(opts.psk.key, "utf8");
  if (psk.length < 32) {
    throw new Error(`PSK must be at least 32 UTF-8 bytes (got ${psk.length})`);
  }
  return { mode: 0x03, psk, pskID: Buffer.from(opts.psk.id ?? "", "utf8") };
}
