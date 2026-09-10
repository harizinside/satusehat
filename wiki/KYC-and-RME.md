# KYC dan RME

Kedua module ini **confirmed reachable dan routing-nya bener** (host/path/auth semua tervalidasi lewat error response asli dari server, bukan 404/network error) — tapi buat beneran dapet hasil sukses, butuh setup tambahan di luar OAuth2 credential biasa.

## KYC (Verifikasi Profil)

```ts
await client.kyc.generateChallengeCode({
  metadata: { method: "request_per_nik" }, // SATU-SATUNYA value yang valid, confirmed dari docs + live
  data: { nik: "...", name: "..." },
}, { debugMode: true }); // debugMode nge-set X-Debug-Mode: 1
```

**Wajib tau:** body `data` di KYC **harus dienkripsi (JWE)** — bukan JSON polos. Kirim JSON polos ditolak dengan `400 "Failed to decrypt message"` (udah dites live). SDK ini kirim body apa adanya (verbatim), jadi encryption-nya tanggung jawab pemanggil — butuh public key/skema enkripsi khusus KYC dari SATU SEHAT (beda dari OAuth2 credential biasa), itu di luar cakupan SDK ini.

`generateKycUrl` sama — butuh body `-----BEGIN ENCRYPTED MESSAGE-----...` beneran, bukan text biasa.

## RME (Rekam Medis Elektronik Nasional)

```ts
await client.rme.createHealthLink({
  patient_id, patient_name, practitioner_id, practitioner_name, organization_id, organization_name,
});
await client.rme.showHealthLink({ ...sama... });
```

**Gotcha yang confirmed live:**
- `patient_name`/`practitioner_name` kayaknya harus MATCH nama asli yang terdaftar di SATU SEHAT, bukan placeholder — testing pake nama asal-asalan dapet error internal dari backend ChaRME.
- `showHealthLink` bakal nolak kalau **role practitioner-nya nggak eligible** buat akses RME (`"practitioner role code ... is not eligible"`) — ini business rule di server, bukan sesuatu yang bisa diakalin dari SDK.
