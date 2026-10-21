#!/usr/bin/env node
/**
 * No-dependency HPKE round-trip + tamper self-check.
 *
 * Runs sealHpkeMessage → openHpkeMessage across every supported KEM × AEAD
 * (Auth and AuthPSK modes), then verifies that:
 *   - round-trip plaintext recovery works
 *   - a single-bit flip in the ciphertext throws on open
 *   - the wrong AAD throws on open
 *   - the wrong PSK throws on open (AuthPSK)
 *
 * Does NOT depend on hpke-js — validates the SDK's internal consistency only.
 * For interop against the portal sample (hpke-js), run scripts/hpke-interop.mjs.
 *
 * Usage:
 *   npm run build && node scripts/hpke-check.mjs
 *
 * Exit status: 0 on success, 1 on first failure.
 */
import {
  createWebhookHandler,
  openHpkeMessage,
  sealHpkeMessage,
} from "../dist/index.js";
import { createECDH, generateKeyPairSync } from "node:crypto";

const AAD = "transaction_id:demo-12345";
const PT = "halo dunia — this is a webhook payload from the klaim-swasta portal";

/**
 * Generate a keypair for a given curve and return raw keys as base64.
 * For OKP curves (X25519/X448), use `crypto.generateKeyPairSync` and export
 * raw via JWK. For NIST P-curves, use `createECDH` (raw SEC1 pub / scalar priv).
 */
function makeKeyPair(curve) {
  if (curve === "X25519" || curve === "X448") {
    const { privateKey, publicKey } = generateKeyPairSync(curve.toLowerCase());
    const skJwk = privateKey.export({ format: "jwk" });
    const pkJwk = publicKey.export({ format: "jwk" });
    return {
      skB64: Buffer.from(skJwk.d, "base64url").toString("base64"),
      pkB64: Buffer.from(pkJwk.x, "base64url").toString("base64"),
    };
  }
  const curveName =
    curve === "P256" ? "prime256v1" : curve === "P384" ? "secp384r1" : "secp521r1";
  const ecdh = createECDH(curveName);
  ecdh.generateKeys();
  return {
    skB64: ecdh.getPrivateKey().toString("base64"),
    pkB64: ecdh.getPublicKey().toString("base64"),
  };
}

const SUITES = [
  { kem: "KEM_X25519_HKDF_SHA256", kdf: "HKDF_SHA256", aead: "AEAD_AESGCM128" },
  { kem: "KEM_X25519_HKDF_SHA256", kdf: "HKDF_SHA256", aead: "AEAD_AESGCM256" },
  { kem: "KEM_X25519_HKDF_SHA256", kdf: "HKDF_SHA256", aead: "AEAD_CHACHA20POLY1305" },
  { kem: "KEM_X448_HKDF_SHA512",   kdf: "HKDF_SHA512", aead: "AEAD_AESGCM256" },
  { kem: "KEM_X448_HKDF_SHA512",   kdf: "HKDF_SHA512", aead: "AEAD_CHACHA20POLY1305" },
  { kem: "KEM_P256_HKDF_SHA256",   kdf: "HKDF_SHA256", aead: "AEAD_AESGCM128" },
  { kem: "KEM_P256_HKDF_SHA256",   kdf: "HKDF_SHA256", aead: "AEAD_AESGCM256" },
  { kem: "KEM_P256_HKDF_SHA256",   kdf: "HKDF_SHA256", aead: "AEAD_CHACHA20POLY1305" },
  { kem: "KEM_P384_HKDF_SHA384",   kdf: "HKDF_SHA384", aead: "AEAD_AESGCM256" },
  { kem: "KEM_P384_HKDF_SHA384",   kdf: "HKDF_SHA384", aead: "AEAD_CHACHA20POLY1305" },
  { kem: "KEM_P521_HKDF_SHA512",   kdf: "HKDF_SHA512", aead: "AEAD_AESGCM256" },
  { kem: "KEM_P521_HKDF_SHA512",   kdf: "HKDF_SHA512", aead: "AEAD_CHACHA20POLY1305" },
];
const PSK = "0".repeat(32) + "0123456789abcdef0123456789abcdef"; // ≥ 32 bytes
const PSK_ID = "demo-psk-id";

function curveOf(suiteName) {
  if (suiteName.includes("X25519")) return "X25519";
  if (suiteName.includes("X448")) return "X448";
  if (suiteName.includes("P256")) return "P256";
  if (suiteName.includes("P384")) return "P384";
  if (suiteName.includes("P521")) return "P521";
}

