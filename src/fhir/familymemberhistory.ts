/**
 * fhir/familymemberhistory — hand-written from the official SATU SEHAT API
 * docs (api-catalogue/integrations/apis/family-member-history). The body
 * shape is cross-checked against the real example already used by
 * rawat-jalan/anamnesis.ts's FamilyMemberHistory call, since a real example
 * does exist in the Rawat Jalan collection (unlike the scheduling resources).
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

export interface FamilyMemberHistoryInput {
  resourceType: "FamilyMemberHistory";
  status?: string;
  relationship: {
    coding?: Array<Record<string, unknown>>;
  };
  patient: {
    reference?: string;
    display?: string;
  };
  deceasedBoolean?: boolean;
  date?: string;
  condition?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface FamilyMemberHistorySearchParams {
  /** Patient ID, e.g. `100000000001` */
  patient?: string;
  /** Relationship code (e.g. SNOMED `72705000`) */
  relationship?: string;
}

/** GET /FamilyMemberHistory */
export async function searchFamilyMemberHistory(
  client: SatuSehatClient,
  params: FamilyMemberHistorySearchParams = {},
): Promise<FhirBundle<"FamilyMemberHistory">> {
  return client.request("GET", "/FamilyMemberHistory", { query: { ...params } }) as Promise<
    FhirBundle<"FamilyMemberHistory">
  >;
}

/** GET /FamilyMemberHistory/{id} */
export async function getFamilyMemberHistoryById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"FamilyMemberHistory">> {
  return client.request("GET", `/FamilyMemberHistory/${encodeURIComponent(id)}`) as Promise<
    FhirResource<"FamilyMemberHistory">
  >;
}

/** POST /FamilyMemberHistory */
export async function createFamilyMemberHistory(
  client: SatuSehatClient,
  body: FamilyMemberHistoryInput,
): Promise<FhirResource<"FamilyMemberHistory">> {
  return client.request("POST", "/FamilyMemberHistory", { body }) as Promise<
    FhirResource<"FamilyMemberHistory">
  >;
}

/** PUT /FamilyMemberHistory/{id} */
export async function updateFamilyMemberHistory(
  client: SatuSehatClient,
  id: string,
  body: FamilyMemberHistoryInput,
): Promise<FhirResource<"FamilyMemberHistory">> {
  return client.request("PUT", `/FamilyMemberHistory/${encodeURIComponent(id)}`, { body }) as Promise<
    FhirResource<"FamilyMemberHistory">
  >;
}

/** PATCH /FamilyMemberHistory/{id} */
export async function patchFamilyMemberHistory(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource<"FamilyMemberHistory">> {
  return client.request("PATCH", `/FamilyMemberHistory/${encodeURIComponent(id)}`, {
    body: operations,
  }) as Promise<FhirResource<"FamilyMemberHistory">>;
}
