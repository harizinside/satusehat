import type { SatuSehatClient } from "../core/client.js";

export interface Region {
  code: string;
  parent_code: string;
  bps_code: string;
  name: string;
  [key: string]: unknown;
}

/** Shape shared by all Master Data wilayah responses (observed in collection.json). */
export interface RegionListResult {
  status: number;
  error: boolean;
  message: string;
  data: Region[];
  meta?: {
    item_count?: number;
    page?: {
      is_cursor?: boolean;
      current?: number;
      previous?: number;
      next?: number;
      limit?: number;
      total_page?: number;
      total?: number;
    };
    cursors?: { next?: string; previous?: string };
  };
  [key: string]: unknown;
}

/** GET /masterdata/v1/provinces?codes=11,12 */
export async function getProvinces(
  client: SatuSehatClient,
  params: { codes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v1/provinces", {
    query: { codes: params.codes },
  }) as Promise<RegionListResult>;
}

/** GET /masterdata/v1/cities?province_codes=11,12[&codes=...] */
export async function getCities(
  client: SatuSehatClient,
  params: { provinceCodes?: string; codes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v1/cities", {
    query: { province_codes: params.provinceCodes, codes: params.codes },
  }) as Promise<RegionListResult>;
}

/** GET /masterdata/v1/districts?city_codes=1103,1104[&codes=...] */
export async function getDistricts(
  client: SatuSehatClient,
  params: { cityCodes?: string; codes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v1/districts", {
    query: { city_codes: params.cityCodes, codes: params.codes },
  }) as Promise<RegionListResult>;
}

/** GET /masterdata/v1/sub-districts?district_codes=110301,110302[&codes=...] */
export async function getSubDistricts(
  client: SatuSehatClient,
  params: { districtCodes?: string; codes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v1/sub-districts", {
    query: { district_codes: params.districtCodes, codes: params.codes },
  }) as Promise<RegionListResult>;
}

export interface RegionPageParams {
  /** `current_page` query parameter (1-based) */
  currentPage?: number;
  /** Opaque cursor for the next page (`next` in the collection) */
  next?: string;
  /** Opaque cursor for the previous page (`prev` in the collection) */
  prev?: string;
  codes?: string;
}

/** GET /masterdata/v2/provinces — paginated (cursor) variant */
export async function getProvincesV2(
  client: SatuSehatClient,
  params: RegionPageParams = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v2/provinces", {
    query: {
      current_page: params.currentPage,
      next: params.next,
      prev: params.prev,
      codes: params.codes,
    },
  }) as Promise<RegionListResult>;
}

/** GET /masterdata/v2/cities — paginated (cursor) variant */
export async function getCitiesV2(
  client: SatuSehatClient,
  params: RegionPageParams & { provinceCodes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v2/cities", {
    query: {
      current_page: params.currentPage,
      next: params.next,
      prev: params.prev,
      province_codes: params.provinceCodes,
      codes: params.codes,
    },
  }) as Promise<RegionListResult>;
}

/** GET /masterdata/v2/districts — paginated (cursor) variant */
export async function getDistrictsV2(
  client: SatuSehatClient,
  params: RegionPageParams & { cityCodes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v2/districts", {
    query: {
      current_page: params.currentPage,
      next: params.next,
      prev: params.prev,
      city_codes: params.cityCodes,
      codes: params.codes,
    },
  }) as Promise<RegionListResult>;
}

/** GET /masterdata/v2/sub-districts — paginated (cursor) variant */
export async function getSubDistrictsV2(
  client: SatuSehatClient,
  params: RegionPageParams & { districtCodes?: string } = {},
): Promise<RegionListResult> {
  return client.requestMasterData("GET", "/masterdata/v2/sub-districts", {
    query: {
      current_page: params.currentPage,
      next: params.next,
      prev: params.prev,
      district_codes: params.districtCodes,
      codes: params.codes,
    },
  }) as Promise<RegionListResult>;
}
