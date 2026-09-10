/**
 * FHIR coding/terminology constants — plug a constant in wherever you would
 * otherwise hand-type a `{system, code, display}` object:
 *
 * ```ts
 * import { ENCOUNTER_CLASS, OBSERVATION_CATEGORY, icd10Coding } from "satusehat";
 *
 * const encounter = { class: ENCOUNTER_CLASS.ambulatory, ... };
 * const observation = { category: [OBSERVATION_CATEGORY.vitalSigns], ... };
 * ```
 *
 * Heavy ICD-10 / ICD-9-CM data modules are intentionally NOT re-exported here;
 * import them via the `satusehat/icd10` and `satusehat/icd9cm` subpaths so
 * consumers who do not need them never pay for them.
 */
export * from "./systems.js";
export * from "./identifiers.js";
export * from "./encounter.js";
export * from "./clinical-status.js";
export * from "./observation.js";
export * from "./medication.js";
export * from "./ucum.js";
export * from "./claim.js";
export * from "./organization-location.js";
export * from "./immunization.js";
export * from "./misc.js";
export * from "./gigi.js";
