/**
 * fhir/appointment — hand-written from the official SATU SEHAT API docs
 * (api-catalogue/integrations/apis/appointment).
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

export interface AppointmentInput {
  resourceType: "Appointment";
  status?: string;
  serviceType?: Array<Record<string, unknown>>;
  start?: string;
  end?: string;
  participant?: Array<{ actor?: { reference?: string }; status?: string; [key: string]: unknown }>;
  slot?: Array<{ reference?: string }>;
  [key: string]: unknown;
}

export interface AppointmentSearchParams {
  /** uuid — the healthcare-service/practitioner/patient actor ID */
  actor?: string;
}

/** GET /Appointment */
export async function searchAppointment(
  client: SatuSehatClient,
  params: AppointmentSearchParams = {},
): Promise<FhirBundle<"Appointment">> {
  return client.request("GET", "/Appointment", { query: { ...params } }) as Promise<FhirBundle<"Appointment">>;
}

/** GET /Appointment/{id} */
export async function getAppointmentById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"Appointment">> {
  return client.request("GET", `/Appointment/${encodeURIComponent(id)}`) as Promise<FhirResource<"Appointment">>;
}

/** POST /Appointment */
export async function createAppointment(
  client: SatuSehatClient,
  body: AppointmentInput,
): Promise<FhirResource<"Appointment">> {
  return client.request("POST", "/Appointment", { body }) as Promise<FhirResource<"Appointment">>;
}

/** PUT /Appointment/{id} */
export async function updateAppointment(
  client: SatuSehatClient,
  id: string,
  body: AppointmentInput,
): Promise<FhirResource<"Appointment">> {
  return client.request("PUT", `/Appointment/${encodeURIComponent(id)}`, { body }) as Promise<
    FhirResource<"Appointment">
  >;
}

/** PATCH /Appointment/{id} */
export async function patchAppointment(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource<"Appointment">> {
  return client.request("PATCH", `/Appointment/${encodeURIComponent(id)}`, { body: operations }) as Promise<
    FhirResource<"Appointment">
  >;
}
