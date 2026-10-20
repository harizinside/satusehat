# Known Issues

Hal-hal yang masih belum kelar, dan hal-hal yang keliatannya salah tapi sebenarnya emang gitu (biar gak dicoba "diperbaiki" lagi).

## Belum kelar

Nihil buat sekarang — semua yang sempet stuck (MedicationRequest/Dispense, Immunization, Gigi Procedure, KYC encryption) udah kelar, lihat bagian di bawah. Kalau ke depannya nemu resource baru yang gagal karena field/kode yang gak jelas: cara paling efektif buat fix cepet adalah kasih liat body contoh yang beneran kerja (Postman/dokumentasi resmi/reference client resmi di bahasa lain), bukan nebak-nebak terus ke sandbox.

## Sudah kelar (dari nebak-nebak → contoh real)

**KYC encryption** — dokumentasi prosa bilang `generate-url` punya varian "unencrypted JSON" dan `challenge-code` "gak perlu enkripsi" sama sekali; **dua-duanya salah**, live server nolak keduanya (`"missing begin tag"` / `"Failed to decrypt message"`). Ketauan yang bener dari referensi PHP client resmi SATU SEHAT yang user kasih: envelope RSA-OAEP(sha256)+AES-256-GCM (`wrappedKey(256) + iv(12) + ciphertext + tag(16)`, base64, dibungkus `-----BEGIN/END ENCRYPTED MESSAGE-----`), dikirim `text/plain`. Diimplementasi pake `node:crypto` built-in (zero dependency baru) di `src/kyc/crypto.ts`, **confirmed PASS live** buat `generateKycUrl` dan `generateChallengeCode` (yang terakhir butuh `X-Frame-Token` dari response `generate-url`, bukan `public_key` baru — server reuse key yang udah didaftarkan). Detail lengkap di [KYC-and-RME](KYC-and-RME.md).

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
- `MedicationStatement.context` — wajib `Encounter/<id>` (`RuleNumber: 10438`), walau FHIR R4 bilang optional. Confirmed e2e staging 2026-10-20 di `fhir/medicationstatement.ts` (create/byId/search/PATCH/PUT semua PASS).

## PATCH content-type (sudah difix global, bukan per-resource)

Semua `*Patch*` function di seluruh SDK sekarang otomatis kirim `Content-Type: application/json-patch+json` buat method PATCH (sebelumnya salah kirim `application/json` biasa, bikin semua PATCH gagal `400 invalid_headers`). Fix-nya di satu tempat (`core/client.ts`), jadi otomatis kepake di semua fungsi Patch — nggak perlu diapa-apain lagi per-modul.

## Gotcha umum: jangan pake `new Date()` mentah-mentah buat field klinis

Server staging SATU SEHAT nolak tanggal yang keliatan "di masa depan" relatif ke jam servernya sendiri — dan jam environment testing ini ternyata **lebih maju** dari jam server (`new Date()` ngasih tahun 2026, server nolak dengan `"Not Allowed: Future Date or Past Date before 3rd June 2014"`). Ini kejadian pas testing `Immunization.occurrenceDateTime`/`recorded`.

**Jangan asumsiin jam lokal/environment lu sama dengan jam server.** Buat field tanggal klinis (occurrenceDateTime, recorded, whenPrepared, dll), pake tanggal yang jelas-jelas di masa lalu (atau tanggal asli sesuai kejadian klinisnya) daripada `new Date().toISOString()` langsung, terutama kalau lagi testing dari environment yang jamnya gak lu kontrol.

## Endpoint yang udah dimatiin server (bukan bug SDK)

Lihat [Master-Data-and-KFA](Master-Data-and-KFA.md) — 4 fungsi KFA v1 (ATC/tag metadata) beneran `404`, dan dokumentasi resmi konfirmasi endpoint-nya udah nggak ada lagi.

## Observation (Farmasi BB/TB) — `issued` dan `performer` wajib

