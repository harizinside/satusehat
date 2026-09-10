import type { SatuSehatClient } from "../core/client.js";

export interface RmeLinkInput {
  /** SATUSEHAT Patient id, e.g. "P20396164684" */
  patient_id: string;
  patient_name: string;
  /** SATUSEHAT Practitioner id */
  practitioner_id: string;
  practitioner_name: string;
  /** SATUSEHAT Organization id */
  organization_id: string;
  organization_name: string;
  [key: string]: unknown;
}

function rmeUrl(client: SatuSehatClient, path: string, baseUrl?: string): string {
  const base = (baseUrl ?? client.config.rmeBaseUrl).replace(/\/$/, "");
  return `${base}/ssrme/v2/ntl/${path}`;
}

export interface RmeOptions {
  /** Override the RME host (defaults to `client.config.rmeBaseUrl`) */
  baseUrl?: string;
}

/**
 * POST {baseUrl}/ssrme/v2/ntl/chl — "Membuat consent health link":
 * create the patient's consented health link into the national RME.
 */
export async function createHealthLink(
  client: SatuSehatClient,
  body: RmeLinkInput,
  options: RmeOptions = {},
): Promise<unknown> {
  return client.requestUrl("POST", rmeUrl(client, "chl", options.baseUrl), { body });
}

/**
 * POST {baseUrl}/ssrme/v2/ntl/shl — "Membuka RME Nasional": open the
 * national RME for the patient (returns the deep-link payload).
 */
export async function showHealthLink(
  client: SatuSehatClient,
  body: RmeLinkInput,
  options: RmeOptions = {},
): Promise<unknown> {
  return client.requestUrl("POST", rmeUrl(client, "shl", options.baseUrl), { body });
}
