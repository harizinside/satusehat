import { SYSTEM } from "./systems.js";
import type { CodingSet } from "../types.js";

/**
 * Dental (Gigi) workflow-specific coding constants, sourced from SATU SEHAT's
 * official rawat-jalan-gigi doc. LOINC/SNOMED codes here are fixed per
 * clinical concept (this is the one code SATU SEHAT always uses for this
 * exact Observation type), not a general enumeration of those unbounded
 * catalogs — same pattern as `ENCOUNTER_CLASS` picking fixed codes out of
 * v3-ActCode.
 */

/** `Observation.code` — what is being measured/examined. */
export const DENTAL_OBSERVATION_CODE: CodingSet<
  | "bloodType"
  | "rhesus"
  | "pregnancyStatus"
  | "debrisIndex"
  | "debrisIndexTotalScore"
  | "calculusIndex"
  | "calculusIndexTotalScore"
  | "ohisTotalScore"
  | "odontogramExamination"
  | "otherDentalOralCondition"
  | "toothSurface"
  | "toothFinding"
  | "dentalFillingMaterial"
  | "dentalRestorationShade"
  | "maxillofacialProsthesisMaterial"
  | "dentalProsthesis"
  | "dentalOcclusion"
  | "torusPalatinus"
  | "torusMandibularis"
  | "palate"
  | "diastemaOfTeeth"
  | "anomalyOfToothPosition"
  | "decayedToothCount"
  | "missingToothCount"
  | "filledToothCount"
> = {
  bloodType: { system: SYSTEM.LOINC, code: "883-9", display: "ABO group [Type] in Blood" },
  rhesus: { system: SYSTEM.LOINC, code: "10331-7", display: "Rh [Type] in Blood" },
  pregnancyStatus: { system: SYSTEM.LOINC, code: "82810-3", display: "Pregnancy status" },
  debrisIndex: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000062", display: "Debris Indeks" },
  debrisIndexTotalScore: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000056", display: "Skor Total Debris Indeks" },
  calculusIndex: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000063", display: "Kalkulus Indeks" },
  calculusIndexTotalScore: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000057", display: "Skor Total Kalkulus Indeks" },
  ohisTotalScore: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000058", display: "Skor Total Oral Hygiene Index Simplified (OHIS)" },
  odontogramExamination: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000061", display: "Pemeriksaan Odontogram" },
  otherDentalOralCondition: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OC000060", display: "Kondisi Gigi dan Mulut Lainnya" },
  toothSurface: { system: SYSTEM.LOINC, code: "32889-8", display: "Surface [Identifier] Tooth" },
  toothFinding: { system: SYSTEM.SNOMED, code: "278544002", display: "Tooth finding" },
  dentalFillingMaterial: { system: SYSTEM.SNOMED, code: "432680005", display: "Dental filling material" },
  dentalRestorationShade: { system: SYSTEM.SNOMED, code: "251335007", display: "Dental restoration or prosthesis shade" },
  maxillofacialProsthesisMaterial: { system: SYSTEM.SNOMED, code: "256509009", display: "Maxillofacial prosthesis and appliance material" },
  dentalProsthesis: { system: SYSTEM.LOINC, code: "34026-5", display: "Dental prosthesis" },
  dentalOcclusion: { system: SYSTEM.SNOMED, code: "25272006", display: "Dental occlusion" },
  torusPalatinus: { system: SYSTEM.SNOMED, code: "46752004", display: "Torus palatinus" },
  torusMandibularis: { system: SYSTEM.SNOMED, code: "11625007", display: "Torus mandibularis" },
  palate: { system: SYSTEM.LOINC, code: "32460-8", display: "Physical findings of Palate" },
  diastemaOfTeeth: { system: SYSTEM.SNOMED, code: "734009000", display: "Diastema of teeth" },
  anomalyOfToothPosition: { system: SYSTEM.SNOMED, code: "81256000", display: "Anomaly of tooth position" },
  decayedToothCount: { system: SYSTEM.SNOMED, code: "251319000", display: "Decayed tooth count" },
  missingToothCount: { system: SYSTEM.SNOMED, code: "251317003", display: "Missing tooth count" },
  filledToothCount: { system: SYSTEM.SNOMED, code: "251318008", display: "Filled tooth count" },
};

