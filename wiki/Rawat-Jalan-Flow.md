# Alur Rawat Jalan (Outpatient)

Status: **21/23 langkah confirmed PASS** ke sandbox staging (2 langkah lain gagal karena data test asal-asalan, lihat [Known Issues](Known-Issues.md)). Ini urutan yang beneran jalan, plus gotcha yang bikin gagal kalau nggak tau.

## 0. Encounter — mulai kunjungan

```ts
const encounter = await client.fhir.encounter.encounterCreate({
  resourceType: "Encounter",
  status: "arrived",
  class: coding.ENCOUNTER_CLASS.ambulatory, // {system, code:"AMB", display:"ambulatory"}
  subject: { reference: `Patient/${patientId}` },
  participant: [{
    type: [{ coding: [coding.ENCOUNTER_PARTICIPANT_TYPE.attender] }], // ATND
    individual: { reference: `Practitioner/${practitionerId}` },
  }],
  period: { start: new Date().toISOString() },
  location: [{ location: { reference: `Location/${locationId}` } }],
  statusHistory: [{ status: "arrived", period: { start: new Date().toISOString() } }],
  serviceProvider: { reference: `Organization/${orgId}` },
  identifier: [{
    system: coding.kemkesResourceIdentifierSystem("encounter", orgId),
    value: "ENC-" + Date.now(),
  }],
});
```

## 1. Anamnesis (`rawatJalan.anamnesis.*`)

- `conditionKeluhanUtama` — Condition (chief complaint)
- `alergiLingkunganDebuRumah` — AllergyIntolerance
- `familymemberhistoryRiwayatPenyakitKeluarga` — FamilyMemberHistory
- `medicationstatementRiwayatPengobatanObatDariFasyankesSendiriBody` — MedicationStatement (category pake `coding.MEDICATION_STATEMENT_CATEGORY`, bukan `MEDICATION_DISPENSE_CATEGORY`)

## 2–3. Pemeriksaan Fisik / Fungsional

- `hasilPemeriksaanFisik.observationTdSistolik` — Observation vital sign
- `pemeriksaanFungsional.observationStatusPsikologis`

**Gotcha:** Observation nggak boleh isi `valueCodeableConcept` kosong bareng `valueQuantity` — FHIR cuma boleh SATU `value[x]`. Kalau nggak butuh, jangan dikirim sama sekali (jangan kirim object kosong).

## 4–7. Riwayat, Tujuan, Rencana Rawat

- `riwayatPerjalananPenyakit.clinicalimpressionRiwayatPerjalananPenyakit`
- `tujuanPerawatan.goalCreateTujuanPerawatan`
- `rencanaRawatPasien.careplanRencanaRawatPasien`
- `rasionalKlinis.clinicalimpressionRasionalKlinis` — simpen `id`-nya, dipatch di step 9

## 8. Diagnosis

- `diagnosis.conditionPrimaryDengue` (atau diagnosis lain) — simpen `id`, dipake pas nutup Encounter

## 9. Penilaian Risiko

- `penilaianRisiko.riskassessmentPenilaianRisiko`
- `penilaianRisiko.clinicalimpressionPatchRasionalKlinis(id, ops)` — **PATCH**, lihat gotcha di bawah

## 10. Tindakan/Prosedur (contoh: EKG)

- `tindakanProsedurMedis.servicerequestEkg` → `procedureEkg` (referensi ServiceRequest) → `observationEkg`

## 11. Tatalaksana (Obat) — paling banyak gotcha-nya

