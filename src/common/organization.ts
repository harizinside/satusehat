import type { SatuSehatClient } from "../core/client.js";

/**
 * FHIR R4 Organization as accepted by SATUSEHAT (`POST /Organization`).
 * All fields optional except `resourceType` — see the SATUSEHAT FHIR docs
 * (https://satusehatdev.doh.kemkes.go.id/fhirr4) for required combinations,
 * e.g. a Poli organization needs `partOf` pointing at its parent org.
 */
export interface OrganizationInput {
  resourceType: "Organization";
  identifier?: Array<Record<string, unknown>>;
  active?: boolean;
  type?: Array<Record<string, unknown>>;
  name?: string;
  alias?: string[];
  telecom?: Array<Record<string, unknown>>;
  address?: Array<Record<string, unknown>>;
  partOf?: { reference?: string; identifier?: Record<string, unknown> };
  [key: string]: unknown;
}

/** FHIR R4 Location as accepted by SATUSEHAT (`POST /Location`). */
export interface LocationInput {
  resourceType: "Location";
  identifier?: Array<Record<string, unknown>>;
  status?: "active" | "suspended" | "inactive";
  name?: string;
  alias?: string[];
  mode?: "instance" | "kind";
  type?: Array<Record<string, unknown>>;
  physicalType?: Record<string, unknown>;
  managingOrganization?: { reference?: string; identifier?: Record<string, unknown> };
  partOf?: { reference?: string; identifier?: Record<string, unknown> };
  position?: { longitude: number; latitude: number; altitude?: number };
  [key: string]: unknown;
}

/** Create an Organization (UKP/Kefarmasian/Laboratorium, Poli, Farmasi/Apotek, ...). */
export async function createOrganization(
  client: SatuSehatClient,
  body: OrganizationInput,
): Promise<unknown> {
  return client.request("POST", "/Organization", { body });
}

/** Create a Location (room/ruang) under an Organization. */
export async function createLocation(
  client: SatuSehatClient,
  body: LocationInput,
): Promise<unknown> {
  return client.request("POST", "/Location", { body });
}

export async function getOrganization(client: SatuSehatClient, id: string): Promise<unknown> {
  return client.request("GET", `/Organization/${encodeURIComponent(id)}`);
}

export async function getLocation(client: SatuSehatClient, id: string): Promise<unknown> {
  return client.request("GET", `/Location/${encodeURIComponent(id)}`);
}
