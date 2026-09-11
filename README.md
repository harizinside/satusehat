# @harizinside/satusehat

SATU SEHAT (Kemenkes) Platform SDK for Node.js — TypeScript, ESM, zero runtime dependencies.

```bash
npm install github:harizinside/satusehat
```

**Full step-by-step integration guide (real order of operations, gotchas, confirmed-working examples): see [`wiki/`](wiki/Home.md).**

Covers the platform's public surface: OAuth2 client-credentials, 39+ FHIR R4
resources (including Appointment/HealthcareService/AppointmentResponse/
PractitionerRole/Slot scheduling and FamilyMemberHistory), Master Data
(wilayah + sarana), KFA (farmasi/alkes formulary & pricing), KYC (faskes),
national RME consent/link, the Rawat Jalan and Gigi outpatient workflows, the
private-insurance (Asuransi Swasta) + BPJS-Kesehatan claim modules, ~50 FHIR
terminology/coding constants, and full ICD-10/ICD-9-CM catalogs.

**This SDK has been exercised end-to-end against the real SATU SEHAT staging
sandbox** — not just compiled. Rawat Jalan (16 steps), Gigi (11 steps), Master
Data, KYC, and RME have all been run with real API calls, with several real
server-side requirements discovered and fixed along the way (see
[`wiki/Known-Issues.md`](wiki/Known-Issues.md)).

## Architecture

