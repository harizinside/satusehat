import type { SatuSehatClient } from "../core/client.js";

export interface PriceJknParams {
  page?: number;
  limit?: number;
  /** KFA code, e.g. "92000372" */
  kfaCode?: string;
  regionCode?: string;
  documentRef?: string;
}

/**
 * GET /kfa/farmalkes-price-jkn — JKN price list for farmasi & alkes.
 * No example response ships in the collection; return type is `unknown`.
 */
export async function getPriceJkn(
  client: SatuSehatClient,
  params: PriceJknParams = {},
): Promise<unknown> {
  return client.requestMasterData("GET", "/kfa/farmalkes-price-jkn", {
    query: {
      page: params.page,
      limit: params.limit,
      kfa_code: params.kfaCode,
      region_code: params.regionCode,
      document_ref: params.documentRef,
    },
  });
}
