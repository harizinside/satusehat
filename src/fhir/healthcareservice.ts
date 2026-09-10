/**
 * fhir/healthcareservice — hand-written from the official SATU SEHAT API docs
 * (api-catalogue/integrations/apis/healthcare-service), not the Postman
 * collections (no HealthcareService example ships in any of them). Bodies
 * are loosely typed since the docs only show `{"resourceType": "HealthcareService"}`
 * and defer to Postman for the full shape.
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

export interface HealthcareServiceInput {
  resourceType: "HealthcareService";
  active?: boolean;
  providedBy?: { reference?: string };
  location?: Array<{ reference?: string }>;
  name?: string;
  type?: Array<Record<string, unknown>>;
  specialty?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface HealthcareServiceSearchParams {
  /** e.g. `S001.09` (Kemkes clinical-speciality code) */
  specialty?: string;
  active?: boolean;
  organization?: string;
  location?: string;
}

/** GET /HealthcareService */
export async function searchHealthcareService(
  client: SatuSehatClient,
  params: HealthcareServiceSearchParams = {},
): Promise<FhirBundle<"HealthcareService">> {
  return client.request("GET", "/HealthcareService", {
    query: { ...params },
  }) as Promise<FhirBundle<"HealthcareService">>;
}

/** GET /HealthcareService/{id} */
export async function getHealthcareServiceById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"HealthcareService">> {
  return client.request("GET", `/HealthcareService/${encodeURIComponent(id)}`) as Promise<
    FhirResource<"HealthcareService">
  >;
}

/** POST /HealthcareService */
export async function createHealthcareService(
  client: SatuSehatClient,
  body: HealthcareServiceInput,
): Promise<FhirResource<"HealthcareService">> {
  return client.request("POST", "/HealthcareService", { body }) as Promise<FhirResource<"HealthcareService">>;
}

/** PUT /HealthcareService/{id} */
export async function updateHealthcareService(
  client: SatuSehatClient,
  id: string,
  body: HealthcareServiceInput,
): Promise<FhirResource<"HealthcareService">> {
  return client.request("PUT", `/HealthcareService/${encodeURIComponent(id)}`, { body }) as Promise<
    FhirResource<"HealthcareService">
  >;
}

/** PATCH /HealthcareService/{id} */
export async function patchHealthcareService(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource<"HealthcareService">> {
  return client.request("PATCH", `/HealthcareService/${encodeURIComponent(id)}`, {
    body: operations,
  }) as Promise<FhirResource<"HealthcareService">>;
}
