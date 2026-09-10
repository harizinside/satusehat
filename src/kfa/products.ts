import type { SatuSehatClient } from "../core/client.js";

export interface KfaListParams {
  page?: number;
  size?: number;
}

export interface KfaProductListResult {
  pagination?: Record<string, unknown>;
  item_data?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

/**
 * @deprecated Confirmed dead: returns a real `404 Not Found` against the live
 * server, and the current official KFA docs (platform/docs/id/master-data/kfa/rest-api-kfa)
 * no longer list this endpoint at all — ATC data now comes back as fields
 * inside `getProductDetailV2`/`getAllProductsV2` responses instead. Kept here
 * (matching the original collection.json example it was generated from)
 * rather than silently deleted, but do not use for new code.
 *
 * GET /kfa/atc?page=1&size=50 — ATC metadata
 */
export async function getAtcMetadata(
  client: SatuSehatClient,
  params: KfaListParams = {},
): Promise<KfaProductListResult> {
  return client.requestMasterData("GET", "/kfa/atc", {
    query: { page: params.page, size: params.size },
  }) as Promise<KfaProductListResult>;
}

export interface KfaProductByAtcParams extends KfaListParams {
  /** e.g. "L" */
  atcCode?: string;
  /** e.g. 1 */
  level?: number;
}

/**
 * @deprecated Confirmed dead — see `getAtcMetadata`'s note; same 404,
 * same missing-from-current-docs status. Use `getAllProductsV2` instead.
 *
 * GET /kfa/products/atc — products filtered by ATC code
 */
export async function getProductsByAtc(
  client: SatuSehatClient,
  params: KfaProductByAtcParams = {},
): Promise<KfaProductListResult> {
  return client.requestMasterData("GET", "/kfa/products/atc", {
    query: { page: params.page, size: params.size, atc_code: params.atcCode, level: params.level },
  }) as Promise<KfaProductListResult>;
}

/**
 * @deprecated Confirmed dead — see `getAtcMetadata`'s note; same 404,
 * same missing-from-current-docs status.
 *
 * GET /kfa/tags — tag metadata
 */
export async function getTagMetadata(
  client: SatuSehatClient,
  params: KfaListParams = {},
): Promise<KfaProductListResult> {
  return client.requestMasterData("GET", "/kfa/tags", {
    query: { page: params.page, size: params.size },
  }) as Promise<KfaProductListResult>;
}

export interface KfaProductByTagParams extends KfaListParams {
  /** e.g. "kanker" */
  tagCode?: string;
  /** e.g. 1 */
  level?: number;
}

/**
 * @deprecated Not directly tested (untested sibling of getProductsByAtc,
 * same /kfa/products/... family, same 404 expected) — see `getAtcMetadata`'s
 * note. Use `getAllProductsV2` instead.
 *
 * GET /kfa/products/tag — products filtered by tag
 */
export async function getProductsByTag(
  client: SatuSehatClient,
  params: KfaProductByTagParams = {},
): Promise<KfaProductListResult> {
  return client.requestMasterData("GET", "/kfa/products/tag", {
    query: { page: params.page, size: params.size, tag_code: params.tagCode, level: params.level },
  }) as Promise<KfaProductListResult>;
}

export interface KfaProductDetailParams {
  /** e.g. "kfa" */
  identifier?: string;
  /** KFA code, e.g. "93000108" */
  code?: string;
}

/** GET /kfa-v2/products?identifier=kfa&code=... — product detail */
export async function getProductDetailV2(
  client: SatuSehatClient,
  params: KfaProductDetailParams = {},
): Promise<KfaProductListResult> {
  return client.requestMasterData("GET", "/kfa-v2/products", {
    query: { identifier: params.identifier, code: params.code },
  }) as Promise<KfaProductListResult>;
}

export interface KfaProductAllParams extends KfaListParams {
  /** e.g. "farmasi" */
  productType?: string;
}

/** GET /kfa-v2/products/all — all products, paginated */
export async function getAllProductsV2(
  client: SatuSehatClient,
  params: KfaProductAllParams = {},
): Promise<KfaProductListResult> {
  return client.requestMasterData("GET", "/kfa-v2/products/all", {
    query: { page: params.page, size: params.size, product_type: params.productType },
  }) as Promise<KfaProductListResult>;
}
