# KYC dan RME

## KYC (Verifikasi Profil) — **confirmed PASS end-to-end**

Envelope encryption-nya sekarang built-in ke SDK (`node:crypto`, zero dependency baru) — bukan tanggung jawab pemanggil lagi. Formatnya ketauan dari referensi PHP client resmi SATU SEHAT (bukan dari dokumentasi prosa, yang ternyata nggak lengkap/salah di beberapa bagian), lalu confirmed live persis:

```ts
const { data, privateKey } = await client.kyc.generateKycUrl({
  agentName: "Test Operator",
  agentNik: "9104223107000004",
  satuSehatPublicKey, // PEM dari SATU SEHAT, bukan yang lu generate sendiri
});
// data.data.token & data.data.url

const challenge = await client.kyc.generateChallengeCode({
  metadata: { method: "request_per_nik" }, // satu-satunya value yang valid
  data: { nik: "9104223107000004", name: "Test Operator" },
  satuSehatPublicKey,   // sama seperti di atas
  frameToken: data.data.token, // WAJIB — dari response generateKycUrl
  privateKey,                  // WAJIB — private key ephemeral dari generateKycUrl yang sama
});
// challenge.data.challenge_code, .ihs_number, .name, dst.
```

**Envelope-nya (confirmed byte-for-byte dari live test):**
1. Generate RSA-2048 keypair baru (SDK lakuin ini sendiri per call, lewat `generateKycKeyPair()`).
2. Body JSON di-AES-256-GCM-encrypt pakai random 32-byte key; key itu di-RSA-OAEP-wrap (hash `sha256`, default phpseclib3) pakai **public key SATU SEHAT** (`satuSehatPublicKey`, bukan yang lu generate).
3. Payload = `wrappedKey(256 byte) + iv(12 byte) + ciphertext + tag(16 byte)`, di-base64, dibungkus `-----BEGIN/END ENCRYPTED MESSAGE-----` (`chunk_split` 76 char + `\r\n`), dikirim sebagai `text/plain`.
4. Response dari server **juga dienkripsi** — pakai public key yang barusan lu kirim di step 2 — jadi didekripsi pakai `privateKey` pasangannya.

**Gotcha yang sempet bikin stuck lama:** dokumentasi bilang `generate-url` punya varian "unencrypted JSON" dan `challenge-code` "gak perlu enkripsi sama sekali" — **keduanya salah/nggak lengkap**. Live server nolak keduanya kalau dikirim plain JSON. Yang bener: SEMUA request KYC lewat envelope di atas, titik.

**Kunci penting yang ketauan dari `challenge-code`:** dia **tidak** boleh kirim `public_key` baru di body-nya — server udah nyimpen public key agent dari call `generate-url` sebelumnya, dan `challenge-code` cuma perlu nunjuk ke agent yang mana lewat header `X-Frame-Token` (isinya `data.token` dari response `generate-url`). Makanya `generateChallengeCode()` di SDK ini wajib dikasih `frameToken` + `privateKey` dari call `generateKycUrl()` yang barusan — dua call ini SATU SESI, gak bisa dipisah/diulang independent.

## RME (Rekam Medis Elektronik Nasional)

**Routing confirmed bener** (host/path/auth tervalidasi lewat error response asli dari server) — belum full-pass karena butuh data pasien/nakes asli yang eligible, bukan bug SDK.

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
