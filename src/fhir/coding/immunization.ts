import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/**
 * Kemkes immunization value sets — audited examples only (no HL7-standard
 * equivalents; the HL7 `immunization-origin` codes below are official FHIR).
 */

/** FHIR R4 `Immunization.origin`-adjacent report-origin codes (example binding). */
export const IMMUNIZATION_ORIGIN = {
  provider: { system: SYSTEM.IMMUNIZATION_ORIGIN, code: "provider", display: "Other Provider" },
  recall: { system: SYSTEM.IMMUNIZATION_ORIGIN, code: "recall", display: "Parent/Guardian/Patient Recall" },
} as const satisfies Record<string, Coding>;

/** Kemkes `immunization-reason` (program grouping) — audited examples only. */
export const KEMKES_IMMUNIZATION_REASON = {
  dasar: { system: SYSTEM.KEMKES_IMMUNIZATION_REASON, code: "IM-Dasar", display: "Imunisasi Program Rutin Dasar" },
  baduta: { system: SYSTEM.KEMKES_IMMUNIZATION_REASON, code: "IM-Baduta", display: "Imunisasi Program Rutin Lanjutan Baduta" },
  khusus: { system: SYSTEM.KEMKES_IMMUNIZATION_REASON, code: "IM-Khusus", display: "Imunisasi Program Khusus" },
  pilihan: { system: SYSTEM.KEMKES_IMMUNIZATION_REASON, code: "IM-Pilihan", display: "Imunisasi Pilihan" },
} as const satisfies Record<string, Coding>;

/** Kemkes `immunization-program-eligibility` — audited examples only. */
export const KEMKES_IMMUNIZATION_PROGRAM_ELIGIBILITY = {
  diverifikasi: { system: SYSTEM.KEMKES_IMMUNIZATION_PROGRAM_ELIGIBILITY, code: "1", display: "Diverifikasi" },
} as const satisfies Record<string, Coding>;

/** Kemkes `immunization-routine-timing` — audited examples only. */
export const KEMKES_IMMUNIZATION_ROUTINE_TIMING = {
  ideal: { system: SYSTEM.KEMKES_IMMUNIZATION_ROUTINE_TIMING, code: "IM-Ideal", display: "Imunisasi Ideal" },
} as const satisfies Record<string, Coding>;
