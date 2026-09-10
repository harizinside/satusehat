# Known Issues

Hal-hal yang masih belum kelar, dan hal-hal yang keliatannya salah tapi sebenarnya emang gitu (biar gak dicoba "diperbaiki" lagi).

## Belum kelar — butuh contoh data real

| Resource | Masalah | Udah dicoba |
|---|---|---|
| `MedicationRequest`/`MedicationDispense` (sebelum ketemu contoh) | Kuantitas tablet nolak UCUM (`{tbl}`, `1`) | ✅ **Sudah kelar** — solusinya pake `ORDERABLE_DRUG_FORM_AUDITED.tablet` (code `TAB`), bukan UCUM. Lihat [Rawat-Jalan-Flow](Rawat-Jalan-Flow.md). |
| `Immunization` | `performer.function` pake CodeSystem yang salah + butuh performer ber-actor Organization | 2x percobaan, dua-duanya ditolak. Belum ada contoh kerja. |
| ~~Gigi — Procedure "Scaling and Polishing of Teeth"~~ | ✅ **Sudah kelar** — bukan bug SDK, kode SNOMED `18059009` yang ditebak sebelumnya emang gak valid. `procedureTindakanScaling` (`gigi/tindakan.ts`) confirmed jalan normal begitu dikasih kode SNOMED yang bener (contoh: `12491002` "Bleaching of discolored tooth"). Field `code.coding` di sini emang bebas diisi kode SNOMED apapun sesuai tindakan yang beneran dilakukan — bukan harus persis "scaling". |

Kalau nemu contoh Postman/dokumentasi resmi buat salah satu di atas, kasih liat body-nya persis (kayak yang bikin `MedicationRequest` akhirnya kelar) — itu cara paling efektif buat fix cepet, dibanding nebak-nebak terus.

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

## Endpoint yang udah dimatiin server (bukan bug SDK)

Lihat [Master-Data-and-KFA](Master-Data-and-KFA.md) — 4 fungsi KFA v1 (ATC/tag metadata) beneran `404`, dan dokumentasi resmi konfirmasi endpoint-nya udah nggak ada lagi.
