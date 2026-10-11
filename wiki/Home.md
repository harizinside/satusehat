# SATU SEHAT SDK — Integration Wiki

Panduan step-by-step buat integrasi pake SDK ini, berdasarkan hasil testing langsung ke server **staging** SATU SEHAT (bukan cuma compile-clean — semua flow di bawah ini udah beneran dijalanin dan berhasil bikin data real di sandbox).

## Urutan baca

1. **[Setup dan Auth](Setup-and-Auth.md)** — konfigurasi client, dapetin token
2. **[Prerequisites](Prerequisites-Flow.md)** — Organization → Location → cari Patient/Practitioner (wajib sebelum apa pun)
3. **[Alur Rawat Jalan](Rawat-Jalan-Flow.md)** — 16 langkah, dari Encounter sampe Resume Medis
4. **[Alur Gigi](Gigi-Flow.md)** — versi dental-nya, termasuk odontogram
5. **[Alur Farmasi](Farmasi-Flow.md)** — e-Resep + dispensing (peresepan → No. Resep Nasional → Encounter apotek → MedicationDispense)
6. **[Master Data dan KFA](Master-Data-and-KFA.md)** — wilayah, sarana, formularium obat
7. **[KYC dan RME](KYC-and-RME.md)** — verifikasi profil + rekam medis nasional
8. **[Known Issues](Known-Issues.md)** — yang masih belum kelar / butuh contoh data real buat difix

## TL;DR urutan yang bener

```
1. getAccessToken()                              → simpen token sendiri (Redis/dll), SDK gak nyimpen
2. organization.getOrganization(orgId)            → pastiin org lu ada
3. organization.createLocation() / cari yang ada  → Poli/ruang di bawah org
4. search.searchPatient({identifier: nikIdentifier(nik)})     → cari pasien
5. search.searchPractitioner({identifier: nikIdentifier(nik)}) → cari nakes (search-only, gak ada create)
5. fhir.encounter.encounterCreate(...)            → mulai kunjungan
6. ...langkah klinis sesuai alur (Rawat Jalan / Gigi / Farmasi)...
7. encounterUpdate...(status: finished)           → tutup kunjungan
8. compositionResumeMedis(...)                    → resume medis (kecuali alur Farmasi)
```

Setiap langkah di bawah udah dites beneran ke sandbox dan dikasih tau resource ID contoh yang kebentuk, plus gotcha yang bikin gagal kalau lu gak tau.