let pass = 0;
let fail = 0;
const log = (name, ok, info = "") => {
  console.log(`[${ok ? "OK" : "FAIL"}] ${name}${info ? " — " + info : ""}`);
  ok ? pass++ : fail++;
};

for (const suite of SUITES) {
  const receiver = makeKeyPair(curveOf(suite.kem));
  const sender = makeKeyPair(curveOf(suite.kem));

  // Auth mode
  const authSeal = sealHpkeMessage(PT, receiver.pkB64, sender.skB64, suite, { aad: AAD });
  const authOpen = openHpkeMessage(authSeal, receiver.skB64, sender.pkB64, suite, { aad: AAD });
  log(`${suite.kem}+${suite.aead} auth round-trip`, authOpen.toString("utf8") === PT);

  const tampered = Buffer.from(authSeal, "base64");
  if (tampered.length > 0) tampered[tampered.length - 1] ^= 0x01;
  let tamperThrew = false;
  try {
    openHpkeMessage(tampered.toString("base64"), receiver.skB64, sender.pkB64, suite, { aad: AAD });
  } catch {
    tamperThrew = true;
  }
  log(`${suite.kem}+${suite.aead} auth: tampered ciphertext throws`, tamperThrew);

  let wrongAadThrew = false;
  try {
    openHpkeMessage(authSeal, receiver.skB64, sender.pkB64, suite, { aad: AAD + "x" });
  } catch {
    wrongAadThrew = true;
  }
  log(`${suite.kem}+${suite.aead} auth: wrong AAD throws`, wrongAadThrew);

  // AuthPSK mode
  const pskSeal = sealHpkeMessage(PT, receiver.pkB64, sender.skB64, suite, {
    aad: AAD,
    psk: { key: PSK, id: PSK_ID },
  });
  const pskOpen = openHpkeMessage(pskSeal, receiver.skB64, sender.pkB64, suite, {
    aad: AAD,
    psk: { key: PSK, id: PSK_ID },
  });
  log(`${suite.kem}+${suite.aead} auth_psk round-trip`, pskOpen.toString("utf8") === PT);

  let wrongPskThrew = false;
  try {
    openHpkeMessage(pskSeal, receiver.skB64, sender.pkB64, suite, {
      aad: AAD,
      psk: { key: "z".repeat(32), id: PSK_ID },
    });
  } catch {
    wrongPskThrew = true;
  }
  log(`${suite.kem}+${suite.aead} auth_psk: wrong PSK throws`, wrongPskThrew);

  // Short PSK must throw at seal time
  let shortPskThrew = false;
  try {
    sealHpkeMessage(PT, receiver.pkB64, sender.skB64, suite, {
      aad: AAD,
      psk: { key: "short", id: PSK_ID },
    });
  } catch {
    shortPskThrew = true;
  }
  log(`${suite.kem}+${suite.aead} auth_psk: <32-byte PSK rejected at seal`, shortPskThrew);
}

// Webhook handler: encrypted envelope → 200 + parsed payload; forged body → 400.
{
  const suite = SUITES[0];
  const me = makeKeyPair("X25519");
  const satusehat = makeKeyPair("X25519");
  const psk = { key: PSK, id: PSK_ID };
  const envelope = { data: { fhir: { resourceType: "Claim" } }, meta: { method: "claimBundle" }, transaction_id: "t1", timestamp: "now" };
  let event;
  const handler = createWebhookHandler({
    suite, privateKey: me.skB64, satusehatPublicKey: satusehat.pkB64, psk,
    onWebhook: (ev) => { event = ev; },
  });
  const body = sealHpkeMessage(JSON.stringify(envelope), me.pkB64, satusehat.skB64, suite, { psk });
  const ok = await handler(new Request("http://localhost/webhook", { method: "POST", body }));
  log("webhook handler: 200 + payload parsed", ok.status === 200 && event?.payload?.meta.method === "claimBundle");
  const forged = sealHpkeMessage(JSON.stringify(envelope), me.pkB64, makeKeyPair("X25519").skB64, suite, { psk });
  const bad = await handler(new Request("http://localhost/webhook", { method: "POST", body: forged }));
  log("webhook handler: wrong sender key → 400", bad.status === 400);
}

console.log(`\nTotal: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