**Ditemukan live (farmasi smoke 2026-09-24):** `POST /Observation` nolak dengan `400 Element not found: Observation.issued (RuleNumber: 10296)` dan `400 Reference is mandatory : Observation.performer (RuleNumber: 10383)` kalau dua field itu gak ada. Interface `CreateObservationBody` di `src/farmasi/peresepan.ts` (generated dari body contoh Postman) nge-mark keduanya sebagai `?`, jadi TypeScript gak ngewajibin — tapi server emang ngewajibin.

**Fix:** tambah `performer` (Reference ke Practitioner) + `issued` (ISO timestamp kapan observasi direkam). Contoh body yang lulus:
```ts
{
  resourceType: "Observation",
  status: "final",
  issued: new Date().toISOString(), // wajib — RuleNumber 10296
  performer: [{ reference: `Practitioner/${pracId}` }], // wajib — RuleNumber 10383
  category: [{ coding: [{ system: coding.SYSTEM.OBSERVATION_CATEGORY, code: "vital-signs" }] }],
  code: { coding: [{ system: coding.SYSTEM.LOINC, code: "29463-7", display: "Body weight" }] },
  subject: { reference: `Patient/${patientId}` },
  encounter: { reference: `Encounter/${encId}` },
  effectiveDateTime: encounterStart,
  valueQuantity: { value: 70, unit: "kg", system: coding.SYSTEM.UCUM, code: "kg" },
}
```

## Farmasi peresepan (e-Resep) — field wajib yang gak ada di body contoh

Ditemukan live saat smoke farmasi di staging (2026-09-24). Generator ngikutin body contoh di Postman collection persis, jadi banyak field di-mark `?` padahal server ngewajibin. Fix TypeScript-nya adalah mark jadi required (lihat diff di `src/farmasi/peresepan.ts`), fix body-nya adalah:

1. **`Observation.performer` (RuleNumber 10383) dan `Observation.issued` (RuleNumber 10296) WAJIB.** Body contoh Postman gak punya dua-duanya, server langsung nolak `POST /Observation`. Contoh BB yang lulus:
   ```ts
   {
     resourceType: "Observation",
     status: "final",
     issued: new Date().toISOString(),
     performer: [{ reference: `Practitioner/${pracId}` }],
     category: [{ coding: [{ system: coding.SYSTEM.OBSERVATION_CATEGORY, code: "vital-signs" }] }],
     code: { coding: [{ system: coding.SYSTEM.LOINC, code: "29463-7", display: "Body weight" }] }],
     subject: { reference: `Patient/${patientId}` },
     encounter: { reference: `Encounter/${encId}` },
     effectiveDateTime: encounterStart,
     valueQuantity: { value: 70, unit: "kg", system: coding.SYSTEM.UCUM, code: "kg" },
   }
   ```

2. **`MedicationRequest.authoredOn` (RuleNumber 10337) WAJIB** — TypeScript-nya saat ini `?`, harus `string` (ISO timestamp). Server nolak tanpa field ini.

