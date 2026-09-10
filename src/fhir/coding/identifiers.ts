import type { Identifier } from "../types.js";

/**
 * Fixed Kemkes identifier-system namespaces (`Identifier.system` values that
 * never vary per record — as opposed to the org-scoped `sys-ids` template in
 * `kemkesResourceIdentifierSystem()` below).
 */
export const IDENTIFIER_SYSTEM = {
  nik: "https://fhir.kemkes.go.id/id/nik",
  nikIbu: "https://fhir.kemkes.go.id/id/nik-ibu",
  kk: "https://fhir.kemkes.go.id/id/kk",
  paspor: "https://fhir.kemkes.go.id/id/paspor",
  ihsNumber: "https://fhir.kemkes.go.id/id/ihs-number",
  strKkiNumber: "https://fhir.kemkes.go.id/id/str-kki-number",
  nakesHisNumber: "https://fhir.kemkes.go.id/id/nakes-his-number",
  orgNumber: "https://fhir.kemkes.go.id/id/org-number",
  creator: "http://sys-ids.kemkes.go.id/creator",
} as const;

/**
 * Org-scoped Kemkes identifier template:
 * `kemkesResourceIdentifierSystem("Encounter", orgId)` →
 * `http://sys-ids.kemkes.go.id/Encounter/{orgId}`. Some flows add a sub-path
 * (e.g. `diagnostic/{orgId}/lab`); pass it via `subPath`.
 */
export function kemkesResourceIdentifierSystem(
  resourceType: string,
  orgId: string,
  subPath?: string,
): string {
  const suffix = subPath ? `/${subPath}` : "";
  return `http://sys-ids.kemkes.go.id/${resourceType}/${orgId}${suffix}`;
}

/**
 * `ContactPoint.system` enum — a plain string field on ContactPoint, not a
 * Coding, so it is typed as a union rather than a constant object of codings.
 */
export type ContactPointSystem =
  | "phone"
  | "fax"
  | "email"
  | "pager"
  | "url"
  | "sms"
  | "other";

/**
 * Convenience `Identifier` builders for the common fixed namespaces — for
 * `Patient.identifier` entries, e.g. `identifiers.nik("3271...")`.
 * Note: an `Identifier` is `{system, value}`, not a `Coding` (`{system, code}`).
 */
export const identifiers = {
  nik: (nik: string): Identifier => ({ system: IDENTIFIER_SYSTEM.nik, value: nik }),
  nikIbu: (nikIbu: string): Identifier => ({ system: IDENTIFIER_SYSTEM.nikIbu, value: nikIbu }),
  kk: (kk: string): Identifier => ({ system: IDENTIFIER_SYSTEM.kk, value: kk }),
  paspor: (paspor: string): Identifier => ({ system: IDENTIFIER_SYSTEM.paspor, value: paspor }),
  ihsNumber: (ihs: string): Identifier => ({ system: IDENTIFIER_SYSTEM.ihsNumber, value: ihs }),
} as const;