```ts
// 1. Medication — WAJIB ada extension, atau ditolak server
const medication = await client.fhir.medication.medicationCreate({
  resourceType: "Medication",
  code: { coding: [{ system: coding.SYSTEM.KFA, code: kfaCode, display }] },
  status: "active",
  manufacturer: { reference: `Organization/${orgId}` },
  form: { coding: [coding.KEMKES_MEDICATION_FORM.larutanInjeksi] },
  extension: [coding.medicationTypeExtension(coding.KEMKES_MEDICATION_TYPE.nonCompound)],
});

// 2. MedicationRequest — dose/quantity pake ORDERABLE_DRUG_FORM, BUKAN UCUM
const tab = coding.ORDERABLE_DRUG_FORM_AUDITED.tablet; // {system: v3-orderableDrugForm, code:"TAB"}
const mr = await client.fhir.medicationRequest.medicationrequestCreate({
  resourceType: "MedicationRequest",
  identifier: [{ system: coding.kemkesResourceIdentifierSystem("prescription", orgId), value: "RX-..." }],
  medicationReference: { reference: `Medication/${medication.id}` },
  subject: { reference: `Patient/${patientId}` },
  encounter: { reference: `Encounter/${encounterId}` },
  requester: { reference: `Practitioner/${practitionerId}` },
  courseOfTherapyType: { coding: [coding.MEDICATION_REQUEST_COURSE_OF_THERAPY.acute] },
  dosageInstruction: [{
    doseAndRate: [{
      type: { coding: [coding.DOSE_RATE_TYPE.ordered] },
      doseQuantity: { value: 1, unit: tab.display, system: tab.system, code: tab.code },
    }],
  }],
  dispenseRequest: {
    dispenseInterval: { value: 1, unit: "day", system: coding.UCUM_TIME.day.system, code: coding.UCUM_TIME.day.code },
    quantity: { value: 10, unit: tab.display, system: tab.system, code: tab.code },
    expectedSupplyDuration: { value: 7, unit: "day", system: coding.UCUM_TIME.day.system, code: coding.UCUM_TIME.day.code },
    performer: { reference: `Organization/${orgId}` },
  },
});

// 3. MedicationDispense
const md = await client.fhir.medicationDispense.medicationdispenseCreate({
  resourceType: "MedicationDispense",
  identifier: [
    { system: coding.kemkesResourceIdentifierSystem("prescription", orgId), value: "..." },
    { system: coding.kemkesResourceIdentifierSystem("prescription-item", orgId), value: "...-1" },
  ],
  status: "completed",
  category: { coding: [coding.MEDICATION_DISPENSE_CATEGORY.outpatient] },
  medicationReference: { reference: `Medication/${medication.id}` },
  authorizingPrescription: [{ reference: `MedicationRequest/${mr.id}` }],
  quantity: { code: tab.code, system: tab.system, value: 10 },
  daysSupply: { value: 7, unit: "Day", system: coding.UCUM_TIME.day.system, code: coding.UCUM_TIME.day.code },
});
```

## 12–14. Prognosis, RTL, Kondisi Keluar

- `prognosis.clinicalimpressionPrognosisBaik`
- `rencanaTindakLanjutDanInstruksiTindakLanjut.servicerequestKontrolKembali`
- `kondisiSaatMeninggalkanFasyankes.conditionStabil`

## 15. Tutup Encounter

```ts
await client.rawatJalan.caraKeluarDariRumahSakit.encounterUpdatePulangDanKontrolKembali(encounterId, {
  status: "finished",
  identifier: [...], // WAJIB diisi, meski di TS typed optional — server nolak PUT tanpa ini
  statusHistory: [
    { status: "arrived", period: { start, end } },  // TIAP entry butuh start DAN end
    { status: "finished", period: { start, end } },
  ],
  diagnosis: [{ condition: { reference: `Condition/${diagnosisConditionId}` } }],
});
```

## 16. Resume Medis (final)

```ts
await client.rawatJalan.resumeMedis.compositionResumeMedis({
  resourceType: "Composition",
  subject: { reference: `Patient/${patientId}` },
  encounter: { reference: `Encounter/${encounterId}` },
  section: [/* referensi ke Condition/Observation/MedicationRequest/dll */],
});
```

## Gotcha global: PATCH

Semua fungsi `*Patch*` (di mana pun — `patchPatient`, `organizationPatch`, `clinicalimpressionPatchRasionalKlinis`, dll) butuh `Content-Type: application/json-patch+json`, bukan `application/json` biasa. **Ini udah difix di SDK** (`core/client.ts` otomatis pake content-type yang bener buat method PATCH) — nggak perlu diapa-apain lagi, cuma dicatet di sini biar kalau ketemu behavior aneh di versi lama tau kenapa.