Mirrors the sibling [`doku`](https://github.com/harizinside/doku) package:

- `SatuSehatClient` — config + low-level `request()`; injectable `fetchImpl`
- Standalone functions, one module per collection folder: `fn(client, ...args)`
- `createSatuSehatClient(config)` binds every module onto the instance and is also
  exported standalone for tree-shaking:
  ```ts
  import { search } from "@harizinside/satusehat";  // standalone
  satusehat.search.searchPatient(params);            // bound to a client
  ```
- **Auth is caller-managed.** The SDK never caches or auto-refreshes tokens —
  `getAccessToken()` fetches and returns `{ accessToken, expiresAt, ... }`; you store
  it (Redis, DB, memory) and pass it back via `new SatuSehatClient({ token })` or
  `client.setToken()`.

### Environments

Four API families, each with its own host/path shape — **confirmed against the
live server**, not just the source collections (which had a stale Master Data
host). Full detail: [`wiki/Setup-and-Auth.md`](wiki/Setup-and-Auth.md).

| Family | `production` | `staging` |
|---|---|---|
| FHIR (`fhir.*`) | `api-satusehat.kemkes.go.id/fhir-r4/v1` | `api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1` |
| Master Data + KFA | `api-satusehat.kemkes.go.id` | `api-satusehat-stg.dto.kemkes.go.id` |
| OAuth2 | `api-satusehat.kemkes.go.id/oauth2/v1` | `api-satusehat-stg.dto.kemkes.go.id/oauth2/v1` |
| KYC | `api-satusehat.kemkes.go.id/kyc/v1` | `api-satusehat-stg.dto.kemkes.go.id/kyc/v1` |
| RME | `api-satusehat.kemkes.go.id` | `api-satusehat-stg.dto.kemkes.go.id` |

All four staging hosts are the same `.dto.` domain, just different path
prefixes (`baseUrl`, `masterDataBaseUrl`, `authBaseUrl`, `kycBaseUrl`,
`rmeBaseUrl` on `SatuSehatClientConfig` — override any of them per client).

## Usage

```ts
import { createSatuSehatClient, nikIdentifier } from "@harizinside/satusehat";

const satusehat = createSatuSehatClient({
  environment: "staging",        // or "production"
  clientId: process.env.SATUSEHAT_CLIENT_ID,
  clientSecret: process.env.SATUSEHAT_CLIENT_SECRET,
  // token: cachedAccessToken,  // optional — skips an explicit auth step
});

// 1. Mint a token (caller owns storage/refresh)
const { accessToken, expiresAt } = await satusehat.auth.getAccessToken();
satusehat.setToken(accessToken); // or keep it and pass `token` on next construction

// 2. Find the patient (FHIR search)
const patients = await satusehat.search.searchPatient({
  identifier: nikIdentifier("9271060312000001"), // helper builds "https://fhir.kemkes.go.id/id/nik|<nik>"
});
const patient = patients.entry?.[0]?.resource;

// 3. Outpatient visit (Rawat Jalan) — see wiki/Rawat-Jalan-Flow.md for the full
//    16-step sequence with every required field this session found by testing
//    live (Medication.extension, PATCH content-type, identifier namespaces, ...)
const encounter = await satusehat.fhir.encounter.encounterCreate({
  resourceType: "Encounter",
  status: "arrived",
  class: satusehat.coding.ENCOUNTER_CLASS.ambulatory,
  subject: { reference: `Patient/${patient.id}` },
  // ...
});
```

### Framework notes

- **Next.js** — construct the client inside route handlers/server actions with
  `token` read from your cache; never expose `clientSecret` to the browser.
- **Hono** — the client is plain ESM with no runtime deps, so it runs on
  `nodejs_compat` workers/middleware as-is.
- **TanStack Start** — same; use server functions for any call touching secrets.

## Coding/terminology constants

`satusehat.coding.*` — ~50 FHIR/Kemkes CodeSystem constants (`ENCOUNTER_CLASS`,
`OBSERVATION_CATEGORY`, `CONDITION_CLINICAL_STATUS`, `KEMKES_MEDICATION_TYPE`,
dental (`DENTAL_*`) vocabulary, identifier-namespace helpers, etc.) so you
rarely have to hand-type a `{system, code, display}` triple. Built from the
official FHIR R4 spec plus SATU SEHAT's docs, and the ones exercised in this
session's live testing are confirmed working — see
[`wiki/Known-Issues.md`](wiki/Known-Issues.md) for which constants are still
unconfirmed guesses vs. proven against the real server.

## ICD-10 / ICD-9-CM

Full Kemkes e-klaim catalogs (18,542 / 4,626 codes) are bundled but **not** in
the main import — they're on separate subpaths so consumers who don't need them
never pay for the extra bundle size:

```ts
import { icd10Coding, searchIcd10 } from "@harizinside/satusehat/icd10";
import { icd9cmCoding, searchIcd9cm } from "@harizinside/satusehat/icd9cm";

searchIcd10("cholera", 5); // -> Coding[] matched by display substring
```

## Codegen

Modules for the big collections were generated from the official SATU SEHAT
Postman collections (deleted from this repo after generation — they're ~30MB
of source data, not needed at runtime, and the compiled `src/*.ts` is what
ships). To regenerate or extend: re-export the relevant collection(s) from
your own Postman workspace into the repo root, then:

```bash
npm run generate            # writes any missing src/<module>/ files
npm run generate -- --force # overwrite everything, including hand-written files
npm run generate:icd        # regenerate ICD-10/9-CM from CSV (also deleted; same deal)
```

- One function per **unique method+path** per module file (the BPJS collection's
  610 saved example scenarios collapse to their ~50 real endpoints).
- Files that already exist are skipped unless `--force`, so hand-refined modules
  (`rawat-jalan/bundle.ts`, `klaim-swasta/webhook.ts`, `common/*`, `fhir/coding/*`)
  survive re-runs.

## Caveats

See [`wiki/Known-Issues.md`](wiki/Known-Issues.md) for the full list, confirmed
live. Highlights:

- **KFA v1 ATC/tag endpoints are dead** (`getAtcMetadata`, `getProductsByAtc`,
  `getTagMetadata`, `getProductsByTag`) — real `404`s, removed from the current
  official docs too. Marked `@deprecated`; use `getAllProductsV2` instead.
- **KFA Alkes V3 Basic auth** — `POST /kfa-v3/alkes/template` and
  `/kfa-v3/alkes/products` ship with a hardcoded `Authorization: Basic ...` header
  (not the platform OAuth2 Bearer) and an internal-only host. Implemented as
  `kfaAlkes.getAlkesTemplates/Products(client, body, { authorization, baseUrl })`;
  may not be reachable from outside Kemkes' network.
- **Tablet/countable dosage quantities use `v3-orderableDrugForm` (`code: "TAB"`),
  not UCUM** — confirmed live after UCUM's own codes (`{tbl}`, `1`) were both
  rejected by the server. `coding.UCUM_COUNT` is marked `@deprecated` pointing
  at the right constant instead.
- **KYC (`client.kyc.*`)** — envelope encryption (RSA-OAEP-sha256 + AES-256-GCM,
  matching SATU SEHAT's official PHP client) is built in via `node:crypto`
  (zero new dependency); you only supply `satuSehatPublicKey` (their published
  key, not one you generate). `generateChallengeCode` needs the `frameToken`
  + `privateKey` returned by a preceding `generateKycUrl` call — see
  [`wiki/KYC-and-RME.md`](wiki/KYC-and-RME.md).
- **Webhook examples** — `Katalog Webhook` requests target `{{webhook_url}}`
  (your own endpoint). `klaimSwasta.webhook` provides typed parsers
  (`parseWebhookPayloadAs(body, "chargeItemSubmission")`) plus
  `sendWebhookCallback()` for the acknowledgement call.

## Scripts

| Script | Purpose |
|---|---|
| `npm run build` | `tsc` → `dist/` |
| `npm run generate` | regenerate FHIR modules (needs source collections re-supplied, see Codegen) |
| `npm run generate:icd` | regenerate ICD-10/9-CM data (needs source CSVs re-supplied) |
| `npm run smoke` | staging smoke test (see below) |

## Smoke test (staging)

```bash
SATUSEHAT_CLIENT_ID=... SATUSEHAT_CLIENT_SECRET=... npm run smoke
```

Mints a token, searches master-data provinces, and (optionally, with
`SATUSEHAT_TEST_NIK` set) searches a patient by NIK — all non-destructive reads.

## Verification status

- `npm run build` (tsc, strict): clean.
- **Live-tested against SATU SEHAT staging**, not just compiled: full Rawat
  Jalan flow (23/23 steps, incl. MedicationRequest/MedicationDispense), full
  Gigi flow (14/14 steps), Immunization, Master Wilayah + Sarana + most KFA,
  full KYC flow (`generateKycUrl` + `generateChallengeCode`, encrypted
  end-to-end), RME (routing confirmed, needs real registered
  patient/practitioner data + eligible practitioner role to fully exercise).
  No open issues at the moment — see
  [`wiki/Known-Issues.md`](wiki/Known-Issues.md) for the fixes that got each
  one there and the gotchas worth knowing before you hit them yourself.
