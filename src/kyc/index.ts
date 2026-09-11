import type { SatuSehatClient } from "../core/client.js";
import { decryptKycMessage, encryptKycMessage, generateKycKeyPair } from "./crypto.js";

export { generateKycKeyPair, encryptKycMessage, decryptKycMessage } from "./crypto.js";
export type { KycKeyPair } from "./crypto.js";

/** KYC base URL lives under the staging host per the source collection. */
function kycBase(client: SatuSehatClient, override?: string): string {
  return (override ?? client.config.kycBaseUrl).replace(/\/$/, "");
}

export interface GenerateUrlOptions {
  /** Override the KYC base URL (defaults to `client.config.kycBaseUrl`) */
  baseUrl?: string;
  /** RSA-OAEP hash used for the envelope (default `"sha256"`, matching SATU SEHAT's official phpseclib3 client) */
  oaepHash?: string;
}

/**
 * POST {kycBaseUrl}/generate-url — mint the KYC URL for a facility.
 *
 * SATU SEHAT's envelope (confirmed from the official PHP client): generate a
 * fresh RSA keypair, send `{agent_name, agent_nik, public_key}` (the *new*
 * public key, not `satuSehatPublicKey`) RSA-OAEP+AES-256-GCM-encrypted with
 * SATU SEHAT's own public key, as `text/plain`; the response comes back
 * encrypted with that same fresh public key, so this function decrypts it
 * with the matching private key before returning. `satuSehatPublicKey` is
 * SATU SEHAT's published KYC encryption key (not a secret you generate).
 *
 * The returned `privateKey` (the ephemeral keypair's, not `satuSehatPublicKey`'s
 * pair) must be passed into `generateChallengeCode()` along with `data.token`
 * as `frameToken` — the server encrypts that later reply with this same
 * agent key, identified by the frame token, and no new key can be registered
 * for the challenge-code call itself. Confirmed live.
 */
export async function generateKycUrl(
  client: SatuSehatClient,
  params: { agentName: string; agentNik: string; satuSehatPublicKey: string },
  options: GenerateUrlOptions = {},
): Promise<{ data: unknown; privateKey: string }> {
  const { publicKey, privateKey } = generateKycKeyPair();
  const plaintext = JSON.stringify({
    agent_name: params.agentName,
    agent_nik: params.agentNik,
    public_key: publicKey,
  });
  const encryptedBody = encryptKycMessage(plaintext, params.satuSehatPublicKey, options.oaepHash);

  const response = await client.requestUrl("POST", `${kycBase(client, options.baseUrl)}/generate-url`, {
    body: encryptedBody,
    headers: { "Content-Type": "text/plain" },
  });

  const decrypted = decryptKycMessage(String(response), privateKey, options.oaepHash);
  return { data: JSON.parse(decrypted), privateKey };
}

export interface ChallengeCodeOptions {
  /** `X-Debug-Mode: 1` — the collection's "Debug" variant sets this */
  debugMode?: boolean;
  baseUrl?: string;
  /** RSA-OAEP hash used for the envelope (default `"sha256"`) */
  oaepHash?: string;
}

/**
 * POST {kycBaseUrl}/challenge-code — request a KYC challenge code per NIK.
 *
 * Confirmed live: needs the same RSA+AES-GCM envelope as `generate-url` (not
 * plain JSON as the docs describe — that gets a real `400 "Failed to decrypt
 * message"`), but *without* a `public_key` in the body — the server encrypts
 * the reply using the agent's key already registered via `generate-url`,
 * identified by `frameToken` (the `token` field from that response), which
 * this function requires and sends as `X-Frame-Token`. So this must be called
 * with the same `satuSehatPublicKey` used for the matching `generate-url`
 * call, and its response decrypts with *that same* ephemeral private key —
 * hence `privateKey` (from that earlier call's keypair) is required here too.
 */
export async function generateChallengeCode(
  client: SatuSehatClient,
  params: {
    metadata: { method: "request_per_nik"; [key: string]: unknown };
    data: { nik: string; name: string; [key: string]: unknown };
    satuSehatPublicKey: string;
    /** The `token` field from the matching `generateKycUrl()` response. */
    frameToken: string;
    /** The `privateKey` from the same ephemeral keypair used in the matching `generateKycUrl()` call. */
    privateKey: string;
  },
  options: ChallengeCodeOptions = {},
): Promise<unknown> {
  const plaintext = JSON.stringify({ metadata: params.metadata, data: params.data });
  const encryptedBody = encryptKycMessage(plaintext, params.satuSehatPublicKey, options.oaepHash);

  const headers: Record<string, string> = { "Content-Type": "text/plain", "X-Frame-Token": params.frameToken };
  if (options.debugMode) headers["X-Debug-Mode"] = "1";

  const response = await client.requestUrl("POST", `${kycBase(client, options.baseUrl)}/challenge-code`, {
    body: encryptedBody,
    headers,
  });

  const decrypted = decryptKycMessage(String(response), params.privateKey, options.oaepHash);
  return JSON.parse(decrypted);
}
