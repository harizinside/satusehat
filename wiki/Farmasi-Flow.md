# Alur Pelayanan Farmasi (e-Resep + Dispensing)

Status: **peresepan flow confirmed PASS live ke staging** (13/13 step, 2026-09-24). Pengeluaran (MedicationDispense di apotek) baru digenerate — name + body shape udah valid dari body contoh collection, tapi belum dieksekusi ke server; wajib dry-run dengan Encounter apotek + Organization Farmasi/Apotek + Location apotek yang udah ke-setup.

Pola klinis & gotcha umum sama kayak Rawat Jalan / Gigi (lihat [Rawat-Jalan-Flow](Rawat-Jalan-Flow.md) buat hal-hal kayak `Medication.extension`, PATCH content-type, identifier namespaces), yang gak diulang di sini. Detail field wajib yang baru ke-discoversaat live smoke ada di [Known-Issues](Known-Issues.md) bagian "Farmasi peresepan (e-Resep)" — **wajib dibaca** sebelum kirim body yang kompleks (Observation BB/TB, MedicationRequest dengan `contained` Medication, Encounter closing).

Modul ini fokus ke **2 peran** yang paling umum:

1. **Fasyankes (peresepan)** — Encounter + Condition + Observation + MedicationRequest + DocumentReference buat dapet **No. Resep Nasional**.
2. **Apotek luar fasyankes (pengeluaran)** — pake No. Resep Nasional di atas buat ambil resep, bikin Encounter apotek, lalu `POST /MedicationDispense` (dengan/tanpa substitusi), terus tutup Encounter.

> Resource `DocumentReference` sebenernya umum (siapa aja bisa upload dokumen klinis), tapi helper-nya sengaja di-expose sebagai `client.fhir.documentReference.documentreferenceCreate/Search/...` supaya bisa dipake di luar Farmasi juga. Yang spesifik-Farmasi cuma `nationalPrescriptionIdentifier()` di `coding.*`.

## Prerequisites

Semua asumsi kayak prerequisites biasa ([Prerequisites-Flow](Prerequisites-Flow.md)): Organization + Location + cari Patient/Practitioner. Bedanya farmasi butuh **3 org** di awal:

- **UKP / Poli** (buat Encounter peresepan) → `Organization/ukpId`
- **Farmasi/Apotek** (buat Location apotek) → `Organization/apotekOrgId` + `Location/apotekRoomId`

Buat Encounter apotek di pengeluaran, pake `Location/apotekRoomId` sebagai Encounter.location.

## Flow peresepan (Fasyankes → No. Resep Nasional)

