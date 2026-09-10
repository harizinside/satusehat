import type { SatuSehatClient } from "../core/client.js";

export interface AlkesPageBody {
  page?: number;
  size?: number;
  [key: string]: unknown;
}

/**
 * POST /kfa-v3/alkes/template — Alkes V3 product templates.
 *
 * CAVEAT (verbatim from the source collection): these two requests carry a
 * hardcoded `Authorization: Basic ...` header instead of the platform's usual
 * OAuth2 Bearer token, and reference an internal-only host. They are
 * implemented exactly as the collection ships them, but may not be usable
 * from outside Kemkes' network.
 *
 * Because the Basic credential is baked into the collection, this SDK version
 * sends the configured OAuth2 Bearer token by default and lets you override
 * the `Authorization` header explicitly (see `options.authorization`).
 */
export async function getAlkesTemplates(
  client: SatuSehatClient,
  body: AlkesPageBody = { page: 1, size: 10 },
  options: { authorization?: string; baseUrl?: string } = {},
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (options.authorization) headers.Authorization = options.authorization;
  const base = (options.baseUrl ?? client.config.masterDataBaseUrl).replace(/\/$/, "");
  return client.requestUrl("POST", `${base}/kfa-v3/alkes/template`, {
    body,
    headers,
  });
}

/** POST /kfa-v3/alkes/products — Alkes V3 product variants. See the Basic-auth caveat above. */
export async function getAlkesProducts(
  client: SatuSehatClient,
  body: AlkesPageBody = { page: 1, size: 10 },
  options: { authorization?: string; baseUrl?: string } = {},
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (options.authorization) headers.Authorization = options.authorization;
  const base = (options.baseUrl ?? client.config.masterDataBaseUrl).replace(/\/$/, "");
  return client.requestUrl("POST", `${base}/kfa-v3/alkes/products`, {
    body,
    headers,
  });
}
