import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/**
 * Kemkes `medication-dispense-category`-shaped categories for
 * `MedicationDispense.category` — audited from SATUSEHAT examples (the
 * examples use the `medicationrequest-category`-style codes under the
 * `medicationdispense-category` CodeSystem URI).
 */
export const MEDICATION_DISPENSE_CATEGORY = {
  inpatient: { system: SYSTEM.MEDICATIONDISPENSE_CATEGORY, code: "inpatient", display: "Inpatient" },
  outpatient: { system: SYSTEM.MEDICATIONDISPENSE_CATEGORY, code: "outpatient", display: "Outpatient" },
  community: { system: SYSTEM.MEDICATIONDISPENSE_CATEGORY, code: "community", display: "Community" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `MedicationRequest.category` (extensible; example codes). */
export const MEDICATION_REQUEST_CATEGORY = {
  inpatient: { system: SYSTEM.MEDICATIONREQUEST_CATEGORY, code: "inpatient", display: "Inpatient" },
  outpatient: { system: SYSTEM.MEDICATIONREQUEST_CATEGORY, code: "outpatient", display: "Outpatient" },
  community: { system: SYSTEM.MEDICATIONREQUEST_CATEGORY, code: "community", display: "Community" },
  discharge: { system: SYSTEM.MEDICATIONREQUEST_CATEGORY, code: "discharge", display: "Discharge" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `MedicationStatement.category` (extensible; example codes — same 3-value shape as dispense/request category). */
export const MEDICATION_STATEMENT_CATEGORY = {
  inpatient: { system: SYSTEM.MEDICATION_STATEMENT_CATEGORY, code: "inpatient", display: "Inpatient" },
  outpatient: { system: SYSTEM.MEDICATION_STATEMENT_CATEGORY, code: "outpatient", display: "Outpatient" },
  community: { system: SYSTEM.MEDICATION_STATEMENT_CATEGORY, code: "community", display: "Community" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Dosage.rateQuantity`-adjacent `doseQuantity` rate type (extensible). */
export const DOSE_RATE_TYPE = {
  ordered: { system: SYSTEM.DOSE_RATE_TYPE, code: "ordered", display: "Ordered" },
  calculated: { system: SYSTEM.DOSE_RATE_TYPE, code: "calculated", display: "Calculated" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `MedicationRequest.courseOfTherapyType` (extensible). */
export const MEDICATION_REQUEST_COURSE_OF_THERAPY = {
  continuous: { system: SYSTEM.MEDICATIONREQUEST_COURSE_OF_THERAPY, code: "continuous", display: "Continuous long term therapy" },
  acute: { system: SYSTEM.MEDICATIONREQUEST_COURSE_OF_THERAPY, code: "acute", display: "Short course (acute) therapy" },
  seasonal: { system: SYSTEM.MEDICATIONREQUEST_COURSE_OF_THERAPY, code: "seasonal", display: "Seasonal" },
  asNeeded: { system: SYSTEM.MEDICATIONREQUEST_COURSE_OF_THERAPY, code: "as-needed", display: "As needed" },
} as const satisfies Record<string, Coding>;

/** Kemkes `medication-form` (KFA product form codes) — audited examples only. */
export const KEMKES_MEDICATION_FORM = {
  kapsul: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS019", display: "Kapsul" },
  kapletSalutSelaput: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS023", display: "Kaplet Salut Selaput" },
  krim: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS030", display: "Krim" },
  larutanInjeksi: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS034", display: "Larutan Injeksi" },
  infus: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS035", display: "Infus" },
  serbukOral: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS047", display: "Serbuk Oral" },
  serbukInjeksiLiofilisasi: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS050", display: "Serbuk Injeksi Liofilisasi" },
  sirup: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS055", display: "Sirup" },
  supositoria: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS059", display: "Supositoria" },
  tablet: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS066", display: "Tablet" },
  tabletVaginal: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS080", display: "Tablet Vaginal" },
  tetesMata: { system: SYSTEM.KEMKES_MEDICATION_FORM, code: "BS084", display: "Tetes Mata" },
} as const satisfies Record<string, Coding>;

/**
 * Kemkes `medication-type` (compounding instruction codes from KFA) —
 * audited examples only: NC = non-compound, EP/SD = split/supply instructions.
 */
export const KEMKES_MEDICATION_TYPE = {
  nonCompound: { system: SYSTEM.KEMKES_MEDICATION_TYPE, code: "NC", display: "Non-compound" },
  divideIntoEqualParts: { system: SYSTEM.KEMKES_MEDICATION_TYPE, code: "EP", display: "Divide into equal parts" },
  givesOfSuchDoses: { system: SYSTEM.KEMKES_MEDICATION_TYPE, code: "SD", display: "Gives of such doses" },
} as const satisfies Record<string, Coding>;

/**
 * `Medication.extension:medicationType` — required on every `POST /Medication`
 * (confirmed: SATU SEHAT rejects a Medication with `400 Element not found:
 * Medication.extension (RuleNumber: 10031)` without it). Build with e.g.
 * `medicationTypeExtension(KEMKES_MEDICATION_TYPE.nonCompound)`.
 */
export const MEDICATION_TYPE_EXTENSION_URL = "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType";

export function medicationTypeExtension(coding: Coding): {
  url: string;
  valueCodeableConcept: { coding: Coding[] };
} {
  return { url: MEDICATION_TYPE_EXTENSION_URL, valueCodeableConcept: { coding: [coding] } };
}
