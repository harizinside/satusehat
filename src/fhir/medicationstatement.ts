/**
 * fhir/medicationstatement — generic MedicationStatement operations.
 *
 * Hand-written (not generated) so the shape is stable even if the source
 * Postman collection moves or is removed. The Rawat Jalan + Gigi anamnesis
 * flows POST one to record "Riwayat Pengobatan" (past medications the
 * patient reports taking), but the resource is general — any flow that
 * needs to record a patient's medication history uses this same endpoint.
 *
 * - `medicationstatementCreate` → POST /MedicationStatement
 * - `medicationstatementById`   → GET /MedicationStatement/:id
 * - `medicationstatementSearch` → GET /MedicationStatement (subject, encounter, status, _count, ...)
 * - `medicationstatementUpdate` → PUT /MedicationStatement/:id
 * - `medicationstatementPatch`  → PATCH /MedicationStatement/:id
 */
import type { SatuSehatClient } from "../core/client.js";
import type { FhirBundle, FhirPatchOperation, FhirResource } from "./types.js";

/** POST /MedicationStatement request body. Per FHIR R4 the `medication[x]`
 * element is a choice type — supply exactly one of `medicationReference`
 * (link to a `Medication` resource) or `medicationCodeableConcept` (KFA /
 * other coding). Per-call bodies may carry more (e.g. `note`, `derivedFrom`,
 * `reasonCode`, `effectivePeriod` instead of `effectiveDateTime`, ...) and
 * the SDK passes them through unchanged via the `body` argument's structural
 * type. */
export interface MedicationstatementCreateBody {
  resourceType?: string;
  identifier?: Array<Record<string, unknown>>;
  status?: string;
  category?: {
    coding?: Array<Record<string, unknown>>;
  };
  /** `Medication/<id>` — server-side selector for an existing Medication. */
  medicationReference?: {
    reference?: string;
    display?: string;
  };
  /** KFA / other coding — used when no `Medication` resource exists. */
  medicationCodeableConcept?: {
    coding?: Array<Record<string, unknown>>;
    text?: string;
  };
  subject: {
    reference?: string;
    display?: string;
  };
  // `context` is mandatory server-side (confirmed live, staging e2e
  // 2026-10-20): POSTs without it are rejected with `400 Reference is
  // mandatory : MedicationStatement.context (RuleNumber: 10438)`. Point it
  // at the visit's `Encounter/<id>`.
  context: {
    reference?: string;
  };
  effectiveDateTime?: string;
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  dateAsserted?: string;
  informationSource?: {
    reference?: string;
    display?: string;
  };
  dosage?: Array<Record<string, unknown>>;
  note?: Array<Record<string, unknown>>;
  contained?: Array<Record<string, unknown>>;
}

/** POST /MedicationStatement — returns the created resource (server assigns the id). */
export async function medicationstatementCreate(
  client: SatuSehatClient,
  body: MedicationstatementCreateBody,
): Promise<FhirResource<"MedicationStatement">> {
  return client.request("POST", "/MedicationStatement", {
    body: body as unknown as Record<string, unknown>,
  }) as Promise<FhirResource<"MedicationStatement">>;
}

/** GET /MedicationStatement/:id — fetch by SATU SEHAT resource id. */
export async function medicationstatementById(
  client: SatuSehatClient,
  id: string,
): Promise<FhirResource<"MedicationStatement">> {
  return client.request("GET", `/MedicationStatement/${encodeURIComponent(id)}`) as Promise<
    FhirResource<"MedicationStatement">
  >;
}

/**
 * GET /MedicationStatement — searchset Bundle. Typical query:
 * `subject=Patient/<id>&encounter=Encounter/<id>&_count=10` to list the
 * "Riwayat Pengobatan" recorded for a specific visit.
 */
export interface MedicationstatementSearchParams {
  subject?: string | number;
  /** Alias for `subject` some clients/collections use; the server accepts either. */
  patient?: string | number;
  encounter?: string | number;
  status?: string | number;
  category?: string | number;
  _id?: string | number;
  _count?: number;
  [key: string]: string | number | undefined;
}

export async function medicationstatementSearch(
  client: SatuSehatClient,
  params: MedicationstatementSearchParams = {},
): Promise<FhirBundle<"MedicationStatement">> {
  const query: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query[key] = value;
  }
  return client.request("GET", "/MedicationStatement", { query }) as Promise<
    FhirBundle<"MedicationStatement">
  >;
}

/** PUT /MedicationStatement/:id — full update. */
export async function medicationstatementUpdate(
  client: SatuSehatClient,
  id: string,
  body: MedicationstatementCreateBody,
): Promise<FhirResource> {
  return client.request("PUT", `/MedicationStatement/${encodeURIComponent(id)}`, {
    body: body as unknown as Record<string, unknown>,
  }) as Promise<FhirResource>;
}

/** PATCH /MedicationStatement/:id — JSON Patch (content-type fixed globally). */
export async function medicationstatementPatch(
  client: SatuSehatClient,
  id: string,
  operations: FhirPatchOperation[],
): Promise<FhirResource> {
  return client.request("PATCH", `/MedicationStatement/${encodeURIComponent(id)}`, {
    body: operations,
  }) as Promise<FhirResource>;
}