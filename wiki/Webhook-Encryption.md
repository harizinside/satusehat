# Enkripsi Webhook (HPKE / RFC 9180)

SATUSEHAT mengenkripsi setiap payload webhook ke fasyankes memakai **HPKE**
(RFC 9180), mode **Auth** atau **AuthPSK**. Formatnya sama dengan sample code
portal:

```
base64( enc || ciphertext )
        │      └─ output AEAD (tag 16 byte di akhir)
        └─ ephemeral public key (Nenc byte, tergantung KEM)
```

SDK punya implementasi HPKE sendiri berbasis `node:crypto` (tanpa dependency
baru). Hasilnya sudah dicek interop 90/90 terhadap sample portal
(`npm run hpke-interop`).

## 1. Generate keypair pakai sample portal

Di portal (Konfigurasi Webhook → Aktivasi Enkripsi), pilih bahasa
**JavaScript**, unduh Sample Code, lalu ekstrak ke `Javascript/` di root repo.
Folder ini masuk `.gitignore` karena nanti berisi `.env` dengan private key.

```bash
cd Javascript
npm install
node index.js      # menu 1) Generate Key Pair
```

Pilih KEM, KDF, dan AEAD. Hasilnya otomatis ditulis ke `Javascript/.env`:
`HPKE_KEM`, `HPKE_KDF`, `HPKE_AEAD`, `HPKE_PUBLIC_KEY`, dan `HPKE_PRIVATE_KEY`.
Semua key berupa raw bytes yang di-encode base64.

## 2. Isi konfigurasi di portal SATUSEHAT

Di menu **Konfigurasi Webhook → Aktivasi Enkripsi**, isi hanya:

| Field portal       | Isi                                    |
|--------------------|----------------------------------------|
| KEM                | nilai `HPKE_KEM` yang dipilih          |
| KDF                | nilai `HPKE_KDF`                       |
| AEAD               | nilai `HPKE_AEAD`                      |
| Client Public Key  | nilai `HPKE_PUBLIC_KEY`                |

**`HPKE_PRIVATE_KEY` jangan pernah dikirim ke portal atau ke mana pun.** Key
ini cuma disimpan di server lu (secret manager atau env).

Setelah aktivasi, simpan **public key SATUSEHAT** dari portal sebagai
`HPKE_SATUSEHAT_PUBLIC_KEY`. Kalau pakai AuthPSK, simpan juga `HPKE_PSK`
(minimal 32 byte UTF-8) dan `HPKE_PSK_ID`.

## 3. Pasang URL webhook

URL yang didaftarkan di portal cukup diarahkan ke `createWebhookHandler`.
Handler ini mendekripsi body, memverifikasi bahwa pengirimnya benar SATUSEHAT
(mode Auth/AuthPSK), mem-parse JSON, lalu memanggil `onWebhook`.

Responsnya:
- **200** `{"status":"ok"}` kalau berhasil. Kalau `onWebhook` mengembalikan `Response` sendiri, itu yang dipakai.
- **400** kalau body gagal didekripsi (palsu, atau key/PSK/suite salah).
- **500** kalau `onWebhook` throw.

Config-nya cukup dibuat sekali:

```ts
// webhook-config.ts
import type { WebhookEncryptionConfig } from "@harizinside/satusehat";

export const webhookConfig: WebhookEncryptionConfig = {
  suite: { kem: process.env.HPKE_KEM!, kdf: process.env.HPKE_KDF!, aead: process.env.HPKE_AEAD! },
  privateKey: process.env.HPKE_PRIVATE_KEY!,
  satusehatPublicKey: process.env.HPKE_SATUSEHAT_PUBLIC_KEY!,
  psk: process.env.HPKE_PSK ? { key: process.env.HPKE_PSK, id: process.env.HPKE_PSK_ID! } : undefined,
};
```

**Next.js (App Router)** — `app/api/satusehat/webhook/route.ts`:

