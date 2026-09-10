import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/** FHIR R4 `Organization.type` (extensible). */
export const ORGANIZATION_TYPE = {
  prov: { system: SYSTEM.ORGANIZATION_TYPE, code: "prov", display: "Healthcare Provider" },
  dept: { system: SYSTEM.ORGANIZATION_TYPE, code: "dept", display: "Hospital Department" },
  team: { system: SYSTEM.ORGANIZATION_TYPE, code: "team", display: "Organizational team" },
  govt: { system: SYSTEM.ORGANIZATION_TYPE, code: "govt", display: "Government" },
  insured: { system: SYSTEM.ORGANIZATION_TYPE, code: "ins", display: "Insurance Company" },
  pay: { system: SYSTEM.ORGANIZATION_TYPE, code: "pay", display: "Payer" },
  edu: { system: SYSTEM.ORGANIZATION_TYPE, code: "edu", display: "Educational Institute" },
  religious: { system: SYSTEM.ORGANIZATION_TYPE, code: "rel", display: "Religious Institution" },
  crs: { system: SYSTEM.ORGANIZATION_TYPE, code: "crs", display: "Clinical Research Sponsor" },
  cg: { system: SYSTEM.ORGANIZATION_TYPE, code: "cg", display: "Community Group" },
  bus: { system: SYSTEM.ORGANIZATION_TYPE, code: "bus", display: "Non-Healthcare Business" },
  other: { system: SYSTEM.ORGANIZATION_TYPE, code: "other", display: "Other" },
} as const satisfies Record<string, Coding>;

/** Kemkes `organization-type` (faskes levels) — audited examples only. */
export const KEMKES_ORGANIZATION_TYPE = {
  fktp: { system: SYSTEM.KEMKES_ORGANIZATION_TYPE, code: "FKTP", display: "Fasilitas Kesehatan Tingkat 1" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Location.physicalType` (example codes). */
export const LOCATION_PHYSICAL_TYPE = {
  building: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "bu", display: "Building" },
  wing: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "wi", display: "Wing" },
  ward: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "wa", display: "Ward" },
  level: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "lvl", display: "Level" },
  corridor: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "co", display: "Corridor" },
  room: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "ro", display: "Room" },
  vehicle: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "ve", display: "Vehicle" },
  house: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "ho", display: "House" },
  cabinet: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "ca", display: "Cabinet" },
  road: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "rd", display: "Road" },
  area: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "area", display: "Area" },
  jurisdiction: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "jdn", display: "Jurisdiction" },
  bed: { system: SYSTEM.LOCATION_PHYSICAL_TYPE, code: "bd", display: "Bed" },
} as const satisfies Record<string, Coding>;

/** FHIR R4 `Organization.contact.purpose` (extensible). */
export const CONTACT_ENTITY_TYPE = {
  billing: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "BILL", display: "Billing" },
  admin: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "ADMIN", display: "Administrative" },
  hr: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "HR", display: "Human Resource" },
  payroll: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "PAYR", display: "Payroll" },
  press: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "PRESS", display: "Press" },
  legal: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "LEGAL", display: "Legal" },
  accounting: { system: SYSTEM.CONTACT_ENTITY_TYPE, code: "ACCOUNTING", display: "Accounting" },
} as const satisfies Record<string, Coding>;

/** Kemkes `location-type` (SATUSEHAT faskes room/location classes) — audited examples only. */
export const KEMKES_LOCATION_TYPE = {
  tempatTidur: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "RT0004", display: "Tempat Tidur" },
  igd: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "RT0006", display: "Instalasi Gawat Darurat" },
  icu: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "RT0007", display: "Ruang Perawatan Intensif Umum (ICU)" },
  hcu: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "RT0013", display: "High Care Unit (HCU)" },
  ruangRawatInap: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "RT0016", display: "Ruang Rawat Inap" },
  ruangOperasi: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "RT0025", display: "Ruang Operasi" },
  tempatMeninggalFaskes: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "LT000002", display: "Tempat Meninggal Faskes" },
  alamatMati: { system: SYSTEM.KEMKES_LOCATION_TYPE, code: "LT000005", display: "Alamat Mati" },
} as const satisfies Record<string, Coding>;

/** Kemkes inpatient service classes for Location — audited examples only. */
export const KEMKES_LOCATION_SERVICE_CLASS_INPATIENT = {
  kelas1: { system: SYSTEM.KEMKES_LOCATION_SERVICE_CLASS_INPATIENT, code: "1", display: "Kelas 1" },
  kelas2: { system: SYSTEM.KEMKES_LOCATION_SERVICE_CLASS_INPATIENT, code: "2", display: "Kelas 2" },
  kelas3: { system: SYSTEM.KEMKES_LOCATION_SERVICE_CLASS_INPATIENT, code: "3", display: "Kelas 3" },
  vip: { system: SYSTEM.KEMKES_LOCATION_SERVICE_CLASS_INPATIENT, code: "vip", display: "Kelas VIP" },
} as const satisfies Record<string, Coding>;

/** Kemkes outpatient service classes for Location — per the official rme-rawat-jalan doc. */
export const KEMKES_LOCATION_SERVICE_CLASS_OUTPATIENT = {
  reguler: { system: SYSTEM.KEMKES_LOCATION_SERVICE_CLASS_OUTPATIENT, code: "reguler", display: "Kelas Reguler" },
  eksekutif: { system: SYSTEM.KEMKES_LOCATION_SERVICE_CLASS_OUTPATIENT, code: "eksekutif", display: "Kelas Eksekutif" },
} as const satisfies Record<string, Coding>;

/** Kemkes `locationUpgradeClass` — per the official rme-rawat-jalan doc. */
export const KEMKES_LOCATION_UPGRADE_CLASS = {
  kelasTetap: { system: SYSTEM.KEMKES_LOCATION_UPGRADE_CLASS, code: "kelas-tetap", display: "Kelas Tetap Perawatan" },
  naikKelas: { system: SYSTEM.KEMKES_LOCATION_UPGRADE_CLASS, code: "naik-kelas", display: "Kenaikan Kelas Perawatan" },
  turunKelas: { system: SYSTEM.KEMKES_LOCATION_UPGRADE_CLASS, code: "turun-kelas", display: "Penurunan Kelas Perawatan" },
  titipRawat: { system: SYSTEM.KEMKES_LOCATION_UPGRADE_CLASS, code: "titip-rawat", display: "Titip Kelas Perawatan" },
} as const satisfies Record<string, Coding>;