```ts
// 1. Mulai Encounter di poli
const enc = await client.farmasi.peresepan.createEncounter({
  resourceType: "Encounter",
  status: "arrived",
  class: { system: coding.SYSTEM.ACT_CODE, code: "AMB", display: "ambulatory" },
  subject: { reference: `Patient/${patientId}` },
  serviceProvider: { reference: `Organization/${ukpId}` },
  participant: [{ individual: { reference: `Practitioner/${doctorId}` } }],
  period: { start: encounterStart },
  location: [{ location: { reference: `Location/${poliRoomId}` } }],
});

// 2. Encounter masuk ruangan (opsional, kalau alurnya lewat triase/ruang dulu)
await client.farmasi.peresepan.updateEncounter(enc.id, {
  resourceType: "Encounter",
  id: enc.id,
  status: "in-progress",
  class: { system: coding.SYSTEM.ACT_CODE, code: "AMB", display: "ambulatory" },
  subject: { reference: `Patient/${patientId}` },
  serviceProvider: { reference: `Organization/${ukpId}` },
  participant: [{ individual: { reference: `Practitioner/${doctorId}` } }],
  period: { start: encounterStart },
});

// 3. Condition keluhan utama + diagnosis (sesuai input klinis)
await client.farmasi.peresepan.createCondition({ /* keluhan utama */ });
await client.farmasi.peresepan.createCondition({ /* diagnosis ICD-10 */ });

// 4. Observation BB/TB (opsional, kalau mau di-attach ke resep)
await client.farmasi.peresepan.createObservation({ /* berat badan */ });
await client.farmasi.peresepan.createObservation({ /* tinggi badan */ });

// 5. MedicationRequest — 7 varian payload (generik, merek, kombinasi,
//    racikan DTD/non-DTD, tetes mata) — generator udah merge semuanya jadi
//    satu `createMedicationRequest(body)`. Field `contained` wajib ada
//    (Medication profile SATU SEHAT), sama `dispenseRequest.performer`
//    yang nunjuk ke Organization farmasi.
await client.farmasi.peresepan.createMedicationRequest({
  resourceType: "MedicationRequest",
  identifier: [{
    system: coding.kemkesResourceIdentifierSystem("prescription-item", ukpId),
    value: registrationId,
  }],
  status: "active",
  intent: "order",
  category: [{ coding: [{ system: coding.SYSTEM.MEDICATIONREQUEST_CATEGORY, code: "outpatient" }] }],
  medicationReference: { reference: "#medication-001" }, // contained Medication
  subject: { reference: `Patient/${patientId}` },
  encounter: { reference: `Encounter/${enc.id}` },
  requester: { reference: `Practitioner/${doctorId}` },
  dispenseRequest: {
    dispenseInterval: { value: 1, unit: "d", system: coding.SYSTEM.UCUM, code: "d" },
    validityPeriod: { start: "...", end: "..." },
    quantity: { value: 10, unit: "TAB", system: coding.SYSTEM.ORDERABLE_DRUG_FORM, code: "TAB" },
    expectedSupplyDuration: { value: 5, unit: "d", system: coding.SYSTEM.UCUM, code: "d" },
    performer: { reference: `Organization/${apotekOrgId}` },
  },
  contained: [{ resourceType: "Medication", id: "medication-001", /* KFA/Formularium data */ }],
});

// (repeat step 5 buat tiap item resep)

// 6. POST /DocumentReference — dapet No. Resep Nasional
//    Identifier system-nya HARUS http://sys-ids.kemkes.go.id/prescription/national
//    (helper: coding.nationalPrescriptionIdentifier("...")).
//    `context.related` nunjuk ke SEMUA MedicationRequest + Observation yang
//    mau di-attach ke resep ini.
const docRef = await client.farmasi.peresepan.createDocumentReference({
  resourceType: "DocumentReference",
  status: "current",
  docStatus: "final",
  type: { coding: [{ system: coding.SYSTEM.LOINC, code: "57833-6", display: "Prescription for medication" }] },
  category: [{ coding: [{ system: coding.SYSTEM.LOINC, code: "18776-5", display: "Plan of care note" }] }],
  subject: { reference: `Patient/${patientId}` },
  date: now,
  author: [{ reference: `Practitioner/${doctorId}` }],
  custodian: { reference: `Organization/${ukpId}` },
  context: {
    encounter: [{ reference: `Encounter/${enc.id}` }],
    related: [
      ...medicationRequestRefs.map((r) => ({ reference: r })), // ["MedicationRequest/x1", ...]
      ...observationRefs.map((r) => ({ reference: r })),
    ],
  },
});

// Response-nya: docRef.identifier[0].value => No. Resep Nasional (server-generated).
const noResep = docRef.identifier?.[0]?.value;
if (!noResep) throw new Error("server didn't issue No. Resep Nasional");

// 7. Ambil ulang by No. Resep Nasional (sanity check + dapet MedicationRequest
//    + Observation yang di-attach lewat `_include=DocumentReference:related`).
const lookup = await client.farmasi.peresepan.searchDocumentReference({
  identifier: coding.nationalPrescriptionIdentifier(noResep).system + "|" + noResep,
  _include: "DocumentReference:related",
});
// atau via MedicationRequest identifier:
const mrLookup = await client.farmasi.peresepan.searchMedicationRequest({
  identifier: `http://sys-ids.kemkes.go.id/prescription/national|${noResep}`,
});

// 8. Tutup Encounter peresepan
await client.farmasi.peresepan.updateEncounter(enc.id, { /* status: "finished", ... */ });
```

## Flow pengeluaran (Apotek luar fasyankes)

```ts
// 1. Apotek nerima No. Resep Nasional (dari pasien / rujukan), lookup dulu
const found = await client.farmasi.pengeluaran.searchDocumentReference({
  identifier: `http://sys-ids.kemkes.go.id/prescription/national|${noResep}`,
  _include: "DocumentReference:related",
});

