import type { SatuSehatClient } from "../core/client.js";

export interface MasterSarana {
  kode_satusehat: string;
  kode_sarana: string;
  nama: string;
  telp?: string | null;
  email?: string | null;
  website?: string | null;
  longitude?: string | number | null;
  latitude?: string | number | null;
  operasional?: boolean;
  alamat?: string;
  sarana_administrasi?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Observed response shape of GET /masterdata/v1/mastersaranaindex/mastersarana */
export interface MasterSaranaResult {
  status_code: number;
  message: string;
  page: number;
  total_page: number;
  data: MasterSarana[];
  [key: string]: unknown;
}

export interface MasterSaranaParams {
  limit?: number;
  page?: number;
  lowerBoundUpdatedAt?: string;
  upperBoundUpdatedAt?: string;
  kodeSatusehat?: string;
  kodeSarana?: string;
  /** e.g. "138" */
  jenisSarana?: string;
  nama?: string;
  kodeProvinsi?: string;
  kodeKabkota?: string;
  kodeKecamatan?: string;
  statusAktif?: boolean;
  /** e.g. "verified" */
  statusSarana?: string;
  /** e.g. "sisdmk_sarana" */
  sumberIdentifier?: string;
  identifierKodeSarana?: string;
}

/**
 * GET /masterdata/v1/mastersaranaindex/mastersarana — facility (sarana) index
 * from SATUSEHAT Master Data.
 */
export async function getMasterSarana(
  client: SatuSehatClient,
  params: MasterSaranaParams = {},
): Promise<MasterSaranaResult> {
  return client.requestMasterData("GET", "/masterdata/v1/mastersaranaindex/mastersarana", {
    query: {
      limit: params.limit,
      page: params.page,
      lower_bound_updated_at: params.lowerBoundUpdatedAt,
      upper_bound_updated_at: params.upperBoundUpdatedAt,
      kode_satusehat: params.kodeSatusehat,
      kode_sarana: params.kodeSarana,
      jenis_sarana: params.jenisSarana,
      nama: params.nama,
      kode_provinsi: params.kodeProvinsi,
      kode_kabkota: params.kodeKabkota,
      kode_kecamatan: params.kodeKecamatan,
      status_aktif: params.statusAktif,
      status_sarana: params.statusSarana,
      sumber_identifier: params.sumberIdentifier,
      identifier_kode_sarana: params.identifierKodeSarana,
    },
  }) as Promise<MasterSaranaResult>;
}
