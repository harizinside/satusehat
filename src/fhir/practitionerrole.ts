/**
 * fhir/practitionerrole — hand-written from the official SATU SEHAT API docs
 * (api-catalogue/integrations/apis/practitioner-role).
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

export interface PractitionerRoleInput {
  resourceType: "PractitionerRole";
  active?: boolean;
  practitioner?: { reference?: string };
  organization?: { reference?: string };
  code?: Array<Record<string, unknown>>;
  specialty?: Array<Record<string, unknown>>;
  period?: { start?: string; end?: string };
  [key: string]: unknown;
}

export interface PractitionerRoleSearchParams {
  /** Practitioner ID, e.g. `N10000001` */
  practitioner?: string;
  /** Organization ID */
  organization?: string;
}

/** GET /PractitionerRole */
export async function searchPractitionerRole(
  client: SatuSehatClient,
  params: PractitionerRoleSearchParams = {},
): Promise<FhirBundle<"PractitionerRole">> {
  return client.request("GET", "/PractitionerRole", { query: { ...params } }) as Promise<
    FhirBundle<"PractitionerRole">
  >;
}

/** GET /PractitionerRole/{id} */
export async function getPractitionerRoleById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"PractitionerRole">> {
  return client.request("GET", `/PractitionerRole/${encodeURIComponent(id)}`) as Promise<
    FhirResource<"PractitionerRole">
  >;
}

/** POST /PractitionerRole */
export async function createPractitionerRole(
  client: SatuSehatClient,
  body: PractitionerRoleInput,
): Promise<FhirResource<"PractitionerRole">> {
  return client.request("POST", "/PractitionerRole", { body }) as Promise<FhirResource<"PractitionerRole">>;
}

/** PUT /PractitionerRole/{id} */
export async function updatePractitionerRole(
  client: SatuSehatClient,
  id: string,
  body: PractitionerRoleInput,
): Promise<FhirResource<"PractitionerRole">> {
  return client.request("PUT", `/PractitionerRole/${encodeURIComponent(id)}`, { body }) as Promise<
    FhirResource<"PractitionerRole">
  >;
}

/** PATCH /PractitionerRole/{id} */
export async function patchPractitionerRole(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource<"PractitionerRole">> {
  return client.request("PATCH", `/PractitionerRole/${encodeURIComponent(id)}`, {
    body: operations,
  }) as Promise<FhirResource<"PractitionerRole">>;
}
