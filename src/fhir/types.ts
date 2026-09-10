/** Shared FHIR R4 response helpers used by generated modules. */

/** A single FHIR `Coding` — `{system, code, display}`. See `src/fhir/coding/*`. */
export interface Coding {
  system: string;
  code: string;
  display?: string;
}

/** A single FHIR `Identifier` — `{system, value}`. Not a `Coding`: the value field is `value`, not `code`. */
export interface Identifier {
  system: string;
  value: string;
  use?: "usual" | "official" | "temp" | "secondary" | "old";
}

/** Minimal searchset Bundle as returned by SATUSEHAT FHIR search endpoints. */
export interface FhirBundle<R extends string = string> {
  resourceType: "Bundle";
  type?: string;
  total?: number;
  link?: Array<Record<string, unknown>>;
  entry?: Array<{
    fullUrl?: string;
    resource?: { resourceType: R } & Record<string, unknown>;
    search?: { mode?: string; score?: number };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

/** A single FHIR resource of the given type (loosely typed beyond resourceType). */
export type FhirResource<R extends string = string> = { resourceType: R } & Record<string, unknown>;

/** FHIR R4 JSON Patch operation (used by PATCH endpoints). */
export interface FhirPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: unknown;
  from?: string;
}
