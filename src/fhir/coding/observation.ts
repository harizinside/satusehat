import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/** FHIR R4 `Observation.category` — all 9 official codes (SATUSEHAT examples only exercise a subset). */
export const OBSERVATION_CATEGORY = {
  socialHistory: { system: SYSTEM.OBSERVATION_CATEGORY, code: "social-history", display: "Social History" },
  vitalSigns: { system: SYSTEM.OBSERVATION_CATEGORY, code: "vital-signs", display: "Vital Signs" },
  imaging: { system: SYSTEM.OBSERVATION_CATEGORY, code: "imaging", display: "Imaging" },
  laboratory: { system: SYSTEM.OBSERVATION_CATEGORY, code: "laboratory", display: "Laboratory" },
  procedure: { system: SYSTEM.OBSERVATION_CATEGORY, code: "procedure", display: "Procedure" },
  survey: { system: SYSTEM.OBSERVATION_CATEGORY, code: "survey", display: "Survey" },
  exam: { system: SYSTEM.OBSERVATION_CATEGORY, code: "exam", display: "Exam" },
  therapy: { system: SYSTEM.OBSERVATION_CATEGORY, code: "therapy", display: "Therapy" },
  activity: { system: SYSTEM.OBSERVATION_CATEGORY, code: "activity", display: "Activity" },
} as const satisfies Record<string, Coding>;

/**
 * FHIR R4 `Observation.interpretation` — the common subset of
 * v3-ObservationInterpretation (the binding is formally extensible over the
 * full v3 catalog; these are the widely used result-interpretation codes).
 */
export const OBSERVATION_INTERPRETATION = {
  high: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "H", display: "High" },
  low: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "L", display: "Low" },
  criticallyHigh: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "HH", display: "Critical high" },
  criticallyLow: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "LL", display: "Critical low" },
  significantlyHigh: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "HU", display: "Significantly high" },
  significantlyLow: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "LU", display: "Significantly low" },
  normal: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "N", display: "Normal" },
  abnormal: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "A", display: "Abnormal" },
  criticallyAbnormal: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "AA", display: "Critical abnormal" },
  susceptible: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "S", display: "Susceptible" },
  resistant: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "R", display: "Resistant" },
  intermediate: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "I", display: "Intermediate" },
  positive: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "POS", display: "Positive" },
  negative: { system: SYSTEM.OBSERVATION_INTERPRETATION, code: "NEG", display: "Negative" },
} as const satisfies Record<string, Coding>;
