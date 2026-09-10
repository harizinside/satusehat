import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/**
 * FHIR R4 `Encounter.class` — the curated ActEncounterCode subset bound to
 * Encounter.class (not the full unbounded v3-ActCode catalog; other v3-ActCode
 * codes seen in SATUSEHAT examples, e.g. PUBLICPOL/SOCIAL/PBILLACCT, belong to
 * other bindings).
 */
export const ENCOUNTER_CLASS = {
  ambulatory: { system: SYSTEM.ACT_CODE, code: "AMB", display: "ambulatory" },
  emergency: { system: SYSTEM.ACT_CODE, code: "EMER", display: "emergency" },
  field: { system: SYSTEM.ACT_CODE, code: "FLD", display: "field" },
  homeHealth: { system: SYSTEM.ACT_CODE, code: "HH", display: "home health" },
  inpatient: { system: SYSTEM.ACT_CODE, code: "IMP", display: "inpatient encounter" },
  inpatientAcute: { system: SYSTEM.ACT_CODE, code: "ACUTE", display: "inpatient acute" },
  inpatientNonAcute: { system: SYSTEM.ACT_CODE, code: "NONAC", display: "inpatient non-acute" },
  observationEncounter: { system: SYSTEM.ACT_CODE, code: "OBSENC", display: "observation encounter" },
  preAdmission: { system: SYSTEM.ACT_CODE, code: "PRENC", display: "pre-admission" },
  shortStay: { system: SYSTEM.ACT_CODE, code: "SS", display: "short stay" },
  virtual: { system: SYSTEM.ACT_CODE, code: "VR", display: "virtual" },
} as const satisfies Record<string, Coding>;

/**
 * FHIR R4 `Encounter.participant.type` — the restricted EncounterParticipant
 * binding of v3-ParticipationType (not the full v3 catalog).
 */
export const ENCOUNTER_PARTICIPANT_TYPE = {
  admitter: { system: SYSTEM.PARTICIPATION_TYPE, code: "ADM", display: "admitter" },
  attender: { system: SYSTEM.PARTICIPATION_TYPE, code: "ATND", display: "attender" },
  callbackContact: { system: SYSTEM.PARTICIPATION_TYPE, code: "CALLBCK", display: "callback contact" },
  consultant: { system: SYSTEM.PARTICIPATION_TYPE, code: "CON", display: "consultant" },
  discharger: { system: SYSTEM.PARTICIPATION_TYPE, code: "DIS", display: "discharger" },
  escort: { system: SYSTEM.PARTICIPATION_TYPE, code: "ESC", display: "escort" },
  primaryPerformer: { system: SYSTEM.PARTICIPATION_TYPE, code: "PPRF", display: "primary performer" },
  participant: { system: SYSTEM.PARTICIPATION_TYPE, code: "PART", display: "Participation" },
  referrer: { system: SYSTEM.PARTICIPATION_TYPE, code: "REF", display: "referrer" },
  secondaryPerformer: { system: SYSTEM.PARTICIPATION_TYPE, code: "SPRF", display: "secondary performer" },
} as const satisfies Record<string, Coding>;
