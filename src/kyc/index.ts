import type { SatuSehatClient } from "../core/client.js";

/** KYC base URL lives under the staging host per the source collection. */
function kycBase(client: SatuSehatClient, override?: string): string {
  return (override ?? client.config.kycBaseUrl).replace(/\/$/, "");
}

export interface GenerateUrlOptions {
  /** Override the KYC base URL (defaults to `client.config.kycBaseUrl`) */
  baseUrl?: string;
}

/**
 * POST {kycBaseUrl}/generate-url — mint the encrypted KYC URL for a facility.
 *
 * The request body is a fully-formed `-----BEGIN ENCRYPTED MESSAGE-----` block
 * produced by the facility's own encryption flow (JWE), so the SDK sends it
 * verbatim: pass either the complete string (recommended) or a JSON object.
 */
export async function generateKycUrl(
  client: SatuSehatClient,
  encryptedBody: string | object,
  options: GenerateUrlOptions = {},
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (typeof encryptedBody === "string") {
    headers["Content-Type"] = "text/plain";
  }
  return client.requestUrl("POST", `${kycBase(client, options.baseUrl)}/generate-url`, {
    body: encryptedBody,
    headers,
  });
}

export interface ChallengeCodeRequest {
  /**
   * `method` is confirmed (live + docs) to always be `"request_per_nik"` —
   * the only value the server currently accepts, per the official KYC docs
   * ("currently contains only a static value"). `data` itself must be
   * encrypted the same way as `generateKycUrl`'s body — sending plain JSON
   * gets a real `400 "Failed to decrypt message"`, confirmed live.
   */
  metadata: { method: "request_per_nik"; [key: string]: unknown };
  data: { nik: string; name: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface ChallengeCodeOptions {
  /** `X-Debug-Mode: 1` — the collection's "Debug" variant sets this */
  debugMode?: boolean;
  /** `X-Frame-Token` from a previous `generateKycUrl` response */
  frameToken?: string;
  baseUrl?: string;
}

/**
 * POST {kycBaseUrl}/challenge-code — request a KYC challenge code per NIK.
 * The collection's debug variant sends `X-Debug-Mode: 1` plus `X-Frame-Token`.
 */
export async function generateChallengeCode(
  client: SatuSehatClient,
  body: ChallengeCodeRequest,
  options: ChallengeCodeOptions = {},
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (options.debugMode) headers["X-Debug-Mode"] = "1";
  if (options.frameToken) headers["X-Frame-Token"] = options.frameToken;
  return client.requestUrl("POST", `${kycBase(client, options.baseUrl)}/challenge-code`, {
    body,
    headers,
  });
}
