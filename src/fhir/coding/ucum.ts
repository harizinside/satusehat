import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/**
 * Common UCUM (Unified Code for Units of Measure) unit codes for medical
 * dosing — used on FHIR `Quantity`-shaped fields (`value`+`unit`+`system`+`code`,
 * e.g. `MedicationRequest.dispenseRequest.quantity`/`dispenseInterval`/
 * `expectedSupplyDuration`, `dosageInstruction[].doseAndRate[].doseQuantity`).
 *
 * UCUM itself is a large grammar-based standard (SYSTEM.UCUM stays a bare URI
 * constant, not enumerated) — this is a curated subset of the units that
 * actually show up in medication dosing.
 *
 * `UCUM_TIME` is confirmed working against the real SATU SEHAT staging API
 * (`day` used successfully in a real `MedicationRequest.dispenseRequest.*`
 * call). `UCUM_MASS`/`UCUM_VOLUME`/`UCUM_COUNT` are NOT confirmed —
 * SATU SEHAT's UCUM validator rejected both standard forms tried for
 * countable units (`{tbl}` and the dimensionless `1`) with "Code not found",
 * meaning it checks against some specific restricted code list rather than
 * full UCUM grammar. Treat these as best-guess placeholders until verified
 * against a real working example.
 */
export const UCUM_TIME = {
  second: { system: SYSTEM.UCUM, code: "s", display: "second" },
  minute: { system: SYSTEM.UCUM, code: "min", display: "minute" },
  hour: { system: SYSTEM.UCUM, code: "h", display: "hour" },
  day: { system: SYSTEM.UCUM, code: "d", display: "day" },
  week: { system: SYSTEM.UCUM, code: "wk", display: "week" },
  month: { system: SYSTEM.UCUM, code: "mo", display: "month" },
  year: { system: SYSTEM.UCUM, code: "a", display: "year" },
} as const satisfies Record<string, Coding>;

export const UCUM_MASS = {
  microgram: { system: SYSTEM.UCUM, code: "ug", display: "microgram" },
  milligram: { system: SYSTEM.UCUM, code: "mg", display: "milligram" },
  gram: { system: SYSTEM.UCUM, code: "g", display: "gram" },
  kilogram: { system: SYSTEM.UCUM, code: "kg", display: "kilogram" },
} as const satisfies Record<string, Coding>;

export const UCUM_VOLUME = {
  milliliter: { system: SYSTEM.UCUM, code: "mL", display: "milliliter" },
  liter: { system: SYSTEM.UCUM, code: "L", display: "liter" },
} as const satisfies Record<string, Coding>;

/**
 * @deprecated Confirmed wrong against a real working example: SATU SEHAT
 * does NOT use UCUM for countable dosage-form quantities (rejected both
 * `{tbl}` and the dimensionless `1` live). A real MedicationDispense example
 * shows `doseQuantity`/`quantity` for tablets use `code: "TAB"` under
 * `SYSTEM.ORDERABLE_DRUG_FORM` (v3-orderableDrugForm) instead — see
 * `ORDERABLE_DRUG_FORM_AUDITED` in `misc.ts`. Kept here only so the mistake
 * (and the pointer to the right constant) is visible instead of silently
 * removed; do not use for new code.
 */
export const UCUM_COUNT = {
  tablet: { system: SYSTEM.UCUM, code: "{tbl}", display: "tablet" },
  capsule: { system: SYSTEM.UCUM, code: "{cap}", display: "capsule" },
  drop: { system: SYSTEM.UCUM, code: "{drop}", display: "drop" },
  applicationUnit: { system: SYSTEM.UCUM, code: "{app}", display: "application" },
  internationalUnit: { system: SYSTEM.UCUM, code: "[iU]", display: "international unit" },
} as const satisfies Record<string, Coding>;