// 2. Bikin Encounter apotek (class AMB, location = apotek)
const encApotek = await client.farmasi.pengeluaran.createEncounter({
  resourceType: "Encounter",
  identifier: [{
    system: coding.kemkesResourceIdentifierSystem("encounter", apotekOrgId),
    value: encounterApotekRegistrationId,
  }],
  status: "arrived",
  class: { system: coding.SYSTEM.ACT_CODE, code: "AMB", display: "ambulatory" },
  serviceType: { coding: [{ system: coding.SYSTEM.SERVICE_TYPE, code: "124", display: "Pharmacy" }] },
  subject: { reference: `Patient/${patientId}` },
  participant: [{ individual: { reference: `Practitioner/${apotekerId}` } }],
  period: { start: now },
  location: [{ location: { reference: `Location/${apotekRoomId}` } }],
  serviceProvider: { reference: `Organization/${apotekOrgId}` },
});

// 3. MedicationDispense — TANPA substitusi (7 varian):
//    cukup `substitution.wasSubstituted = false`
await client.farmasi.pengeluaran.createMedicationDispense({
  resourceType: "MedicationDispense",
  identifier: [{
    system: coding.kemkesResourceIdentifierSystem("prescription-item", apotekOrgId),
    value: dispenseId,
  }],
  status: "completed",
  category: { coding: [{ system: coding.SYSTEM.MEDICATIONDISPENSE_CATEGORY, code: "outpatient" }] },
  medicationReference: { reference: "#medication-001" },
  subject: { reference: `Patient/${patientId}` },
  context: { reference: `Encounter/${encApotek.id}` },
  performer: [{ actor: { reference: `Practitioner/${apotekerId}` } }],
  authorizingPrescription: [{ reference: `MedicationRequest/${mrId}` }],
  quantity: { value: 10, unit: "TAB", system: coding.SYSTEM.ORDERABLE_DRUG_FORM, code: "TAB" },
  daysSupply: { value: 5, unit: "d", system: coding.SYSTEM.UCUM, code: "d" },
  whenPrepared: preparedAt,
  whenHandedOver: handedOverAt,
  substitution: { wasSubstituted: false },
  contained: [{ resourceType: "Medication", id: "medication-001", /* ... */ }],
});

// 4. MedicationDispense — DENGAN substitusi: nested `substitution.type` (code TG/TE/TB/BC/E)
//    + `substitution.reason` (code FP/OS/...). Generator merge semuanya jadi
//    satu interface jadi gak perlu liat 8 varian terpisah.
await client.farmasi.pengeluaran.createMedicationDispense({
  // ...field sama kayak di atas...
  substitution: {
    wasSubstituted: true,
    type: {
      coding: [{
        system: coding.SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION,
        code: "TG",
        display: "therapeutic generic",
      }],
    },
    reason: [{
      coding: [{
        system: coding.SYSTEM.ACT_REASON,
        code: "OS",
        display: "out of stock",
      }],
    }],
  },
});

// 5. Cek semua dispense di encounter apotek
const all = await client.farmasi.pengeluaran.searchMedicationDispense({
  context: encApotek.id,
  subject: patientId,
});

// 6. Tutup encounter apotek
await client.farmasi.pengeluaran.updateEncounter(encApotek.id, {
  resourceType: "Encounter",
  id: encApotek.id,
  status: "finished",
  // ...field wajib lain sama kayak Encounter closing di Rawat Jalan (identifier,
  // statusHistory dengan start+end, hospitalization.dischargeDisposition).
});

// 7. Cek DocRef post-dispense (server biasanya update statusnya sendiri)
const post = await client.farmasi.pengeluaran.searchDocumentReference({
  identifier: `http://sys-ids.kemkes.go.id/prescription/national|${noResep}`,
});
```

## Bundle (transaction)

Kirim multi-step farmasi (peresepan atau dispensing) sebagai **1 Bundle POST ke base URL**:

```ts
// Pake helper yang sama dengan rawat-jalan/gigi (farmasi cuma re-export)
await client.farmasi.bundle.submitVisitBundle([
  { resource: encounter, fullUrl: `urn:uuid:${encounterId}` },
  { resource: condition },
  { resource: medicationRequest },
  { resource: documentReference },
]);
// POST /  (root) — server proses semua entry atomic, resolve `urn:uuid:` references.
```

`farmasi.bundle` re-export dari `rawat-jalan/bundle.js` — tipe `FhirTransactionBundle`, `BundleEntryInput`, `submitBundle`, `submitVisitBundle`, `buildTransactionBundle` semua identik. Bisa dicampur antara encounter fasyankes + apotek dalam 1 Bundle juga, server tetep resolve referencenya.

## Pitfalls yang perlu diverify live

- **`contained[Medication]` wajib isi 3 field khusus di Farmasi**:
  - `identifier[0].system` HARUS `http://sys-ids.kemkes.go.id/prescription-item/{orgId}` (path, **bukan** `|{orgId}`) — server nolak dengan RuleNumber 10380 kalau format-nya salah.
  - `extension[0]` wajib — pake `coding.medicationTypeExtension(coding.KEMKES_MEDICATION_TYPE.nonCompound)` (atau `.divideIntoEqualParts` / `.givesOfSuchDoses`). Server nolak dengan RuleNumber 10031 kalau gak ada.
  - `form.coding[0].system` HARUS `http://terminology.kemkes.go.id/CodeSystem/medication-form` (KEMKES), BUKAN HL7 `v3-orderableDrugForm`. Server nolak dengan RuleNumber 10025 kalau pake HL7. Code `BS066` = tablet, `BS084` = tetes mata, dll.
