#!/usr/bin/env node
/**
 * Regression check: client-independent helpers (marked with `markUnbound`)
 * must work through the client namespaces without `client` being prepended.
 *
 * Usage: npm run build && node scripts/bind-check.mjs
 */
import assert from "node:assert/strict";
import { createSatuSehatClient } from "../dist/index.js";
const s = createSatuSehatClient({ environment: "staging", clientId: "x", clientSecret: "y" });
assert.equal(s.search.nikIdentifier("123"), "https://fhir.kemkes.go.id/id/nik|123");
assert.ok(s.klaimSwasta.webhook.parseWebhookPayload({ data: { fhir: {} }, meta: { method: "claimBundle" } }));
assert.ok(s.klaimSwasta.webhook.parseWebhookPayloadAs({ data: { fhir: {} }, meta: { method: "claimBundle" } }, "claimBundle"));
assert.equal(s.rawatJalan.bundle.buildTransactionBundle([]).resourceType, "Bundle");
assert.equal(s.farmasi.bundle.buildTransactionBundle([]).type, "transaction");
const kp = s.kyc.generateKycKeyPair();
assert.equal(s.kyc.decryptKycMessage(s.kyc.encryptKycMessage("hi", kp.publicKey), kp.privateKey), "hi");
assert.equal(typeof s.search.searchPatient, "function");
console.log("bind ok");