3. **`MedicationRequest.contained.Medication` wajib punya 3 hal** (server bener-bener ngecek tiap contained):
   - **`identifier[0].system`** harus `http://sys-ids.kemkes.go.id/prescription-item/{orgId}` — format path `/{orgId}` (bukan `|{orgId}` kayak identifier biasa). Salah format → **RuleNumber 10380 "Wrong organization ID provided by system URL"**. Contoh benar:
     ```ts
     identifier: [{ system: coding.kemkesResourceIdentifierSystem("prescription-item", orgId), value: "..." }]
     ```
   - **`extension[0]`** — pakai `coding.medicationTypeExtension(coding.KEMKES_MEDICATION_TYPE.nonCompound)` (atau `.divideIntoEqualParts` / `.givesOfSuchDoses`). Tanpa → **RuleNumber 10031 "Element not found: Medication.extension"**. Lihat juga gotcha umum Medication.extension di [atas](#kode-yang-di-generate-tapi-ternyata-field-nya-wajib).
   - **`form.coding[0].system`** harus `http://terminology.kemkes.go.id/CodeSystem/medication-form` (bukan HL7 `v3-orderableDrugForm`). Code `BS066` = tablet, `BS084` = tetes mata, dll — lihat `coding.KEMKES_MEDICATION_FORM.*`. Salah → **RuleNumber 10025 "Invalid coding system"**.

4. **`DocumentReference.content` WAJIB minimal 1 entry** (server nolak `400 missing required field "content"`). Real-world isinya PDF e-Resep (`contentType: "application/pdf"`, `url: <URL ke file>`) plus `format` dari `http://terminology.kemkes.go.id/CodeSystem/documentformat`. Body contoh di Postman collection (`Homepage rumah sakit`) emang valid shape tapi nge-template jadi PDF asli di production.

5. **No. Resep Nasional muncul di `DocumentReference.masterIdentifier`, bukan `identifier`.** Response body punya `masterIdentifier: {system: "http://sys-ids.kemkes.go.id/prescription/national", value: "NRN-260924-XXXXXX"}`. Helper `coding.nationalPrescriptionIdentifier()` di-extract ke `value` ini buat lookup. Format server-defined, jangan di-parse — contoh live: `NRN-260924-RFJLZ6U`.

6. **`Encounter.diagnosis` (RuleNumber 10457) WAJIB** waktu close (PUT status `finished`), walaupun Condition-nya udah di-`POST` terpisah. Reference Condition yang udah ada:
   ```ts
   diagnosis: [{ condition: { reference: `Condition/${conditionId}` }, rank: 1 }]
   ```

7. **`Encounter.statusHistory` terakhir wajib punya `end` (RuleNumber 10122).** Server strict soal `every statusHistory period start and end must be filled`. Trik: `finished` entry `period: { start: now, end: now }` (atau end = waktu close aktual).

8. **`_include=DocumentReference:related` di staging gak ngepull MedicationRequest/Observation yang di-attach** — search by `identifier=<no-resep>` di `/MedicationRequest` jalan (langsung balikin 1 entry yg bener), tapi `DocumentReference` cuma balikin DocRef itu sendiri tanpa `_include`. Mungkin butuh waktu buat indexing, atau support-nya belum aktif di server ini. Workaround: lookup terpisah di `/MedicationRequest?identifier=...` (yang jalan) buat dapet MedReq yg di-attach ke resep.

## Production e2e (2026-10-20) — 19 resource, data minimal

Dijalanin ke **production** pake data seminimal mungkin (angka diisi `0` kalau bisa), terus semua record ditarik lagi. Hasilnya 19/19 PASS: Encounter, Condition, Observation, Procedure, Composition, Immunization, MedicationRequest, MedicationDispense, AllergyIntolerance, ImagingStudy, ServiceRequest, ClinicalImpression, Specimen, DiagnosticReport, CarePlan, MedicationStatement, QuestionnaireResponse, Medication, EpisodeOfCare. Yang beda dari staging atau gak keliatan dari dokumentasi:

1. **ID internal poli ≠ ID Location.** Nilai `identifier` Location (misal UUID dari SIMRS lu) bukan `Location.id` SATU SEHAT. Kalau langsung dipake di `Location/<id>` hasilnya `404 storage_error`. Cari `id`-nya dulu:
   ```ts
   await client.request("GET", "/Location", { query: { identifier: `http://sys-ids.kemkes.go.id/location/${orgId}|${internalId}` } });
   // atau semua Location punya org: { organization: orgId }
   ```

2. **Nilai `0` ditolak di quantity obat**, walaupun pesannya bilang "equal or more than 0":
   - `MedicationRequest.dosageInstruction[].doseAndRate[].doseQuantity.value` (RuleNumber 10343) dan `dispenseRequest.quantity.value` (10346)
   - `MedicationDispense.daysSupply.value` (10350) dan `quantity.value` (10468)

   Kalau di resource lain, `0` diterima: `Observation.valueQuantity`, `Immunization.doseQuantity`, `Specimen.collection.quantity`, `ImagingStudy.numberOfSeries/numberOfInstances`, `MedicationStatement.dosage[].doseAndRate[].doseQuantity`.

3. **`EpisodeOfCare` ga bisa di-create langsung `finished`** (RuleNumber 10109/10110). Create pakai `active` dulu, baru diupdate. `period.end` cuma boleh diisi kalau status `cancelled`/`finished` (10405).

4. **`EpisodeOfCare` TB dapet identifier registry dari server.** Abis create, server nambahin `{system: "http://sys-ids.kemkes.go.id/episode-of-care/registry-id/", value: "TBSC..."}`. Akibatnya **PUT selalu gagal**: kalau identifier itu ikut dikirim balik kena `400 Invalid identifier system` (10458), kalau dibuang kena `403 consent or privacy rules`. Ubah status pakai **PATCH** aja:
   ```ts
   await client.fhir.episodeOfCare.episodeofcarePatch(id, [{ op: "replace", path: "/status", value: "entered-in-error" }]);
   ```

5. **Narik record (ga ada DELETE) caranya PUT hasil GET** (buang `meta`), terus ganti statusnya:
   - Kebanyakan resource cukup `status: "entered-in-error"`, termasuk Medication.
   - Condition/AllergyIntolerance pakai `verificationStatus` = `entered-in-error`, **dan `clinicalStatus` wajib dihapus**. Kalau masih ada, server balikin `400 structure: unparseable_resource` (aturan FHIR: clinicalStatus ga boleh ada kalau entered-in-error).
   - **ImagingStudy ga bisa ditarik.** `entered-in-error` sama `cancelled` dua-duanya ditolak (`Code not found ... imagingstudy-status`, RuleNumber 10151). Sekali POST, statusnya tetap `available`. Jangan POST ImagingStudy ke production cuma buat iseng.

6. **Encounter close di production**: body yang sama kayak staging (PUT `finished` + `diagnosis` + `statusHistory` start/end) langsung lolos, ga ada field wajib tambahan.

### Checklist 19 resource: body paling minim yang lolos production

Semua item di bawah **✅ confirmed PASS di production** tanggal 2026-10-20. Isinya sengaja seminim mungkin. Kolom "Isi minimal" nunjukin per field: **`0`** artinya angka nol diterima, **`1`** artinya `0` ditolak jadi harus 1, **template** artinya field kode/teks yang wajib ada dan diisi pakai nilai netral (teks `"-"` kalau bebas). Referensi yang selalu dipake: `Patient/<ihs>`, `Practitioner/<ihs>`, `Organization/<orgId>`, `Location/<id>` (lihat poin 1 di atas), `Encounter/<id>`. Identifier pakai `kemkesResourceIdentifierSystem(<segment>, orgId)`.

| ✓ | # | Resource | Fungsi SDK | Isi minimal | Angka |
|---|---|---|---|---|---|
| ✅ | 1 | Encounter | `fhir.encounter.encounterCreate` | template: `status: "arrived"`, `class` AMB, participant ATND + dokter, `location`, `statusHistory`, `serviceProvider`, identifier `encounter` | – |
| ✅ | 2 | Condition | `fhir.condition.conditionDiagnosis` | template: ICD-10 `Z00.0` (General medical examination), `clinicalStatus` active, category `encounter-diagnosis` | – |
| ✅ | 3 | Observation | `fhir.observationTtv.observationCreate` | template: LOINC `29463-7` Body weight, category vital-signs, `issued` + `performer` wajib | `valueQuantity.value` **0** |
| ✅ | 4 | Procedure | `fhir.procedure.procedureCreate` | template: ICD-9-CM `89.7` (General physical examination), `status: "completed"`, category SNOMED `103693007`, `performedPeriod`, performer dokter | – |
| ✅ | 5 | Composition (diet) | `fhir.composition.compositionEdukasiDiet` | template: type LOINC `18842-5`, category `LP173421-1`, section LOINC `42344-2`, `section.text.div: "-"`, identifier `composition` | – |
| ✅ | 6 | Immunization | `fhir.immunization.immunizationImunisasiDilakukanOlehNakes` | template: body Immunization di atas (KFA `93001282` + CVX `198`, 2 performer AP+EP, reason dasar/ideal), `lotNumber: "0"` | `doseQuantity.value` **0** |
| ✅ | 7 | MedicationRequest | `fhir.medicationRequest.medicationrequestCreate` | template: `intent: "order"`, identifier `prescription` + `prescription-item`, `authoredOn`, `dosageInstruction.text: "-"` | dose / quantity / dispenseInterval / expectedSupplyDuration **1** (0 ditolak) |
| ✅ | 8 | MedicationDispense | `fhir.medicationDispense.medicationdispenseCreate` | template: identifier `prescription` + `prescription-item`, category outpatient, `location` farmasi, `authorizingPrescription`, `whenPrepared`/`whenHandedOver` | quantity / daysSupply **1** (0 ditolak) |
| ✅ | 9 | AllergyIntolerance | `fhir.allergyIntolerance.allergyintoleranceCreate` | template: SNOMED `716186003` "No known allergy", category `medication`, identifier `allergy` | – |
| ✅ | 10 | ImagingStudy | `fhir.imagingStudy.imagingstudyPostSingleImage` | template: identifier ACSN (`acsn` segment, sama dengan ServiceRequest), modality DCM `DX`, `basedOn` ServiceRequest. ⚠️ ga bisa ditarik lagi (poin 5) | `numberOfSeries` / `numberOfInstances` **0** |
| ✅ | 11 | ServiceRequest | `fhir.serviceRequest.servicerequestLaboratoriumNonRujukanEksternal` | template: LOINC `57743-7`, category SNOMED `108252007`, identifier `servicerequest` + `acsn`, `performer` wajib, `reasonCode.text: "-"` | – |
| ✅ | 12 | ClinicalImpression | `fhir.clinicalImpression.clinicalimpressionCreate` | template: SNOMED `312850006`, `summary: "-"`, assessor dokter | – |
| ✅ | 13 | Specimen | `fhir.specimen.specimenCreateNonRujukan` | template: SNOMED `119297000` Blood specimen, `request` = ServiceRequest (wajib), identifier `specimen` + assigner org | `collection.quantity.value` **0** |
| ✅ | 14 | DiagnosticReport | `fhir.diagnosticReport.diagnosticreportCreate` | template: LOINC `57743-7`, category v2-0074 `HM`, `basedOn` + `specimen` + `result` (Observation #3), identifier `diagnostic/<org>/lab` | – |
| ✅ | 15 | CarePlan | `fhir.carePlan.careplanPost` | template: `intent: "plan"`, category SNOMED `736271009`, `title`/`description: "-"` | – |
| ✅ | 16 | MedicationStatement | `fhir.medicationStatement.medicationstatementCreate` | template: category outpatient, `context` Encounter (wajib), `informationSource` pasien, `dosage.text: "-"` | `doseQuantity.value` **0** |
| ✅ | 17 | QuestionnaireResponse | `fhir.questionnaireResponse.questionnaireresponseCreate` | template: `Questionnaire/Q0007`, cukup **1 item** (`1.1`, jawaban `OV000052` Sesuai) | – |
| ✅ | 18 | Medication | `fhir.medication.medicationCreate` | template: KFA `93000149` (Methylprednisolone 8 mg Tablet), form `BS066` tablet, `medicationTypeExtension(nonCompound)` | – |
| ✅ | 19 | EpisodeOfCare | `fhir.episodeOfCare.episodeofcareCreate` | template: `status: "active"` (bukan finished), type `TB-SO`, `diagnosis` = Condition #2, `careManager` dokter. ⚠️ otomatis kedaftar ke registry TB (poin 4) | – |

Urutan create yang dipake (ngikutin dependency): Encounter → Medication → Condition → Observation → Procedure → Composition → Immunization → MedicationRequest → MedicationDispense → AllergyIntolerance → ServiceRequest → ClinicalImpression → Specimen → DiagnosticReport → ImagingStudy → CarePlan → MedicationStatement → QuestionnaireResponse → EpisodeOfCare → close Encounter.

### Mana yang bisa diisi netral, mana yang nggak

"Netral" artinya isinya ga nyatet kejadian klinis apa pun. Teks bebas cukup `"-"`, terus field kode yang wajib diisi pakai kode yang artinya "cuma pemeriksaan umum" atau "ga ada apa-apa". Semua kode di bawah ✅ confirmed lolos production (2026-10-20).

| # | Resource | Kategori | Isi / alasan |
|---|---|---|---|
| 1 | Kunjungan Pasien (Encounter) | ✅ Netral | Cuma struktur kunjungan: AMB, `arrived`, pasien, dokter, lokasi |
| 2 | Kondisi / Diagnosis (Condition) | ✅ Netral | ICD-10 `Z00.0` (General medical examination) |
| 3 | Observasi (Observation) | ❌ Butuh kode klinis | Kode LOINC harus jenis pemeriksaan beneran. Nilainya aja yang bisa `0` |
| 4 | Tindakan (Procedure) | ✅ Netral | ICD-9-CM `89.7` (General physical examination) |
| 5 | Resume Diet (Composition) | ✅ Netral | Teks diet `"-"`, kode LOINC cuma tipe dokumen |
| 6 | Imunisasi (Immunization) | 🟡 Bisa kalau ada KFA | Harus kode KFA **vaksin** + CVX. Dose bisa `0` |
| 7 | Resep Obat (MedicationRequest) | 🟡 Bisa kalau ada KFA | Lewat Medication. Quantity minimal `1` |
| 8 | Tebus Obat (MedicationDispense) | 🟡 Bisa kalau ada KFA | Lewat Medication. Quantity minimal `1` |
| 9 | Alergi Intoleran (AllergyIntolerance) | ✅ Netral | SNOMED `716186003` (No known allergy) |
| 10 | Radiologi (ImagingStudy) | ❌ Butuh kode klinis | Modality DICOM + ServiceRequest. **Ga bisa ditarik lagi** |
| 11 | Permintaan Pemeriksaan (ServiceRequest) | ❌ Butuh kode klinis | Kode tes lab LOINC (teksnya bisa `"-"`) |
| 12 | Impresi Klinis (ClinicalImpression) | ✅ Netral | `summary: "-"` |
| 13 | Spesimen (Specimen) | ❌ Butuh kode klinis | Jenis spesimen SNOMED + ServiceRequest. Quantity bisa `0` |
| 14 | Laporan Pemeriksaan (DiagnosticReport) | ❌ Butuh kode klinis | Kode tes lab LOINC + ServiceRequest/Specimen/Observation |
| 15 | Rencana Perawatan (CarePlan) | ✅ Netral | `title` / `description: "-"` |
| 16 | Catatan Pengobatan (MedicationStatement) | 🟡 Bisa kalau ada KFA | Lewat Medication. Dose bisa `0` |
| 17 | Respon Kuesioner (QuestionnaireResponse) | ✅ Netral | `Q0007`, 1 item, jawaban `OV000052` "Sesuai" |
| 18 | Data Obat (Medication) | 🟡 Bisa kalau ada KFA | Kode obat KFA. Jadi dasar buat #7, #8, #16 |
| 19 | Episode Perawatan (EpisodeOfCare) | ❌ Butuh kode klinis | Type program penyakit (`TB-SO`), **otomatis kedaftar ke registry TB** |

| Kategori | Jumlah |
|---|---|
| ✅ Netral tanpa KFA | 8 |
| 🟡 Bisa kalau ada KFA | +5 → **13** |
| ❌ Tetap butuh kode klinis beneran | 6 |

Catatan: resource 🟡 tetap nyatet obat/vaksin beneran. KFA cuma bikin field-nya bisa diisi, isinya tetap ga netral. Kalau mau test koneksi production dengan dampak sekecil mungkin, cukup kirim yang ✅. Jangan kirim ImagingStudy sama EpisodeOfCare kalau ga ada kejadian klinisnya.