```ts
import { createWebhookHandler } from "@harizinside/satusehat";
import { webhookConfig } from "@/webhook-config";

export const runtime = "nodejs"; // butuh node:crypto, bukan edge runtime
export const POST = createWebhookHandler({
  ...webhookConfig,
  onWebhook: async ({ payload, plaintext }) => {
    // payload?.meta.method → "chargeItemSubmission", dst.
  },
});
```

**Hono:**

```ts
import { Hono } from "hono";
import { createWebhookHandler } from "@harizinside/satusehat";

const handler = createWebhookHandler({ ...webhookConfig, onWebhook: async ({ payload }) => { /* ... */ } });
const app = new Hono();
app.post("/satusehat/webhook", (c) => handler(c.req.raw));
```

**Express** (tidak memakai Fetch `Request`, jadi panggil `decryptWebhook` langsung):

```ts
import express from "express";
import { decryptWebhook } from "@harizinside/satusehat";

app.post("/satusehat/webhook", express.text({ type: () => true }), async (req, res) => {
  let event;
  try {
    event = decryptWebhook(req.body, webhookConfig);
  } catch {
    return res.status(400).json({ status: "error", message: "invalid encrypted payload" });
  }
  // event.payload / event.json / event.plaintext
  res.json({ status: "ok" });
});
```

`event` berisi:
- `plaintext`: string hasil dekripsi.
- `json`: hasil `JSON.parse`, atau `undefined` kalau bukan JSON.
- `payload`: envelope SATUSEHAT (`data`, `meta`, `transaction_id`, `timestamp`), atau `null`.

> **Format body.** Handler mengasumsikan body request adalah pesan HPKE base64
> mentah (`enc || ciphertext`). Format ini sudah dibuktikan dengan pesan uji
> dari portal sandbox, yang berhasil didekripsi dalam mode AuthPSK tanpa AAD.
> Format webhook produksi belum terdokumentasi resmi. Kalau body ternyata
> dibungkus JSON, ambil field-nya lalu panggil `decryptWebhook(field, config)`.

## 4. Enkripsi ke arah SATUSEHAT (opsional)

`sealHpkeMessage(plaintext, satusehatPublicKey, myPrivateKey, suite, opts?)`
menghasilkan format yang sama. Fungsi ini setara dengan menu 2 di sample
portal.

## 5. Suite yang didukung

| KEM                      | Kurva      | Nenc |
|--------------------------|------------|------|
| `KEM_P256_HKDF_SHA256`   | P-256      | 65   |
| `KEM_P384_HKDF_SHA384`   | P-384      | 97   |
| `KEM_P521_HKDF_SHA512`   | P-521      | 133  |
| `KEM_X25519_HKDF_SHA256` | X25519     | 32   |
| `KEM_X448_HKDF_SHA512`   | X448       | 56   |

- KDF: `HKDF_SHA256`, `HKDF_SHA384`, `HKDF_SHA512`. Bebas dikombinasikan dengan KEM mana pun.
- AEAD: `AEAD_AESGCM128`, `AEAD_AESGCM256`, `AEAD_CHACHA20POLY1305`.
- `KEM_X25519_KYBER768_DRAFT00` (ada di menu sample) **belum didukung** SDK
  dan akan throw `Unsupported KEM`. Pilih KEM klasik di portal.

## 6. Verifikasi

```bash
npm run build
npm run hpke-check     # 74 kasus self-test (termasuk webhook handler), tanpa dependency
(cd Javascript && npm install) && npm run hpke-interop   # 90 kasus vs sample portal (skip kalau Javascript/ belum ada)
```

## Gotcha

- **Auth vs AuthPSK harus sama** dengan konfigurasi portal. Kalau beda, AEAD tag gagal dan `openHpkeMessage` throw.
- **PSK** di-encode sebagai UTF-8 dan minimal 32 byte, sama seperti sample.
- **Panjang key** divalidasi per KEM. Key P-521 boleh kurang dari 66 byte.
