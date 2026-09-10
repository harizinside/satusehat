import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/**
 * Long-tail small value sets from the audit — one const per system, each
 * documented with its source:
 *  - "Official FHIR R4" → written from the spec, a superset of what SATUSEHAT
 *    examples exercise.
 *  - "Audited examples" → cleaned pairs from SATUSEHAT's saved examples; the
 *    underlying catalog is unbounded (do not treat these sets as exhaustive).
 * Genuinely unbounded catalogs (SNOMED, LOINC, UCUM, ICD-10/9-CM, ATC, CVX,
 * DICOM DCM, clinical-term, KPTL, clinical-speciality, smallest-logistic-unit,
 * administrative-area, icd-o axes) have URI constants in `SYSTEM` only.
 */

/** FHIR R4 `Goal.achievementStatus` (extensible). */
export const GOAL_ACHIEVEMENT = {
  inProgress: { system: SYSTEM.GOAL_ACHIEVEMENT, code: "in-progress", display: "In Progress" },
  improving: { system: SYSTEM.GOAL_ACHIEVEMENT, code: "improving", display: "Improving" },
  worsening: { system: SYSTEM.GOAL_ACHIEVEMENT, code: "worsening", display: "Worsening" },
  achieved: { system: SYSTEM.GOAL_ACHIEVEMENT, code: "achieved", display: "Achieved" },
  sustaining: { system: SYSTEM.GOAL_ACHIEVEMENT, code: "sustaining", display: "Sustaining" },
  notAttained: { system: SYSTEM.GOAL_ACHIEVEMENT, code: "not-attained", display: "Not Attained" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Goal.category` (extensible, example codes). */
export const GOAL_CATEGORY = {
  physiotherapy: { system: SYSTEM.GOAL_CATEGORY, code: "physiotherapy", display: "Physiotherapy" },
  nursing: { system: SYSTEM.GOAL_CATEGORY, code: "nursing", display: "Nursing" },
  dietary: { system: SYSTEM.GOAL_CATEGORY, code: "dietary", display: "Dietary" },
  smokingCessation: { system: SYSTEM.GOAL_CATEGORY, code: "smoking-cessation", display: "Smoking Cessation" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Encounter.hospitalization.dischargeDisposition` (example codes). */
export const DISCHARGE_DISPOSITION = {
  home: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "home", display: "Home" },
  alternativeHome: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "alt-home", display: "Alternative Home" },
  otherHealthcareFacility: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "other-hcf", display: "Other Healthcare Facility" },
  hospice: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "hosp", display: "Hospice" },
  longTermCare: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "long", display: "Long-term care" },
  againstAdvice: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "aadvice", display: "Left against advice" },
  expired: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "exp", display: "Expired" },
  psychiatric: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "psy", display: "Psychiatric hospital" },
  rehabilitation: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "rehab", display: "Rehabilitation" },
  other: { system: SYSTEM.DISCHARGE_DISPOSITION, code: "oth", display: "Other" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `data-absent-reason` (special-purpose, complete). */
export const DATA_ABSENT_REASON = {
  askedUnknown: { system: SYSTEM.DATA_ABSENT_REASON, code: "asked-unknown", display: "Asked But Unknown" },
  error: { system: SYSTEM.DATA_ABSENT_REASON, code: "error", display: "Error" },
  notANumber: { system: SYSTEM.DATA_ABSENT_REASON, code: "not-a-number", display: "Not a Number (NaN)" },
  notPerformed: { system: SYSTEM.DATA_ABSENT_REASON, code: "not-performed", display: "Not Performed" },
  notAsked: { system: SYSTEM.DATA_ABSENT_REASON, code: "not-asked", display: "Not Asked" },
  notApplicable: { system: SYSTEM.DATA_ABSENT_REASON, code: "not-applicable", display: "Not Applicable" },
  masked: { system: SYSTEM.DATA_ABSENT_REASON, code: "masked", display: "Masked" },
  unableToObtain: { system: SYSTEM.DATA_ABSENT_REASON, code: "unable-to-obtain", display: "Unable to Obtain" },
  tempUnknown: { system: SYSTEM.DATA_ABSENT_REASON, code: "temp-unknown", display: "Temporarily Unknown" },
  unknown: { system: SYSTEM.DATA_ABSENT_REASON, code: "unknown", display: "Unknown" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Patient.maritalStatus` (required binding to v3-MaritalStatus). */
export const MARITAL_STATUS = {
  announced: { system: SYSTEM.MARITAL_STATUS, code: "A", display: "Annulled" },
  divorced: { system: SYSTEM.MARITAL_STATUS, code: "D", display: "Divorced" },
  interlocutory: { system: SYSTEM.MARITAL_STATUS, code: "I", display: "Interlocutory" },
  legallySeparated: { system: SYSTEM.MARITAL_STATUS, code: "L", display: "Legally Separated" },
  married: { system: SYSTEM.MARITAL_STATUS, code: "M", display: "Married" },
  commonLaw: { system: SYSTEM.MARITAL_STATUS, code: "C", display: "Common Law" },
  polygamous: { system: SYSTEM.MARITAL_STATUS, code: "P", display: "Polygamous" },
  neverMarried: { system: SYSTEM.MARITAL_STATUS, code: "S", display: "Never Married" },
  domesticPartner: { system: SYSTEM.MARITAL_STATUS, code: "T", display: "Domestic partner" },
  unmarried: { system: SYSTEM.MARITAL_STATUS, code: "U", display: "unmarried" },
  widowed: { system: SYSTEM.MARITAL_STATUS, code: "W", display: "Widowed" },
} as const satisfies Record<string, Coding>;

/** v3-RoleCode roles seen in examples — audited subset of an unbounded catalog. */
export const ROLE_CODE_AUDITED = {
  ambulance: { system: SYSTEM.ROLE_CODE, code: "AMB", display: "Ambulance" },
  hospital: { system: SYSTEM.ROLE_CODE, code: "HOSP", display: "Hospital" },
  outpatientFacility: { system: SYSTEM.ROLE_CODE, code: "OF", display: "Outpatient Facility" },
  neuroradiologyUnit: { system: SYSTEM.ROLE_CODE, code: "RNEU", display: "Neuroradiology unit" },
  familyMember: { system: SYSTEM.ROLE_CODE, code: "FAMMEMB", display: "family member" },
  naturalMother: { system: SYSTEM.ROLE_CODE, code: "NMTH", display: "natural mother" },
} as const satisfies Record<string, Coding>;

/** v3-ActReason reasons seen in examples — audited subset of an unbounded catalog. */
export const ACT_REASON_AUDITED = {
  medicalPrecaution: { system: SYSTEM.ACT_REASON, code: "MEDPREC", display: "medical precaution" },
  outOfStock: { system: SYSTEM.ACT_REASON, code: "OS", display: "out of stock" },
} as const satisfies Record<string, Coding>;

/** v3-GTSAbbreviation timing abbreviations seen in examples — audited subset. */
export const GTS_ABBREVIATION_AUDITED = {
  bid: { system: SYSTEM.GTS_ABBREVIATION, code: "BID", display: "BID" },
} as const satisfies Record<string, Coding>;

/** v3-orderableDrugForm forms seen in examples — audited subset of an unbounded catalog. */
export const ORDERABLE_DRUG_FORM_AUDITED = {
  tablet: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "TAB", display: "Tablet" },
  capsule: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "CAP", display: "Capsule" },
  ointment: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "OINT", display: "Ointment" },
  ophthalmicDrops: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "OPDROP", display: "Ophthalmic Drops" },
  powder: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "POWD", display: "Powder" },
  scoop: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "SCOOP", display: "Scoop" },
  suppository: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "SUPP", display: "Suppository" },
  vaginalTablet: { system: SYSTEM.ORDERABLE_DRUG_FORM, code: "VAGTAB", display: "Vaginal Tablet" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `MedicationRequest.substitution.reason`-adjacent (extensible). */
export const SUBSTANCE_ADMIN_SUBSTITUTION = {
  noSubstitution: { system: SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION, code: "N", display: "No substitution" },
  allowGeneric: { system: SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION, code: "G", display: "Allow generic" },
  therapeuticBrand: { system: SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION, code: "TB", display: "therapeutic brand" },
  therapeuticForm: { system: SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION, code: "TF", display: "therapeutic form" },
  therapeuticClass: { system: SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION, code: "TE", display: "therapeutic class" },
  equivalent: { system: SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION, code: "E", display: "equivalent" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0074 (diagnostic service section ID) — official codes, examples exercise a subset. */
export const DIAGNOSTIC_SERVICE_SECTION = {
  audiology: { system: SYSTEM.V2_0074, code: "AU", display: "Audiology" },
  bloodGases: { system: SYSTEM.V2_0074, code: "BG", display: "Blood Gases" },
  cardiology: { system: SYSTEM.V2_0074, code: "EC", display: "Echocardiograph" },
  chemistry: { system: SYSTEM.V2_0074, code: "CH", display: "Chemistry" },
  computedTomography: { system: SYSTEM.V2_0074, code: "CT", display: "CAT Scan" },
  cytopathology: { system: SYSTEM.V2_0074, code: "CP", display: "Cytopathology" },
  electrocardiogram: { system: SYSTEM.V2_0074, code: "EN", display: "Electroencephalogram" },
  hematology: { system: SYSTEM.V2_0074, code: "HM", display: "Hematology" },
  microbiology: { system: SYSTEM.V2_0074, code: "MB", display: "Microbiology" },
  other: { system: SYSTEM.V2_0074, code: "OTH", display: "Other" },
  obstetricsUltrasound: { system: SYSTEM.V2_0074, code: "OUS", display: "OB Ultrasound" },
  physicalTherapy: { system: SYSTEM.V2_0074, code: "PT", display: "Physical Therapy" },
  radiology: { system: SYSTEM.V2_0074, code: "RAD", display: "Radiology" },
  ultrasound: { system: SYSTEM.V2_0074, code: "US", display: "Ultrasound" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0116 (bed status) — official codes, examples exercise a subset. */
export const BED_STATUS = {
  occupied: { system: SYSTEM.V2_0116, code: "O", display: "Occupied" },
  unoccupied: { system: SYSTEM.V2_0116, code: "U", display: "Unoccupied" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0131 (contact role) — official codes, examples exercise a subset. */
export const V2_CONTACT_ROLE = {
  billingContact: { system: SYSTEM.V2_0131, code: "BP", display: "Billing contact" },
  formManager: { system: SYSTEM.V2_0131, code: "C", display: "Supervisor/Form Manager" },
  contractingPerson: { system: SYSTEM.V2_0131, code: "CP", display: "Contracting Person" },
  employer: { system: SYSTEM.V2_0131, code: "E", display: "Employer" },
  patientLanguageContact: { system: SYSTEM.V2_0131, code: "PL", display: "Patient Language Contact" },
  primaryCareProvider: { system: SYSTEM.V2_0131, code: "PM", display: "Primary care provider" },
  stateAgency: { system: SYSTEM.V2_0131, code: "S", display: "State agency" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0203 (identifier type) — audited subset of a very large table. */
export const IDENTIFIER_TYPE_AUDITED = {
  accession: { system: SYSTEM.V2_0203, code: "ACSN", display: "Accession ID" },
  nationalInsurancePayor: { system: SYSTEM.V2_0203, code: "NIIP", display: "National Insurance Payor Identifier (Payor)" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0360 (degree/license) — audited subset. */
export const V2_DEGREE_AUDITED = {
  bachelorOfScience: { system: SYSTEM.V2_0360, code: "BS", display: "Bachelor of Science" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0443 (provider role) — audited subset of a large table. */
export const V2_PROVIDER_ROLE_AUDITED = {
  administeringProvider: { system: SYSTEM.V2_0443, code: "AP", display: "Administering Provider" },
  enteringProvider: { system: SYSTEM.V2_0443, code: "EP", display: "Entering Provider" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 table 0916 (fast status) — audited pairs as found in examples. */
export const V2_FAST_STATUS_AUDITED = {
  notFasted: { system: SYSTEM.V2_0916, code: "NF", display: "The patient indicated they did not fast prior to the procedure." },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Communication.category` (extensible, example codes). */
export const COMMUNICATION_CATEGORY = {
  alert: { system: SYSTEM.COMMUNICATION_CATEGORY, code: "alert", display: "Alert" },
  appointment: { system: SYSTEM.COMMUNICATION_CATEGORY, code: "appointment", display: "Appointment reminder" },
  notification: { system: SYSTEM.COMMUNICATION_CATEGORY, code: "notification", display: "Notification" },
  instruction: { system: SYSTEM.COMMUNICATION_CATEGORY, code: "instruction", display: "Instruction" },
  progressUpdate: { system: SYSTEM.COMMUNICATION_CATEGORY, code: "progress-update", display: "Progress Update" },
  report: { system: SYSTEM.COMMUNICATION_CATEGORY, code: "report", display: "Report" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Coverage.subscriberRelationship`-adjacent `Coverage.relationship` (required binding). */
export const SUBSCRIBER_RELATIONSHIP = {
  child: { system: SYSTEM.SUBSCRIBER_RELATIONSHIP, code: "child", display: "Child" },
  parent: { system: SYSTEM.SUBSCRIBER_RELATIONSHIP, code: "parent", display: "Parent" },
  spouse: { system: SYSTEM.SUBSCRIBER_RELATIONSHIP, code: "spouse", display: "Spouse" },
  common: { system: SYSTEM.SUBSCRIBER_RELATIONSHIP, code: "common", display: "Common Law Spouse" },
  other: { system: SYSTEM.SUBSCRIBER_RELATIONSHIP, code: "other", display: "Other" },
  self: { system: SYSTEM.SUBSCRIBER_RELATIONSHIP, code: "self", display: "Self" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Coverage.selfPay`-adjacent policyholder self-pay coding. */
export const COVERAGE_SELFPAY = {
  pay: { system: SYSTEM.COVERAGE_SELFPAY, code: "pay", display: "Pay" },
} as const satisfies Record<string, Coding>;

/** HL7 v2 `service-type` example codes — audited; note examples disagreed on 186's display. */
export const SERVICE_TYPE_AUDITED = {
  obstetricsGynaecology: { system: SYSTEM.SERVICE_TYPE, code: "186", display: "Obstetrics & Gynaecology" },
  urology: { system: SYSTEM.SERVICE_TYPE, code: "222", display: "Urology" },
} as const satisfies Record<string, Coding>;

/** ATC-style route codes used in SATUSEHAT medication examples — audited subset. */
export const ATC_ROUTE_AUDITED = {
  oral: { system: SYSTEM.ATC, code: "O", display: "Oral" },
  parenteral: { system: SYSTEM.ATC, code: "P", display: "Parenteral" },
  rectal: { system: SYSTEM.ATC, code: "R", display: "Rectal" },
  vaginal: { system: SYSTEM.ATC, code: "V", display: "Vaginal" },
  injectionIntramuscular: { system: SYSTEM.ATC, code: "inj.intramuscular", display: "Injection Intramuscular" },
  injectionSubcutaneous: { system: SYSTEM.ATC, code: "inj.subcutaneous", display: "Injection Subcutaneous" },
  ocular: { system: SYSTEM.ATC, code: "ocular", display: "Ocular" },
  ointment: { system: SYSTEM.ATC, code: "ointment", display: "Ointment" },
} as const satisfies Record<string, Coding>;

/** Kemkes cancer TNM categories — patterned on standard TNM notation; examples exercise a subset. */
export const KEMKES_CANCER_T_CATEGORY = {
  t0: { system: SYSTEM.KEMKES_CANCER_T_CATEGORY, code: "T0", display: "T0" },
  t1: { system: SYSTEM.KEMKES_CANCER_T_CATEGORY, code: "T1", display: "T1" },
  t2: { system: SYSTEM.KEMKES_CANCER_T_CATEGORY, code: "T2", display: "T2" },
  t3: { system: SYSTEM.KEMKES_CANCER_T_CATEGORY, code: "T3", display: "T3" },
  t4: { system: SYSTEM.KEMKES_CANCER_T_CATEGORY, code: "T4", display: "T4" },
} as const satisfies Record<string, Coding>;

export const KEMKES_CANCER_N_CATEGORY = {
  n0: { system: SYSTEM.KEMKES_CANCER_N_CATEGORY, code: "N0", display: "N0" },
  n1: { system: SYSTEM.KEMKES_CANCER_N_CATEGORY, code: "N1", display: "N1" },
  n2: { system: SYSTEM.KEMKES_CANCER_N_CATEGORY, code: "N2", display: "N2" },
  n3: { system: SYSTEM.KEMKES_CANCER_N_CATEGORY, code: "N3", display: "N3" },
} as const satisfies Record<string, Coding>;

export const KEMKES_CANCER_M_CATEGORY = {
  m0: { system: SYSTEM.KEMKES_CANCER_M_CATEGORY, code: "M0", display: "M0" },
  m1: { system: SYSTEM.KEMKES_CANCER_M_CATEGORY, code: "M1", display: "M1" },
} as const satisfies Record<string, Coding>;

/** Kemkes `episodeofcare-type` — audited examples only. */
export const KEMKES_EPISODE_OF_CARE_TYPE = {
  antenatalCare: { system: SYSTEM.KEMKES_EPISODE_OF_CARE_TYPE, code: "MAT-ANC", display: "Antenatal Care" },
  tuberculosisSensitive: { system: SYSTEM.KEMKES_EPISODE_OF_CARE_TYPE, code: "TB-SO", display: "Tuberkulosis Sensitif Obat" },
  cancer: { system: SYSTEM.KEMKES_EPISODE_OF_CARE_TYPE, code: "cancer", display: "Cancer Management Care" },
} as const satisfies Record<string, Coding>;

/** Kemkes `keluarga-sejahtera` (family welfare status) — audited examples only. */
export const KEMKES_KELUARGA_SEJAHTERA = {
  praSejahtera: { system: SYSTEM.KEMKES_KELUARGA_SEJAHTERA, code: "KPS", display: "Keluarga Pra Sejahtera (KPS)" },
} as const satisfies Record<string, Coding>;

/** Kemkes `chargeItemResponse-status` — audited examples only. */
export const KEMKES_CHARGE_ITEM_RESPONSE_STATUS = {
  dijamin: { system: SYSTEM.KEMKES_CHARGE_ITEM_RESPONSE_STATUS, code: "CIR000001", display: "Dijamin" },
} as const satisfies Record<string, Coding>;

/** Kemkes `v1-0201` (encounter-history reasons) — audited examples only. */
export const KEMKES_V1_0201 = {
  followUp: { system: SYSTEM.KEMKES_V1_0201, code: "follow-up", display: "Follow up" },
  suspek: { system: SYSTEM.KEMKES_V1_0201, code: "suspected", display: "Suspek" },
  screeningTraveler: { system: SYSTEM.KEMKES_V1_0201, code: "screening-traveler", display: "Screening for traveler" },
  screeningOther: { system: SYSTEM.KEMKES_V1_0201, code: "screening-other", display: "Skrining - alasan lain" },
} as const satisfies Record<string, Coding>;

/** Kemkes `v1-0302` (nakes document types) — audited examples only. */
export const KEMKES_V1_0302 = {
  strKki: { system: SYSTEM.KEMKES_V1_0302, code: "STR-KKI", display: "Surat Tanda Registrasi Dokter" },
} as const satisfies Record<string, Coding>;

/**
 * Codes used with the bare Kemkes terminology root as their system
 * (`http://terminology.kemkes.go.id`, no CodeSystem path) — Composition
 * section codes and clinical-note categories. Audited examples only.
 */
export const KEMKES_ROOT_CODE_AUDITED = {
  anamnesis: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000003", display: "Anamnesis" },
  diagnosis: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000004", display: "Diagnosis" },
  tindakanProsedurMedis: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000005", display: "Tindakan/Prosedur Medis" },
  pemeriksaanFisik: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000007", display: "Pemeriksaan Fisik" },
  hasilPemeriksaanPenunjang: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000009", display: "Hasil Pemeriksaan Penunjang" },
  obat: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000013", display: "Obat" },
  persetujuanPasien: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000018", display: "Pilihan atas persetujuan pasien" },
  diagnosticProcedure: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000028", display: "Diagnostic procedure" },
  statusPurifikasi: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000046", display: "Status Purifikasi" },
  lolosPurifikasi: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000047", display: "Lolos Purifikasi" },
  rasionalKlinis: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000056", display: "Rasional Klinis" },
  emergencyCarePlan: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000068", display: "Emergency care plan" },
  skrining: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "TK000129", display: "Skrining" },
  chiefComplaint: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "chief-complaint", display: "Chief Complaint" },
  inpatientAdmission: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "inpatient-admission", display: "Admisi Rawat Inap" },
  previousCondition: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "previous-condition", display: "Previous Condition" },
  purifikasi: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "purifikasi", display: "Purifikasi" },
  spri: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "spri", display: "Surat Perintah Rawat Inap" },
  verifikasi: { system: SYSTEM.KEMKES_TERMINOLOGY_ROOT, code: "verifikasi", display: "Verifikasi" },
} as const satisfies Record<string, Coding>;
