import {
  createCipheriv,
  createDecipheriv,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
  constants as cryptoConstants,
} from "node:crypto";

const BEGIN_TAG = "-----BEGIN ENCRYPTED MESSAGE-----";
const END_TAG = "-----END ENCRYPTED MESSAGE-----";
const RSA_WRAPPED_KEY_LENGTH = 256; // 2048-bit RSA key
const GCM_IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

export interface KycKeyPair {
  publicKey: string;
  privateKey: string;
}

/** Fresh 2048-bit RSA keypair — SATU SEHAT's KYC flow expects a new one per request. */
export function generateKycKeyPair(): KycKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

/** PHP's `chunk_split($base64, 76, "\r\n")` — every chunk, including the last, gets a trailing "\r\n". */
function chunkSplit(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; i += 76) out += str.slice(i, i + 76) + "\r\n";
  return out;
}

/**
 * SATU SEHAT KYC envelope: RSA-OAEP-wrap a random AES-256 key with the
 * recipient's RSA public key, AES-256-GCM-encrypt the message, concatenate
 * `wrappedKey(256) + iv(12) + ciphertext + tag(16)`, base64, wrap in
 * `-----BEGIN/END ENCRYPTED MESSAGE-----`. Matches SATU SEHAT's official
 * PHP client (phpseclib3 RSA OAEP, default hash sha256) byte-for-byte.
 */
export function encryptKycMessage(message: string, recipientPublicKeyPem: string, oaepHash = "sha256"): string {
  const aesKey = randomBytes(32);
  const iv = randomBytes(GCM_IV_LENGTH);

  const cipher = createCipheriv("aes-256-gcm", aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(message, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const wrappedKey = publicEncrypt(
    { key: recipientPublicKeyPem, padding: cryptoConstants.RSA_PKCS1_OAEP_PADDING, oaepHash },
    aesKey,
  );

  const payload = Buffer.concat([wrappedKey, iv, ciphertext, tag]);
  return `${BEGIN_TAG}\r\n${chunkSplit(payload.toString("base64"))}${END_TAG}`;
}

/** Reverses {@link encryptKycMessage} using the matching RSA private key. */
export function decryptKycMessage(message: string, privateKeyPem: string, oaepHash = "sha256"): string {
  const body = message
    .replace(BEGIN_TAG, "")
    .replace(END_TAG, "")
    .replace(/[\r\n\s]/g, "");
  const payload = Buffer.from(body, "base64");

  const wrappedKey = payload.subarray(0, RSA_WRAPPED_KEY_LENGTH);
  const rest = payload.subarray(RSA_WRAPPED_KEY_LENGTH);
  const iv = rest.subarray(0, GCM_IV_LENGTH);
  const tag = rest.subarray(rest.length - GCM_TAG_LENGTH);
  const ciphertext = rest.subarray(GCM_IV_LENGTH, rest.length - GCM_TAG_LENGTH);

  const aesKey = privateDecrypt(
    { key: privateKeyPem, padding: cryptoConstants.RSA_PKCS1_OAEP_PADDING, oaepHash },
    wrappedKey,
  );

  const decipher = createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