- **`Observation.performer` (RuleNumber 10383) dan `Observation.issued` (RuleNumber 10296) WAJIB**, walaupun body contoh di Postman collection gak punya dua-duanya.
- **`MedicationRequest.authoredOn` (RuleNumber 10337) WAJIB** (ISO timestamp).
- **`DocumentReference.content` WAJIB minimal 1 entry** — minimal `{ attachment: { contentType, title, url }, format: { system: "http://terminology.kemkes.go.id/CodeSystem/documentformat", code: "DF000001" } }`. Real-world isinya PDF e-Resep, placeholder URL `urn:uuid:<encounterId>` udah cukup buat smoke test.
- **No. Resep Nasional muncul di `DocumentReference.masterIdentifier.value`, bukan `identifier`.** Server balikin `{ masterIdentifier: { system: "http://sys-ids.kemkes.go.id/prescription/national", value: "NRN-260924-XXXXXX" } }`. Format server-defined (live example: `NRN-260924-FLV68AA`), simpen persis kayak response-nya.
- **`DocumentReference.context.related`** harus nunjuk ke SEMUA MedicationRequest + Observation yang mau di-attach ke resep.
- **Encounter closing (`status: "finished"`)** butuh `diagnosis[]` (RuleNumber 10457, reference Condition yg udah ada) + `statusHistory` lengkap tiap entry (RuleNumber 10122, `finished` entry pun wajib punya `end` — set `end = start` kalo close immediate).
- **`_include=DocumentReference:related`** di staging saat ini gak ngepull MedicationRequest/Observation (cuma balikin DocumentReference itu sendiri). Workaround: lookup terpisah di `/MedicationRequest?identifier=...` (jalan, balikin MedReq yg bener) buat dapet resources yg di-attach ke resep.
- **`substitution.wasSubstituted: true`** wajib nested sama `type` (CodeSystem `v3-substanceAdminSubstitution`) + `reason` (CodeSystem `v3-ActReason`). Code `TG/TE/TB/BC/E` udah ada di `coding.SYSTEM.SUBSTANCE_ADMIN_SUBSTITUTION` (lihat [Known-Issues](Known-Issues.md) buat gotcha URL `/fhir/` segment kalau ada).

## API reference (ringkas)

| Namespace | Fungsi |
|---|---|
| `farmasi.peresepan.*` | `createEncounter`, `updateEncounter`, `createCondition`, `createObservation`, `createMedicationRequest`, `createDocumentReference`, `getDocumentReference`, `searchDocumentReference`, `searchMedicationRequest` |
| `farmasi.pengeluaran.*` | `searchDocumentReference`, `searchMedicationRequest`, `createEncounter`, `createMedicationDispense`, `updateEncounter`, `searchMedicationDispense` |
| `farmasi.bundle.*` | `buildTransactionBundle`, `submitBundle`, `submitVisitBundle` (re-export dari rawat-jalan) |
| `fhir.documentReference.*` | `documentreferenceCreate`, `documentreferenceById`, `documentreferenceSearch`, `documentreferenceUpdate`, `documentreferencePatch` (umum, gak Farmasi-specific) |
| `coding.nationalPrescriptionIdentifier(no)` | helper `{system: PRESCRIPTION_NATIONAL, value: no}` |
| `coding.SYSTEM.PRESCRIPTION_NATIONAL` | `"http://sys-ids.kemkes.go.id/prescription/national"` |
