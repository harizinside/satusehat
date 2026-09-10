import type { SatuSehatClient } from "../core/client.js";
import { IDENTIFIER_SYSTEM } from "../fhir/coding/identifiers.js";

/** FHIR search parameters shared by Patient/Practitioner lookups. */
export interface PersonSearchParams {
  /** `https://fhir.kemkes.go.id/id/nik|<NIK>` — helper `nikIdentifier()` below */
  identifier?: string;
  name?: string;
  /** `YYYY-MM-DD` */
  birthdate?: string;
  gender?: "male" | "female";
  _id?: string;
  _lastUpdated?: string;
  _count?: number;
  [key: string]: string | number | undefined;
}

/** Build the `identifier` value for a NIK lookup: `https://fhir.kemkes.go.id/id/nik|<nik>` */
export function nikIdentifier(nik: string): string {
  return `${IDENTIFIER_SYSTEM.nik}|${nik}`;
}

async function searchResource(
  client: SatuSehatClient,
  resource: "Patient" | "Practitioner",
  params: PersonSearchParams,
): Promise<unknown> {
  const query: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query[key] = value;
  }
  return client.request("GET", `/${resource}`, { query });
}

/** GET /Patient?identifier=... — returns a FHIR searchset Bundle */
export async function searchPatient(
  client: SatuSehatClient,
  params: PersonSearchParams,
): Promise<unknown> {
  return searchResource(client, "Patient", params);
}

/** GET /Patient/{id} — returns the Patient resource */
export async function getPatientById(client: SatuSehatClient, id: string): Promise<unknown> {
  return client.request("GET", `/Patient/${encodeURIComponent(id)}`);
}

/** GET /Practitioner?identifier=... — returns a FHIR searchset Bundle */
export async function searchPractitioner(
  client: SatuSehatClient,
  params: PersonSearchParams,
): Promise<unknown> {
  return searchResource(client, "Practitioner", params);
}

/** GET /Practitioner/{id} — returns the Practitioner resource */
export async function getPractitionerById(client: SatuSehatClient, id: string): Promise<unknown> {
  return client.request("GET", `/Practitioner/${encodeURIComponent(id)}`);
}
