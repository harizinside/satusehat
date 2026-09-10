# Alur Gigi (Dental)

Status: **14/14 langkah confirmed PASS**. Sama pola-nya kayak Rawat Jalan (lihat [Rawat-Jalan-Flow](Rawat-Jalan-Flow.md) buat detail gotcha umum: Medication.extension, PATCH content-type, dll — nggak diulang di sini). Bedanya cuma di bagian pemeriksaan gigi/odontogram.

## Urutan

1. `pendaftaranKunjunganRawatJalanGigi` — Encounter baru (class AMB, sama kayak Rawat Jalan)
2. `anamnesis.conditionKeluhanUtama` — Condition
3. `pemeriksaanFisik.*` — Observation golongan darah, dll (pake `coding.DENTAL_OBSERVATION_CODE` + `coding.DENTAL_BLOOD_TYPE_VALUE`/`DENTAL_RHESUS_VALUE`/`DENTAL_PREGNANCY_STATUS_VALUE`)
4. `formulirPemeriksaanOdontogram.*` — ini yang paling banyak field khusus gigi, lihat contoh di bawah
5. `pemeriksaanPenunjang.*` — Procedure status puasa, dll
6. `diagnosis.*` — Condition diagnosis
7. `tindakan.*` — Procedure tindakan gigi
8. `tatalaksana.*` — Medication/MedicationRequest (sama pola kayak Rawat Jalan)
9. `rencanaTindakLanjut.*`
10. `kondisiSaatMeninggalkanRs.*`
11. `caraKeluarDariRumahSakit.*` — tutup Encounter (sama gotcha identifier+statusHistory kayak Rawat Jalan)

## Contoh Observation odontogram (semua constant di bawah ini **confirmed jalan** ke sandbox)

```ts
// OHIS (Oral Hygiene Index Simplified)
await client.fhir.encounter... // pakai Observation biasa:
{
  resourceType: "Observation",
  code: { coding: [coding.DENTAL_OBSERVATION_CODE.ohisTotalScore] },
  interpretation: [{ coding: [coding.DENTAL_OHIS_INTERPRETATION.good] }],
  subject: { reference: `Patient/${patientId}` },
  encounter: { reference: `Encounter/${encounterId}` },
}

// Torus Palatinus
{
  code: { coding: [coding.DENTAL_OBSERVATION_CODE.torusPalatinus] },
  valueCodeableConcept: { coding: [coding.DENTAL_TORUS_PALATINUS_VALUE.none] },
  // varian lain: .small / .medium / .large / .multiple
}

// Torus Mandibularis — .none / .left / .right / .both
// Palatum — .deep / .medium / .shallow
// Diastema — .absent / .present
// Gigi Anomali — .absent / .present
```

Semua constant ini (`coding.DENTAL_*`) ada di `src/fhir/coding/gigi.ts`, dibangun dari dokumentasi resmi SATU SEHAT (bukan dari collection Postman lama, soalnya collection Gigi nggak punya contoh selengkap ini) dan **udah divalidasi live** — bukan cuma teori dari docs.

## Status: 14/14 confirmed

Semua langkah, termasuk `tindakan.procedureTindakanScaling` (`Procedure`), udah confirmed jalan ke sandbox. Field `code.coding` di situ nerima kode SNOMED apapun — cuma pastiin kodenya valid (cek [browser.ihtsdotools.org](https://browser.ihtsdotools.org) kalau ragu), bukan sesuatu yang perlu di-hardcode di SDK.
