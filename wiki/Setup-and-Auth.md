# Setup dan Auth

## Install

```bash
npm install github:harizinside/satusehat
```

## Bikin client

```ts
import { createSatuSehatClient } from "satusehat";

const client = createSatuSehatClient({
  environment: "staging", // atau "production"
  clientId: process.env.SATUSEHAT_CLIENT_ID,
  clientSecret: process.env.SATUSEHAT_CLIENT_SECRET,
});
```

## Host yang dipake (per environment)

Ini **confirmed** dari testing live + official docs, bukan tebakan. Ada 4 host berbeda per environment, masing-masing API family punya prefix path sendiri:

| Family | Production | Staging |
|---|---|---|
| FHIR (`fhir.*`) | `api-satusehat.kemkes.go.id/fhir-r4/v1` | `api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1` |
| Master Data + KFA | `api-satusehat.kemkes.go.id` | `api-satusehat-stg.dto.kemkes.go.id` |
| OAuth2 | `api-satusehat.kemkes.go.id/oauth2/v1` | `api-satusehat-stg.dto.kemkes.go.id/oauth2/v1` |
| KYC | `api-satusehat.kemkes.go.id/kyc/v1` | `api-satusehat-stg.dto.kemkes.go.id/kyc/v1` |
| RME | `api-satusehat.kemkes.go.id` | `api-satusehat-stg.dto.kemkes.go.id` |

**Penting:** semua family di staging itu satu host yang sama (`api-satusehat-stg.dto.kemkes.go.id`, domain `.dto.`), cuma beda path prefix. Collection Postman lama nunjukkin host yang beda buat Master Data (`api-satusehat-stg.kemkes.go.id`, tanpa `.dto.`) — itu **stale**, udah gak dipake lagi. SDK ini udah pake host yang bener (dikonfirmasi live), jadi gak perlu diutak-atik lagi kecuali SATU SEHAT ganti infra lagi.

## Dapetin token

SDK **sengaja gak nyimpen/nge-refresh token sendiri** — itu tanggung jawab consumer (simpen di Redis, DB, memory, terserah).

```ts
const token = await client.auth.getAccessToken();
// { accessToken, tokenType, expiresInSeconds, expiresAt, raw }

client.setToken(token.accessToken);
```

Simpen `token.expiresAt` (epoch ms) di storage lu sendiri, dan panggil `getAccessToken()` lagi kalau udah mau expired. Pas request token gagal (401), cek dulu:
- Bener client_id/client_secret-nya (bukan ketuker)
- Bener environment-nya (staging vs production kredensial beda)
- Kalo baru bikin app di portal SATU SEHAT, kadang butuh jeda aktivasi

## Smoke test

```bash
SATUSEHAT_CLIENT_ID=xxx SATUSEHAT_CLIENT_SECRET=yyy npm run smoke
```
