/**
 * fhir/slot — hand-written from the official SATU SEHAT API docs
 * (api-catalogue/integrations/apis/slot). No search endpoint is documented
 * for Slot (get-by-id, create, update, patch only).
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirPatchOperation, FhirResource } from "./types.js";

export interface SlotInput {
  resourceType: "Slot";
  schedule?: { reference?: string };
  status?: "busy" | "free" | "busy-unavailable" | "busy-tentative" | "entered-in-error";
  start?: string;
  end?: string;
  [key: string]: unknown;
}

/** GET /Slot/{id} */
export async function getSlotById(client: SatuSehatClient, id: string): Promise<FhirResource<"Slot">> {
  return client.request("GET", `/Slot/${encodeURIComponent(id)}`) as Promise<FhirResource<"Slot">>;
}

/** POST /Slot */
export async function createSlot(client: SatuSehatClient, body: SlotInput): Promise<FhirResource<"Slot">> {
  return client.request("POST", "/Slot", { body }) as Promise<FhirResource<"Slot">>;
}

/** PUT /Slot/{id} */
export async function updateSlot(
  client: SatuSehatClient,
  id: string,
  body: SlotInput,
): Promise<FhirResource<"Slot">> {
  return client.request("PUT", `/Slot/${encodeURIComponent(id)}`, { body }) as Promise<FhirResource<"Slot">>;
}

/** PATCH /Slot/{id} */
export async function patchSlot(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource<"Slot">> {
  return client.request("PATCH", `/Slot/${encodeURIComponent(id)}`, { body: operations }) as Promise<
    FhirResource<"Slot">
  >;
}
