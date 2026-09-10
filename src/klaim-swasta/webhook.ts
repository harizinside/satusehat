import type { SatuSehatClient } from "../core/client.js";

/**
 * Katalog Webhook (Klaim Swasta) — payloads the SATUSEHAT claim platform
 * delivers to the subscriber's own webhook URL. The Postman folder contains
 * request *examples* posted to `{{webhook_url}}`, i.e. your endpoint receives
 * these; this module gives you typed readers instead of an outbound call.
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
