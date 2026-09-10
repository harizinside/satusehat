import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/** FHIR R4 `Claim.type` / `ClaimResponse.type` / `ExplanationOfBenefit.type` (extensible). */
export const CLAIM_TYPE = {
  institutional: { system: SYSTEM.CLAIM_TYPE, code: "institutional", display: "Institutional" },
  oral: { system: SYSTEM.CLAIM_TYPE, code: "oral", display: "Oral" },
  pharmacy: { system: SYSTEM.CLAIM_TYPE, code: "pharmacy", display: "Pharmacy" },
  professional: { system: SYSTEM.CLAIM_TYPE, code: "professional", display: "Professional" },
  vision: { system: SYSTEM.CLAIM_TYPE, code: "vision", display: "Vision" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Claim.payee.type` (extensible). */
export const CLAIM_PAYEE_TYPE = {
  provider: { system: SYSTEM.PAYEE_TYPE, code: "provider", display: "Provider" },
  subscriber: { system: SYSTEM.PAYEE_TYPE, code: "subscriber", display: "Subscriber" },
  party: { system: SYSTEM.PAYEE_TYPE, code: "party", display: "Any party" },
} as const satisfies Record<string, Coding>;

/** Kemkes `claiminformationcategory` for Claim.supportingInfo — audited examples only. */
export const KEMKES_CLAIM_INFORMATION_CATEGORY = {
  encounter: { system: SYSTEM.KEMKES_CLAIM_INFORMATION_CATEGORY, code: "encounter", display: "Encounter" },
  invoice: { system: SYSTEM.KEMKES_CLAIM_INFORMATION_CATEGORY, code: "invoice", display: "Invoice" },
  eKlaimVersion: { system: SYSTEM.KEMKES_CLAIM_INFORMATION_CATEGORY, code: "e-klaim-version", display: "Versi Aplikasi E-Klaim" },
  unuGrouperVersion: { system: SYSTEM.KEMKES_CLAIM_INFORMATION_CATEGORY, code: "unu-grouper-version", display: "Versi Grouper INACBG" },
  upgradeClassIndicator: { system: SYSTEM.KEMKES_CLAIM_INFORMATION_CATEGORY, code: "upgrade-class-indicator", display: "Indikator Naik Kelas" },
  upgradeClassClass: { system: SYSTEM.KEMKES_CLAIM_INFORMATION_CATEGORY, code: "upgrade-class-class", display: "Kenaikan Kelas" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `PaymentReconciliation.type`-adjacent payment type (example codes). */
export const PAYMENT_TYPE = {
  payment: { system: SYSTEM.PAYMENT_TYPE, code: "payment", display: "Payment" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `PaymentNotice.status` / `PaymentReconciliation.status` codes. */
export const PAYMENT_STATUS = {
  paid: { system: SYSTEM.PAYMENT_STATUS, code: "paid", display: "Paid" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Claim.priority` / `Request.priority` (extensible). */
export const PROCESS_PRIORITY = {
  normal: { system: SYSTEM.PROCESS_PRIORITY, code: "normal", display: "Normal" },
  stat: { system: SYSTEM.PROCESS_PRIORITY, code: "stat", display: "STAT" },
  asap: { system: SYSTEM.PROCESS_PRIORITY, code: "asap", display: "ASAP" },
  routine: { system: SYSTEM.PROCESS_PRIORITY, code: "routine", display: "Routine" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Claim.diagnosis.diagnosisRole` / `ExplanationOfBenefit.diagnosisRole` (extensible). */
export const DIAGNOSIS_ROLE = {
  admitting: { system: SYSTEM.DIAGNOSIS_ROLE, code: "AD", display: "Admission diagnosis" },
  discharge: { system: SYSTEM.DIAGNOSIS_ROLE, code: "DD", display: "Discharge diagnosis" },
  chiefComplaint: { system: SYSTEM.DIAGNOSIS_ROLE, code: "CC", display: "Chief Complaint" },
  comorbidity: { system: SYSTEM.DIAGNOSIS_ROLE, code: "CM", display: "Comorbidity Diagnosis" },
  billing: { system: SYSTEM.DIAGNOSIS_ROLE, code: "billing", display: "Billing" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `ClaimResponse.item.adjudication.category` (example codes). */
export const ADJUDICATION_CATEGORY = {
  submitted: { system: SYSTEM.ADJUDICATION, code: "submitted", display: "Submitted Amount" },
  copay: { system: SYSTEM.ADJUDICATION, code: "copay", display: "CoPay" },
  eligible: { system: SYSTEM.ADJUDICATION, code: "eligible", display: "Eligible Amount" },
  deductible: { system: SYSTEM.ADJUDICATION, code: "deductible", display: "Deductible" },
  unallocDeduct: { system: SYSTEM.ADJUDICATION, code: "unallocdeduct", display: "Unallocated Deductible" },
  eligiblePercent: { system: SYSTEM.ADJUDICATION, code: "eligpercent", display: "Eligible %" },
  tax: { system: SYSTEM.ADJUDICATION, code: "tax", display: "Emergency Tax" },
  benefit: { system: SYSTEM.ADJUDICATION, code: "benefit", display: "Benefit Amount" },
} as const satisfies Record<string, Coding>;

/**
 * FHIR R4 `Coverage.class.type` (extensible). Kemkes flows additionally use
 * the Kemkes `coverage-class` CodeSystem (see `KEMKES_COVERAGE_CLASS` below).
 */
export const COVERAGE_CLASS = {
  group: { system: SYSTEM.COVERAGE_CLASS, code: "group", display: "Group" },
  plan: { system: SYSTEM.COVERAGE_CLASS, code: "plan", display: "Plan" },
  class: { system: SYSTEM.COVERAGE_CLASS, code: "class", display: "Class" },
  subclass: { system: SYSTEM.COVERAGE_CLASS, code: "subclass", display: "SubClass" },
} as const satisfies Record<string, Coding>;

/** Kemkes `coverage-class` benefit classes for Coverage.class — audited examples only. */
export const KEMKES_COVERAGE_CLASS = {
  ambulatoryBenefits: { system: SYSTEM.KEMKES_COVERAGE_CLASS, code: "COV000004", display: "Ambulatory benefits" },
  inpatientBenefits: { system: SYSTEM.KEMKES_COVERAGE_CLASS, code: "COV000011", display: "Inpatient benefits" },
} as const satisfies Record<string, Coding>;

/** Kemkes `claimresponse-adjudication` — audited examples only. */
export const KEMKES_CLAIM_RESPONSE_ADJUDICATION = {
  layak: { system: SYSTEM.KEMKES_CLAIM_RESPONSE_ADJUDICATION, code: "CRA000001", display: "Layak" },
} as const satisfies Record<string, Coding>;

/** Kemkes INACBG claim codings (v5) — audited examples only. The grouper /
 * special-CMG / sub-acute CodeSystem URIs themselves are free-text code
 * spaces exposed as `SYSTEM.KEMKES_INACBG_V5`, `..._SPECIAL_CMG_V5`, `..._SAC_V5`. */
export const KEMKES_INACBG = {
  tariffClass: { system: SYSTEM.KEMKES_TARIFF_CLASS, code: "AP", display: "Tarif Kelas A Pemerintah" },
  upgradeClassIndicator: { system: SYSTEM.KEMKES_UPGRADE_CLASS_INDICATOR, code: "upgrade", display: "Ada Kenaikan Kelas" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `CoverageEligibilityResponse` benefit categories (example codes). */
export const BENEFIT_TYPE = {
  room: { system: SYSTEM.BENEFIT_TYPE, code: "room", display: "Room" },
  benefit: { system: SYSTEM.EX_BENEFIT_CATEGORY, code: "30", display: "Health Benefit Plan Coverage" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `ExplanationOfBenefit.diagnosis.type` / `Claim.diagnosis.type` (example). */
export const DIAGNOSIS_TYPE = {
  discharge: { system: SYSTEM.EX_DIAGNOSIS_TYPE, code: "discharge", display: "Discharge Diagnosis" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `PaymentReconciliation.paymentDetail.type`-adjacent codes (example). */
export const EX_PAYMENT_TYPE = {
  complete: { system: SYSTEM.EX_PAYMENT_TYPE, code: "complete", display: "Complete" },
} as const satisfies Record<string, Coding>;
