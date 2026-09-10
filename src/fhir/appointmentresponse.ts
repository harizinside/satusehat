/**
 * fhir/appointmentresponse — hand-written from the official SATU SEHAT API
 * docs (api-catalogue/integrations/apis/appointment-response).
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

export interface AppointmentResponseInput {
  resourceType: "AppointmentResponse";
  appointment?: { reference?: string };
  actor?: { reference?: string };
  participantStatus?: "accepted" | "declined" | "tentative" | "needs-action";
  [key: string]: unknown;
}

export interface AppointmentResponseSearchParams {
  /** uuid — the Appointment this response belongs to */
  appointment?: string;
}

/** GET /AppointmentResponse */
export async function searchAppointmentResponse(
  client: SatuSehatClient,
  params: AppointmentResponseSearchParams = {},
): Promise<FhirBundle<"AppointmentResponse">> {
  return client.request("GET", "/AppointmentResponse", { query: { ...params } }) as Promise<
    FhirBundle<"AppointmentResponse">
  >;
}

/** GET /AppointmentResponse/{id} */
export async function getAppointmentResponseById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"AppointmentResponse">> {
  return client.request("GET", `/AppointmentResponse/${encodeURIComponent(id)}`) as Promise<
    FhirResource<"AppointmentResponse">
  >;
}

/** POST /AppointmentResponse */
export async function createAppointmentResponse(
  client: SatuSehatClient,
  body: AppointmentResponseInput,
): Promise<FhirResource<"AppointmentResponse">> {
  return client.request("POST", "/AppointmentResponse", { body }) as Promise<
    FhirResource<"AppointmentResponse">
  >;
}

/** PUT /AppointmentResponse/{id} */
export async function updateAppointmentResponse(
  client: SatuSehatClient,
  id: string,
  body: AppointmentResponseInput,
): Promise<FhirResource<"AppointmentResponse">> {
  return client.request("PUT", `/AppointmentResponse/${encodeURIComponent(id)}`, { body }) as Promise<
    FhirResource<"AppointmentResponse">
  >;
}

/** PATCH /AppointmentResponse/{id} */
export async function patchAppointmentResponse(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource<"AppointmentResponse">> {
  return client.request("PATCH", `/AppointmentResponse/${encodeURIComponent(id)}`, {
    body: operations,
  }) as Promise<FhirResource<"AppointmentResponse">>;
}
