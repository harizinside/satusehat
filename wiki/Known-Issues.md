# Known Issues

Hal-hal yang masih belum kelar, dan hal-hal yang keliatannya salah tapi sebenarnya emang gitu (biar gak dicoba "diperbaiki" lagi).

## Belum kelar

Nihil buat sekarang — semua yang sempet stuck (MedicationRequest/Dispense, Immunization, Gigi Procedure) udah kelar, lihat bagian di bawah. Kalau ke depannya nemu resource baru yang gagal karena field/kode yang gak jelas: cara paling efektif buat fix cepet adalah kasih liat body contoh yang beneran kerja (Postman/dokumentasi resmi), bukan nebak-nebak terus ke sandbox.

## Sudah kelar (dari nebak-nebak → contoh real)

**`MedicationRequest`/`MedicationDispense`** — kuantitas tablet nolak UCUM (`{tbl}`, `1`). Solusinya pake `ORDERABLE_DRUG_FORM_AUDITED.tablet` (code `TAB`), bukan UCUM. Detail di [Rawat-Jalan-Flow](Rawat-Jalan-Flow.md).

**`Immunization`** — butuh 2 entry di `performer`, dan tanggal harus di masa lalu (lihat gotcha jam di bawah):

```ts
const body = {
  resourceType: "Immunization",
  status: "completed",
  vaccineCode: { coding: [
    { system: coding.SYSTEM.KFA, code: "93001282", display: "Vaksin DTP - HB - Hib 0,5 mL (PENTABIO, 1)" },
    { system: coding.SYSTEM.CVX, code: "198", display: "DTP-hepB-Hib Pentavalent Non-US" },
  ]},
  patient: { reference: `Patient/${patientId}` },
  occurrenceDateTime: "2024-03-15T10:00:00+00:00", // masa lalu, lihat gotcha jam
  recorded: "2024-03-15T10:00:00+00:00",
  primarySource: true,
  reportOrigin: { coding: [coding.IMMUNIZATION_ORIGIN.provider] },
  performer: [
    // Practitioner WAJIB function code AP (Administering Provider)
    { actor: { reference: `Practitioner/${practitionerId}` }, function: { coding: [coding.V2_PROVIDER_ROLE_AUDITED.administeringProvider] } },
    // Organization WAJIB ADA, function code EP (Entering Provider) — server nolak kalau cuma satu performer
    { actor: { reference: `Organization/${orgId}` }, function: { coding: [coding.V2_PROVIDER_ROLE_AUDITED.enteringProvider] } },
  ],
  reasonCode: [{ coding: [coding.KEMKES_IMMUNIZATION_REASON.dasar, coding.KEMKES_IMMUNIZATION_ROUTINE_TIMING.ideal] }],
  location: { reference: `Location/${locationId}` },
  protocolApplied: [{ doseNumberPositiveInt: 1 }],
  encounter: { reference: `Encounter/${encounterId}` },
  lotNumber: "202009007",
  route: { coding: [coding.ATC_ROUTE_AUDITED.injectionIntramuscular] },
  doseQuantity: { value: 1, unit: "mL", system: coding.SYSTEM.UCUM, code: "ml" }, // lowercase "ml", confirmed dari contoh real
};
await client.fhir.immunization.immunizationImunisasiDilakukanOlehNakes(body);
```

**Gigi — Procedure "Scaling and Polishing of Teeth"** — bukan bug SDK, kode SNOMED `18059009` yang ditebak sebelumnya emang gak valid. `procedureTindakanScaling` (`gigi/tindakan.ts`) confirmed jalan normal begitu dikasih kode SNOMED yang bener (contoh: `12491002` "Bleaching of discolored tooth"). Field `code.coding` di sini emang bebas diisi kode SNOMED apapun sesuai tindakan yang beneran dilakukan.

## Ini BUKAN bug — jangan "diperbaiki" lagi

- **`MEDICATIONDISPENSE_CATEGORY` system URL** punya `/fhir/` di tengah (`http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category`) — kelihatan kayak typo dibanding URL canonical FHIR R4 (`.../CodeSystem/...` tanpa `/fhir/`), tapi **confirmed dari contoh real** kalau SATU SEHAT emang pake bentuk ini. Udah pernah "diperbaiki" terus dibalikin lagi setelah ketauan salah.
- **`KEMKES_MEDICATION_TYPE` system URL pake `http://`, bukan `https://`** — dokumentasi resmi nunjukkin `https://`, tapi server nolak `https://` dan cuma nerima `http://`. Live server menang lawan dokumentasi.
- **Identifier namespace buat resep itu `prescription`/`prescription-item`**, bukan `medicationrequest`/`medicationdispense` — ini nama segment yang dipake di `http://sys-ids.kemkes.go.id/{segment}/{orgId}`.

## Kode yang di-generate tapi ternyata field-nya wajib (TypeScript bilang optional, server bilang wajib)

Ini semua udah difix di kode (interface-nya diubah jadi required), dicatet di sini biar kalau lu bikin resource sejenis dari nol tau apa yang perlu diisi:

- `DiagnosticReport.basedOn` — bahkan awalnya nggak ada di TypeScript interface sama sekali, ketauan pas server nolak.
- `Specimen.request`
- `ImagingStudy.identifier`
- `Medication.extension` — bukan cuma required, harus isi `medicationType` extension yang bentuknya spesifik. Pake helper `coding.medicationTypeExtension()`.
- `MedicationRequest.identifier`
- Encounter closing (`PUT`) — `identifier` dan `statusHistory` (tiap entry butuh `start` DAN `end`, bukan cuma salah satu).
- `ServiceRequest` (kontrol kembali) — `performer`.

## PATCH content-type (sudah difix global, bukan per-resource)

Semua `*Patch*` function di seluruh SDK sekarang otomatis kirim `Content-Type: application/json-patch+json` buat method PATCH (sebelumnya salah kirim `application/json` biasa, bikin semua PATCH gagal `400 invalid_headers`). Fix-nya di satu tempat (`core/client.ts`), jadi otomatis kepake di semua fungsi Patch — nggak perlu diapa-apain lagi per-modul.

## Gotcha umum: jangan pake `new Date()` mentah-mentah buat field klinis

Server staging SATU SEHAT nolak tanggal yang keliatan "di masa depan" relatif ke jam servernya sendiri — dan jam environment testing ini ternyata **lebih maju** dari jam server (`new Date()` ngasih tahun 2026, server nolak dengan `"Not Allowed: Future Date or Past Date before 3rd June 2014"`). Ini kejadian pas testing `Immunization.occurrenceDateTime`/`recorded`.

**Jangan asumsiin jam lokal/environment lu sama dengan jam server.** Buat field tanggal klinis (occurrenceDateTime, recorded, whenPrepared, dll), pake tanggal yang jelas-jelas di masa lalu (atau tanggal asli sesuai kejadian klinisnya) daripada `new Date().toISOString()` langsung, terutama kalau lagi testing dari environment yang jamnya gak lu kontrol.

## Endpoint yang udah dimatiin server (bukan bug SDK)

Lihat [Master-Data-and-KFA](Master-Data-and-KFA.md) — 4 fungsi KFA v1 (ATC/tag metadata) beneran `404`, dan dokumentasi resmi konfirmasi endpoint-nya udah nggak ada lagi.