/** `Observation.valueCodeableConcept` — blood type finding value. */
export const DENTAL_BLOOD_TYPE_VALUE: CodingSet<"a" | "b" | "ab" | "o"> = {
  a: { system: SYSTEM.LOINC, code: "LA19710-5", display: "Group A" },
  b: { system: SYSTEM.LOINC, code: "LA19709-7", display: "Group B" },
  ab: { system: SYSTEM.LOINC, code: "LA28449-9", display: "Group AB" },
  o: { system: SYSTEM.LOINC, code: "LA19708-9", display: "Group O" },
};

/** `Observation.valueCodeableConcept` — rhesus finding value. */
export const DENTAL_RHESUS_VALUE: CodingSet<"positive" | "negative"> = {
  positive: { system: SYSTEM.LOINC, code: "LA6576-8", display: "Positive" },
  negative: { system: SYSTEM.LOINC, code: "LA6577-6", display: "Negative" },
};

/** `Observation.valueCodeableConcept` — pregnancy status finding value. */
export const DENTAL_PREGNANCY_STATUS_VALUE: CodingSet<"pregnant" | "notPregnant"> = {
  pregnant: { system: SYSTEM.SNOMED, code: "77386006", display: "Pregnancy" },
  notPregnant: { system: SYSTEM.SNOMED, code: "60001007", display: "Not pregnant" },
};

/** `Observation.interpretation` — OHIS (Oral Hygiene Index Simplified) result. */
export const DENTAL_OHIS_INTERPRETATION: CodingSet<"good" | "fair" | "poor"> = {
  good: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OI000029", display: "Kondisi Gigi Baik" },
  fair: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OI000030", display: "Kondisi Gigi Cukup Baik" },
  poor: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OI000031", display: "Kondisi Gigi Buruk" },
};

/** `Observation.valueCodeableConcept` — Torus Palatinus finding. */
export const DENTAL_TORUS_PALATINUS_VALUE: CodingSet<"none" | "small" | "medium" | "large" | "multiple"> = {
  none: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000074", display: "Tidak ada Torus Palatinus" },
  small: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000075", display: "Torus Palatinus Kecil" },
  medium: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000076", display: "Torus Palatinus Sedang" },
  large: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000077", display: "Torus Palatinus Besar" },
  multiple: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000078", display: "Multiple Torus Palatinus" },
};

/** `Observation.valueCodeableConcept` — Torus Mandibularis finding. */
export const DENTAL_TORUS_MANDIBULARIS_VALUE: CodingSet<"none" | "left" | "right" | "both"> = {
  none: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000079", display: "Tidak ada Torus Mandibularis" },
  left: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000080", display: "Torus Mandibularis Sisi Kiri" },
  right: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000081", display: "Torus Mandibularis Sisi Kanan" },
  both: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000082", display: "Torus Mandibularis pada Kedua Sisi" },
};

/** `Observation.valueCodeableConcept` — Palate (depth) finding. */
export const DENTAL_PALATE_VALUE: CodingSet<"deep" | "medium" | "shallow"> = {
  deep: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000083", display: "Palatum Dalam" },
  medium: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000084", display: "Palatum Sedang" },
  shallow: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000085", display: "Palatum Rendah" },
};

/** `Observation.valueCodeableConcept` — Diastema finding. */
export const DENTAL_DIASTEMA_VALUE: CodingSet<"absent" | "present"> = {
  absent: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000086", display: "Tidak Ada Diastema" },
  present: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000087", display: "Ada Diastema" },
};

/** `Observation.valueCodeableConcept` — Gigi Anomali (tooth position anomaly) finding. */
export const DENTAL_TOOTH_ANOMALY_VALUE: CodingSet<"absent" | "present"> = {
  absent: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000088", display: "Tidak Ada Gigi Anomali" },
  present: { system: SYSTEM.KEMKES_CLINICAL_TERM, code: "OV000089", display: "Ada Gigi Anomali" },
};
