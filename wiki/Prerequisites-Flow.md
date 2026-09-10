# Prerequisites — Wajib Sebelum Apa Pun

Semua resource klinis (Encounter, Condition, dll) butuh Organization, Location, dan referensi Patient/Practitioner yang udah valid. Ini urutannya, semua **confirmed** jalan ke sandbox.

## 1. Organization

```ts
const org = await client.organization.getOrganization(orgId);
```

Kalau belum ada, bikin dengan `client.organization.createOrganization({...})`. `Organization.type` boleh pake `coding.ORGANIZATION_TYPE.*` (HL7 standar) atau `coding.KEMKES_ORGANIZATION_TYPE.fktp` (spesifik Kemkes, faskes tingkat 1).

## 2. Location (di bawah Organization)

```ts
const loc = await client.organization.createLocation({
  resourceType: "Location",
  name: "Poli Umum",
  managingOrganization: { reference: `Organization/${orgId}` },
  physicalType: { coding: [coding.LOCATION_PHYSICAL_TYPE.room] },
});
```

Cari location yang udah ada:
```ts
await client.fhir.location.locationSearchByIdentifier({ organization: orgId });
// atau
await client.fhir.location.locationSearchByIdentifier({ name: "poli" });
```

## 3. Cari Patient (search-only + create)

```ts
import { nikIdentifier } from "satusehat";

const bundle = await client.search.searchPatient({ identifier: nikIdentifier(nik) });
// bundle.entry[].resource.id — bisa ada banyak duplikat, cari yang use:"official"
```

Kalau belum ada, bikin baru:
```ts
await client.fhir.patient.patientCreateByNik({ resourceType: "Patient", ... });
```

**Gotcha:** satu NIK bisa punya banyak record duplikat di sandbox (pernah ketemu 12 record buat satu NIK). Filter yang `identifier[].use === "official"` buat dapetin ID kanonik.

## 4. Cari Practitioner (search-only, TIDAK ADA create)

```ts
const bundle = await client.search.searchPractitioner({ identifier: nikIdentifier(nik) });
```

Practitioner itu dari **registry nasional (STR-KKI)** — dicek langsung ke 8 collection Postman resmi, nggak ada satupun contoh `POST /Practitioner`. Kalau nakes belum kedaftar, itu bukan sesuatu yang bisa diselesaikan lewat API ini.

## Ringkasan referensi yang lu butuh sebelum bikin Encounter

| Yang dibutuhin | Cara dapetin |
|---|---|
| `organizationId` | `getOrganization` atau bikin baru |
| `locationId` | `locationSearchByIdentifier` atau `createLocation` |
| `patientId` | `searchPatient` (pake NIK) atau `patientCreateByNik` |
| `practitionerId` | `searchPractitioner` (pake NIK) — search only |
