import type { SatuSehatClient } from "../core/client.js";
import { openHpkeMessage, type HpkeOptions, type HpkeSuite } from "../core/hpke.js";
import { markUnbound } from "../core/unbound.js";

/**
 * Katalog Webhook (Klaim Swasta) — payloads the SATUSEHAT claim platform
 * delivers to the subscriber's own webhook URL. The Postman folder contains
 * request *examples* posted to `{{webhook_url}}`, i.e. your endpoint receives
 * these; this module gives you typed readers instead of an outbound call.
 *
 * The portal encrypts every webhook body under HPKE (RFC 9180, Auth or
 * AuthPSK mode): use `createWebhookHandler` / `decryptWebhook` below; see
 * `wiki/Webhook-Encryption.md` for keys, suite selection, and PSK handling.
 */

export type WebhookMethod =
  | "coverageEligibilityResponseSubmission"
  | "chargeItemSubmission"
  | "chargeItemResponseSubmission"
  | "billingStatusSubmission"
  | "claimBundle"
  | "claimResponseSubmission"
  | "paymentNoticeSubmission"
  | "paymentReconciliationSubmission";

export interface SatuSehatWebhookPayload<T = Record<string, unknown>> {
  data: { fhir: T; [key: string]: unknown };
  meta: { method: WebhookMethod | string; [key: string]: unknown };
  transaction_id: string;
  timestamp: string;
  [key: string]: unknown;
}

/** Narrow a raw webhook body by `meta.method` (unknown methods still parse). */
export function parseWebhookPayload(
  raw: unknown,
): SatuSehatWebhookPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  if (!body.data || !body.meta) return null;
  return body as SatuSehatWebhookPayload;
}

/** Parse a webhook body whose `meta.method` matches `method`, else return null. */
export function parseWebhookPayloadAs<T = Record<string, unknown>>(
  raw: unknown,
  method: WebhookMethod,
): SatuSehatWebhookPayload<T> | null {
  const parsed = parseWebhookPayload(raw);
  if (!parsed || parsed.meta.method !== method) return null;
  return parsed as SatuSehatWebhookPayload<T>;
}

/**
 * Webhook callbacks must be acknowledged by POSTing the same envelope to the
 * `callback_url` SATUSEHAT provides in the handshake response.
 */
export async function sendWebhookCallback(
  client: SatuSehatClient,
  callbackUrl: string,
  payload: SatuSehatWebhookPayload,
): Promise<unknown> {
  return client.requestUrl("POST", callbackUrl, {
    auth: false,
    body: payload as unknown as Record<string, unknown>,
  });
}

/** Values from the portal's "Aktivasi Enkripsi" step; all keys raw base64. */
export interface WebhookEncryptionConfig {
  suite: HpkeSuite;
  /** Your HPKE private key (`HPKE_PRIVATE_KEY`) — never leaves your server. */
  privateKey: string;
  /** SATUSEHAT's HPKE public key (`HPKE_SATUSEHAT_PUBLIC_KEY`). */
  satusehatPublicKey: string;
  /** Set when the portal issued a Pre-shared Key → AuthPSK mode. */
  psk?: HpkeOptions["psk"];
  aad?: HpkeOptions["aad"];
}

export interface DecryptedWebhook {
  plaintext: string;
  /** `JSON.parse(plaintext)`, or `undefined` when the plaintext isn't JSON. */
  json: unknown;
  /** `parseWebhookPayload(json)` — null when it isn't a SATUSEHAT envelope. */
  payload: SatuSehatWebhookPayload | null;
}

/**
 * Decrypt a webhook body. Expects the raw request body to be the HPKE
 * message itself, `base64(enc || ciphertext)` — the shape the portal's
 * encryption test produces. Throws if the message doesn't authenticate.
 */
export function decryptWebhook(body: string, config: WebhookEncryptionConfig): DecryptedWebhook {
  const plaintext = openHpkeMessage(body.trim(), config.privateKey, config.satusehatPublicKey, config.suite, {
    psk: config.psk,
    aad: config.aad,
  }).toString("utf8");
  let json: unknown;
  try {
    json = JSON.parse(plaintext);
  } catch {
    json = undefined;
  }
  return { plaintext, json, payload: parseWebhookPayload(json) };
}

/**
 * Fetch-API webhook endpoint: `(Request) => Promise<Response>`. Plugs into
 * Next.js route handlers (`export const POST = handler`), Hono
 * (`c => handler(c.req.raw)`), Bun, Deno and Workers. Express: call
 * `decryptWebhook(req.body, config)` behind `express.text({ type: () => true })`.
 *
 * 400 when the body doesn't decrypt (forged, wrong keys/PSK/suite), 500 when
 * `onWebhook` throws, otherwise `onWebhook`'s Response or 200 `{"status":"ok"}`.
 */
export function createWebhookHandler(
  config: WebhookEncryptionConfig & {
    onWebhook: (event: DecryptedWebhook, request: Request) => unknown | Promise<unknown>;
  },
): (request: Request) => Promise<Response> {
  return async (request) => {
    let event: DecryptedWebhook;
    try {
      event = decryptWebhook(await request.text(), config);
    } catch {
      return jsonResponse({ status: "error", message: "invalid encrypted payload" }, 400);
    }
    try {
      const result = await config.onWebhook(event, request);
      return result instanceof Response ? result : jsonResponse({ status: "ok" }, 200);
    } catch {
      return jsonResponse({ status: "error" }, 500);
    }
  };
}

// `Response.json()` is missing on early Node 18 releases.
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

markUnbound(parseWebhookPayload, parseWebhookPayloadAs, decryptWebhook, createWebhookHandler);
