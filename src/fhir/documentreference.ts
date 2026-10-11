/**
 * fhir/documentreference — generic DocumentReference operations.
 *
 * Hand-written (not generated) so the shape is stable even if the source
 * Postman collection moves or is removed. The Farmasi flow creates one to
 * obtain a No. Resep Nasional, but the resource is general — anything that
 * needs to upload/attach a clinical document (resep, hasil lab, surat
 * rujukan, ...) uses this same endpoint.
 *
 * - `documentreferenceCreate` → POST /DocumentReference
 * - `documentreferenceById` → GET /DocumentReference/:id
 * - `documentreferenceSearch` → GET /DocumentReference (identifier, _include, ...)
 * - `documentreferenceUpdate` → PUT /DocumentReference/:id
 * - `documentreferencePatch` → PATCH /DocumentReference/:id
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

/** POST /DocumentReference request body. The fields below are the ones the
 * Farmasi collection's example bodies exercise; per-call examples may carry
 * more (e.g. `relatesTo`, `securityLabel`, ...) and the SDK passes them
 * through unchanged via the `body` argument's structural type. */
export interface DocumentreferenceCreateBody {
  resourceType?: string;
  identifier?: Array<Record<string, unknown>>;
  status?: string;
  docStatus?: string;
  type: {
    coding?: Array<Record<string, unknown>>;
  };
  category?: Array<Record<string, unknown>>;
  subject: {
    reference?: string;
    display?: string;
  };
  date?: string;
  author?: Array<Record<string, unknown>>;
  custodian: {
    reference?: string;
    display?: string;
  };
  description?: string;
  // `content` is mandatory server-side (confirmed live, farmasi smoke
  // 2026-09-24): the server rejects POSTs without at least one entry with
  // `400 missing required field "content"`. For Farmasi/e-Resep this is the
  // PDF/canonical URL of the prescription; for any other DocumentReference
  // flow it carries whatever the resource describes.
  content: Array<Record<string, unknown>>;
  context?: {
    encounter?: Array<Record<string, unknown>>;
    related?: Array<Record<string, unknown>>;
  };
}

/** POST /DocumentReference — returns the created resource (server assigns the id). */
export async function documentreferenceCreate(
  client: SatuSehatClient,
  body: DocumentreferenceCreateBody,
): Promise<FhirResource<"DocumentReference">> {
  return client.request("POST", "/DocumentReference", {
    body: body as unknown as Record<string, unknown>,
  }) as Promise<FhirResource<"DocumentReference">>;
}

/** GET /DocumentReference/:id — fetch by SATU SEHAT resource id. */
export async function documentreferenceById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"DocumentReference">> {
  return client.request("GET", `/DocumentReference/${encodeURIComponent(id)}`) as Promise<
    FhirResource<"DocumentReference">
  >;
}

/**
 * GET /DocumentReference — searchset Bundle. For the Farmasi lookup use
 * `identifier=<http://sys-ids.kemkes.go.id/prescription/national|<no>>&_include=DocumentReference:related`
 * (the `nationalPrescriptionIdentifier()` helper in `coding/identifiers.ts`
 * builds that `identifier` value).
 */
export interface DocumentreferenceSearchParams {
  identifier?: string | number;
  subject?: string | number;
  custodian?: string | number;
  type?: string | number;
  category?: string | number;
  status?: string | number;
  /** Repeated `_include` joined by comma, e.g. `"DocumentReference:related,DocumentReference:patient"`. */
  _include?: string | number;
  _id?: string | number;
  _count?: number;
  [key: string]: string | number | undefined;
}

export async function documentreferenceSearch(
  client: SatuSehatClient,
  params: DocumentreferenceSearchParams = {},
): Promise<FhirBundle<"DocumentReference">> {
  const query: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query[key] = value;
  }
  return client.request("GET", "/DocumentReference", { query }) as Promise<
    FhirBundle<"DocumentReference">
  >;
}

/** PUT /DocumentReference/:id — full update. */
export async function documentreferenceUpdate(
  client: SatuSehatClient,
  id: string,
  body: DocumentreferenceCreateBody,
): Promise<FhirResource> {
  return client.request("PUT", `/DocumentReference/${encodeURIComponent(id)}`, {
    body: body as unknown as Record<string, unknown>,
  }) as Promise<FhirResource>;
}

/** PATCH /DocumentReference/:id — JSON Patch (content-type fixed globally). */
export async function documentreferencePatch(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource> {
  return client.request("PATCH", `/DocumentReference/${encodeURIComponent(id)}`, {
    body: operations,
  }) as Promise<FhirResource>;
}
