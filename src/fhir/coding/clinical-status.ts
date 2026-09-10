import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/** FHIR R4 `Condition.clinicalStatus` (required binding). */
export const CONDITION_CLINICAL_STATUS = {
  active: { system: SYSTEM.CONDITION_CLINICAL, code: "active", display: "Active" },
  recurrence: { system: SYSTEM.CONDITION_CLINICAL, code: "recurrence", display: "Recurrence" },
  relapse: { system: SYSTEM.CONDITION_CLINICAL, code: "relapse", display: "Relapse" },
  inactive: { system: SYSTEM.CONDITION_CLINICAL, code: "inactive", display: "Inactive" },
  remission: { system: SYSTEM.CONDITION_CLINICAL, code: "remission", display: "Remission" },
  resolved: { system: SYSTEM.CONDITION_CLINICAL, code: "resolved", display: "Resolved" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Condition.verificationStatus` (required binding). */
export const CONDITION_VERIFICATION_STATUS = {
  unconfirmed: { system: SYSTEM.CONDITION_VERIFICATION_STATUS, code: "unconfirmed", display: "Unconfirmed" },
  provisional: { system: SYSTEM.CONDITION_VERIFICATION_STATUS, code: "provisional", display: "Provisional" },
  differential: { system: SYSTEM.CONDITION_VERIFICATION_STATUS, code: "differential", display: "Differential" },
  confirmed: { system: SYSTEM.CONDITION_VERIFICATION_STATUS, code: "confirmed", display: "Confirmed" },
  refuted: { system: SYSTEM.CONDITION_VERIFICATION_STATUS, code: "refuted", display: "Refuted" },
  enteredInError: { system: SYSTEM.CONDITION_VERIFICATION_STATUS, code: "entered-in-error", display: "Entered in Error" },
} as const satisfies Record<string, Coding>;

/**
 * FHIR R4 `Condition.category` — the two official HL7 codes plus two
 * Kemkes-specific codes (bare `http://terminology.kemkes.go.id` system) that
 * SATU SEHAT's own outpatient (Rawat Jalan) docs use for this exact field:
 * chief complaint and personal/previous-condition history entries.
 */
export const CONDITION_CATEGORY = {
  problemListItem: { system: SYSTEM.CONDITION_CATEGORY, code: "problem-list-item", display: "Problem List Item" },
  encounterDiagnosis: { system: SYSTEM.CONDITION_CATEGORY, code: "encounter-diagnosis", display: "Encounter Diagnosis" },
  chiefComplaint: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "chief-complaint", display: "Chief Complaint" },
  previousCondition: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "previous-condition", display: "Previous Condition" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `AllergyIntolerance.clinicalStatus` (required binding). */
export const ALLERGY_CLINICAL_STATUS = {
  active: { system: SYSTEM.ALLERGYINTOLERANCE_CLINICAL, code: "active", display: "Active" },
  inactive: { system: SYSTEM.ALLERGYINTOLERANCE_CLINICAL, code: "inactive", display: "Inactive" },
  resolved: { system: SYSTEM.ALLERGYINTOLERANCE_CLINICAL, code: "resolved", display: "Resolved" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `AllergyIntolerance.verificationStatus` (required binding). */
export const ALLERGY_VERIFICATION_STATUS = {
  unconfirmed: { system: SYSTEM.ALLERGYINTOLERANCE_VERIFICATION, code: "unconfirmed", display: "Unconfirmed" },
  confirmed: { system: SYSTEM.ALLERGYINTOLERANCE_VERIFICATION, code: "confirmed", display: "Confirmed" },
  refuted: { system: SYSTEM.ALLERGYINTOLERANCE_VERIFICATION, code: "refuted", display: "Refuted" },
  enteredInError: { system: SYSTEM.ALLERGYINTOLERANCE_VERIFICATION, code: "entered-in-error", display: "Entered in Error" },
} as const satisfies Record<string, Coding>;
