#!/usr/bin/env node
/**
 * Staging smoke test for the SATU SEHAT SDK (mirrors doku's smoke-checkout.mjs).
 *
 * Usage:
 *   SATUSEHAT_CLIENT_ID=... SATUSEHAT_CLIENT_SECRET=... npm run smoke
 *
 * Runs non-destructive read-only calls against staging:
 *   1. OAuth2 client-credentials token
 *   2. Patient search by NIK / name (first hit only)
 *   3. Master Data province list
 *
 * No state is created or modified.
 */
import { createSatuSehatClient, nikIdentifier } from "../dist/index.js";

const clientId = process.env.SATUSEHAT_CLIENT_ID;
const clientSecret = process.env.SATUSEHAT_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set SATUSEHAT_CLIENT_ID and SATUSEHAT_CLIENT_SECRET to run the smoke test.");
  process.exit(1);
}

const client = createSatuSehatClient({ environment: "staging", clientId, clientSecret });

async function main() {
  console.log("== 1. OAuth2 client_credentials ==");
  const token = await client.auth.getAccessToken();
  console.log(
    `   access_token: ${token.accessToken.slice(0, 8)}... expires_in: ${token.expiresInSeconds ?? "?"}s`,
  );
  client.setToken(token.accessToken);

  console.log("== 2. Master Data: provinces ==");
  const provinces = await client.regions.getProvinces({ codes: "11,12" });
  console.log(`   got ${provinces.data?.length ?? 0} province(s): ${(provinces.data ?? [])
    .map((p) => p.name)
    .join(", ")}`);

  const nik = process.env.SATUSEHAT_TEST_NIK;
  if (nik) {
    console.log("== 3. FHIR: Patient search by NIK ==");
    const bundle = await client.search.searchPatient({ identifier: nikIdentifier(nik) });
    const first = bundle.entry?.[0]?.resource;
    console.log(
      first
        ? `   found Patient/${first.id} (${String(first.name?.[0]?.text ?? "no name")})`
        : `   no patient found for NIK ${nik}`,
    );
  } else {
    console.log("== 3. FHIR patient search skipped (set SATUSEHAT_TEST_NIK to enable) ==");
  }

  console.log("\nSmoke test OK.");
}

main().catch((err) => {
  console.error("Smoke test FAILED:", err?.status ?? "", err?.message ?? err);
  if (err?.body) console.error(JSON.stringify(err.body, null, 2).slice(0, 800));
  process.exit(1);
});
