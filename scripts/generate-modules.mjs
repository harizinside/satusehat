#!/usr/bin/env node
/**
 * Re-runnable codegen for the SATU SEHAT SDK.
 *
 * Reads the Postman collections shipped in the repo root and emits one module
 * per mapped folder grouping:
 *   - 00. FHIR Resource...  -> src/fhir/<resource>.ts     (Resource > <Type>)
 *   - 01. Pelayanan - Rawat Jalan... -> src/rawat-jalan/<folder>.ts
 *   - 24. Use Case - Gigi... -> src/gigi/<folder>.ts
 *   - 25. Modul Klaim (Asuransi Swasta) -> src/klaim-swasta/*.ts
 *   - 26. Modul Klaim (BPJS-K) -> src/klaim-bpjs/*.ts
 *
 * Dedupe rules:
 *   - STAGING/PROD subtrees and O-Auth2 folders are skipped entirely
 *     (auth lives in src/common/auth.ts).
 *   - One function per unique method+path per collection (the Klaim-BPJS 610
 *     leaf requests collapse to their real endpoints).
 *   - Existing output files are never overwritten unless --force, so
 *     hand-refined modules (bundles, patient/organization/location/practitioner)
 *     survive re-runs.
 *
 * Usage: node scripts/generate-modules.mjs [--force] [--only fhir,klaim-bpjs]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only"));
const ONLY = onlyArg ? onlyArg.split("=")[1]?.split(",") ?? [] : null;

const SRC = {
  fhir: "00. FHIR Resource - Contoh Penggunaan.postman_collection.json",
  rawatJalan: "01. Pelayanan - Rawat Jalan.postman_collection.json",
  gigi: "24. Use Case - Gigi.postman_collection.json",
  klaimSwasta: "25. Use Case - Modul Klaim (Asuransi Swasta).postman_collection.json",
  klaimBpjs: "26. Use Case - Modul Klaim (BPJS-K).postman_collection.json",
};

// ---------------------------------------------------------------------------
// Module mapping: folder-path prefix -> output file (relative to src/)
// ---------------------------------------------------------------------------

/** FHIR resource segment -> module file (kebab). "Observation - TTV" keeps its own file. */
function fhirResourceFile(name) {
  return `fhir/${kebab(name)}.ts`;
}

const KEBAB_SKIP = ["O-Auth2", "Error Response"];

/** Per-collection mapping rules, evaluated in order. Return {file} or {skip:true}. */
const RULES = {
  fhir: [
    { test: (p) => KEBAB_SKIP.includes(p[0]), skip: true },
    {
      test: (p) => p[0] === "Resource" && p.length >= 2,
      file: (p) => fhirResourceFile(p[1]),
    },
  ],
  rawatJalan: [
    { test: (p) => KEBAB_SKIP.includes(p[0]), skip: true },
    // Shared with common/: organization setup + patient/nakes search
    {
      test: (p) =>
        p[0].startsWith("00. Membuat Struktur") || p[0].startsWith("01. Mencari Data"),
      skip: true,
    },
    { test: (p) => p[0] === "Bundle Rawat Jalan", skip: true }, // hand-written bundle.ts
    {
      test: (p) => p.length >= 1,
      file: (p) => `rawat-jalan/${kebab(stripNumbering(p[0]))}.ts`,
    },
  ],
  gigi: [
    { test: (p) => KEBAB_SKIP.includes(p[0]), skip: true },
    {
      test: (p) =>
        p[0].startsWith("00. Membuat Struktur") || p[0].startsWith("01. Mencari Data"),
      skip: true,
    },
    { test: (p) => p[0] === "Bundle Rawat Jalan Gigi", skip: true }, // hand-written bundle.ts
    {
      test: (p) => p.length >= 1,
      file: (p) => `gigi/${kebab(stripNumbering(p[0]))}.ts`,
    },
  ],
  klaimSwasta: [
    { test: (p) => KEBAB_SKIP.includes(p[0]), skip: true },
    { test: (p) => p[0].startsWith("Klaim Swasta - Primary Payor"), file: () => "klaim-swasta/primary-payor.ts" },
    { test: (p) => p[0].startsWith("Klaim Swasta - Secondary Payor"), file: () => "klaim-swasta/secondary-payor.ts" },
    { test: (p) => p[0].startsWith("Klaim Swasta - TPA"), file: () => "klaim-swasta/tpa.ts" },
    { test: (p) => p[0].startsWith("Out Of Pocket"), file: () => "klaim-swasta/oop.ts" },
    { test: (p) => p[0].startsWith("Katalog Webhook"), file: () => "klaim-swasta/webhook.ts" },
    { test: (p) => p[0] === "Komunikasi", file: () => "klaim-swasta/komunikasi.ts" },
  ],
  klaimBpjs: [
    { test: (p) => KEBAB_SKIP.includes(p[0]), skip: true },
    { test: (p) => p[0].startsWith("Variabel terkait"), file: () => "klaim-bpjs/variabel.ts" },
    { test: (p) => p[0].startsWith("Contoh Klaim"), file: () => "klaim-bpjs/contoh-klaim.ts" },
  ],
};

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

function camelCase(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join("");
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function kebab(name) {
  return String(name)
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function stripNumbering(name) {
  return String(name).replace(/^\d+\.\s*/, "");
}

// ---------------------------------------------------------------------------
// Path / query / body extraction
// ---------------------------------------------------------------------------

const KNOWN_RESOURCES = new Set([
  "Patient", "Practitioner", "Organization", "Location", "Encounter", "Condition",
  "Observation", "Composition", "Procedure", "Medication", "MedicationRequest",
  "MedicationDispense", "DiagnosticReport", "AllergyIntolerance", "ClinicalImpression",
  "Immunization", "ImagingStudy", "EpisodeOfCare", "CarePlan", "QuestionnaireResponse",
  "ServiceRequest", "Specimen", "RelatedPerson", "Coverage", "CoverageEligibilityRequest",
  "CoverageEligibilityResponse", "Account", "ChargeItem", "Invoice", "Claim",
  "ClaimResponse", "PaymentReconciliation", "PaymentNotice",
]);

const HOST_VARS = /^\{\{(?:base_url|base_url_staging|kyc_base_url|auth_url|auth_url_staging|url)\}\}/;

function parseRequest(item) {
  const request = item.request;
  const rawUrl = request.url?.raw ?? String(request.url ?? "");
  if (!rawUrl || HOST_VARS.test(rawUrl) === false) return null; // absolute hosts are hand-written
  let rest = rawUrl.replace(HOST_VARS, "");
  const qi = rest.indexOf("?");
  let queryPart = "";
  if (qi >= 0) {
    queryPart = rest.slice(qi + 1);
    rest = rest.slice(0, qi);
  }
  const path = rest;
  if (!path || path === "/") return null; // e.g. bare {{base_url}} (Bundle composites)

  // Postman variables left in the path (e.g. /Claim/{{Claim_id}}/$everything)
  const params = [];
  let templatePath = path.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (_, name) => {
    const camel = camelCase(name) || "id";
    if (!params.some(([n]) => n === camel)) params.push([camel, "string"]);
    return `\${${camel}}`;
  });

  // Hardcoded example IDs the collection ships (same approach as doku's templates)
  if (/^\/Patient\/P\d+$/.test(templatePath)) {
    templatePath = "/Patient/${id}";
    if (!params.some(([n]) => n === "id")) params.push(["id", "string"]);
  }

  // :var path segments -> template params
  templatePath = templatePath.replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
    params.push([name, "string"]);
    return `\${${name}}`;
  });

  // query keys from the URL spec (order-preserving, deduped)
  const queryKeys = [];
  const seen = new Set();
  for (const q of request.url?.query ?? []) {
    if (q.key && !seen.has(q.key)) {
      seen.add(q.key);
      queryKeys.push(q.key);
    }
  }
  // plus keys only visible in the raw query string
  if (queryPart) {
    for (const kv of queryPart.split("&")) {
      const key = kv.split("=")[0];
      if (key && !seen.has(key)) {
        seen.add(key);
        queryKeys.push(key);
      }
    }
  }

  let body;
  if (request.body?.mode === "raw" && request.body.raw && request.method !== "GET") {
    try {
      body = JSON.parse(request.body.raw.replace(/\{\{[^}]+\}\}/g, null));
    } catch {
      body = undefined;
    }
  }

  // saved example response -> hints for the return type
  let responseType = "unknown";
  const exampleRaw = item.response?.[0]?.body;
  if (exampleRaw) {
    try {
      const example = JSON.parse(exampleRaw);
      if (example && typeof example === "object" && example.resourceType === "Bundle") {
        responseType = "bundle";
      }
    } catch {
      /* non-JSON example -> keep unknown */
    }
  }
  const firstSeg = path.split("/").filter(Boolean)[0];
  const known = KNOWN_RESOURCES.has(firstSeg) ? firstSeg : null;

  return { method: request.method, path, templatePath, params, queryKeys, body, responseType, known };
}

// ---------------------------------------------------------------------------
// Type inference from example bodies (mirrors doku's generator)
// ---------------------------------------------------------------------------

function scalarType(value) {
  if (value === null) return "unknown";
  switch (typeof value) {
    case "string": return "string";
    case "number": return "number";
    case "boolean": return "boolean";
    default: return "unknown";
  }
}

function fieldEntry(key, value) {
  const name = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return { name, fields: Object.entries(value).map(([k, v]) => fieldEntry(k, v)) };
  }
  if (Array.isArray(value)) {
    return {
      name,
      type: value.length && value[0] !== null && typeof value[0] === "object"
        ? "Array<Record<string, unknown>>"
        : value.length
          ? `Array<${scalarType(value[0])}>`
          : "unknown[]",
    };
  }
  return { name, type: scalarType(value) };
}

function renderFields(fields, indent) {
  const pad = " ".repeat(indent);
  return fields
    .map((f) =>
      f.fields
        ? `${pad}${f.name}: {\n${renderFields(f.fields, indent + 2)}\n${pad}};`
        : `${pad}${f.name}?: ${f.type};`,
    )
    .join("\n");
}

// ---------------------------------------------------------------------------
// Walk collections and collect operations per module file
// ---------------------------------------------------------------------------

function walk(items, path, out) {
  for (const it of items || []) {
    if (it.item) {
      walk(it.item, path.concat(it.name), out);
      continue;
    }
    if (!it.request) continue;
    const folderPath = path.concat(it.name);
    out.push({ folderPath, item: it });
  }
}

// Endpoints already implemented once in src/common/*.ts (organization/location
// setup, patient/practitioner search) — never generate a second copy of these
// into fhir/*.ts. See COMMON_REEXPORTS below for the shim that re-exports the
// common implementation under the matching fhir/*.ts namespace instead.
const COMMON_OWNED = [
  ["fhir/patient.ts", "GET", "/Patient"],
  ["fhir/practitioner.ts", "GET", "/Practitioner"],
  ["fhir/organization.ts", "POST", "/Organization"],
  ["fhir/organization.ts", "GET", "/Organization/:id"],
  ["fhir/location.ts", "POST", "/Location"],
  ["fhir/location.ts", "GET", "/Location/:id"],
  // The two Klaim collections repeat the same org/location setup + patient/nakes
  // lookup calls the FHIR + Rawat Jalan + Gigi collections already share via common/.
  ["klaim-swasta/primary-payor.ts", "POST", "/Organization"],
  ["klaim-swasta/primary-payor.ts", "POST", "/Location"],
  ["klaim-swasta/primary-payor.ts", "GET", "/Patient"],
  ["klaim-swasta/primary-payor.ts", "GET", "/Patient/:id"],
  ["klaim-swasta/primary-payor.ts", "GET", "/Practitioner/:id"],
  ["klaim-bpjs/contoh-klaim.ts", "POST", "/Organization"],
  ["klaim-bpjs/contoh-klaim.ts", "POST", "/Location"],
  ["klaim-bpjs/contoh-klaim.ts", "GET", "/Patient"],
  ["klaim-bpjs/contoh-klaim.ts", "GET", "/Patient/:id"],
  ["klaim-bpjs/contoh-klaim.ts", "GET", "/Practitioner"],
  ["klaim-bpjs/contoh-klaim.ts", "GET", "/Practitioner/:id"],
];
function isCommonOwned(file, method, path) {
  return COMMON_OWNED.some(([f, m, p]) => f === file && m === method && p === path);
}

function mergeQueryKeys(target, extra) {
  for (const k of extra) if (!target.includes(k)) target.push(k);
}

/** Fill in any body fields only present in a later example; keep the first example's values. */
function mergeBody(target, extra) {
  if (target === undefined) return extra;
  if (extra === undefined) return target;
  if (Array.isArray(target) || Array.isArray(extra)) return target; // JSON Patch bodies: keep first
  if (typeof target !== "object" || typeof extra !== "object") return target;
  return { ...extra, ...target };
}

function collect(collectionFile, rules) {
  const collection = JSON.parse(readFileSync(join(pkgRoot, collectionFile), "utf8"));
  const leaves = [];
  walk(collection.item, [], leaves);

  const modules = new Map(); // file -> ops[]
  const endpointIndex = new Map(); // file -> Map(method+path -> op)
  for (const { folderPath, item } of leaves) {
    if (/accesstoken/i.test(item.request?.url?.raw ?? "")) continue; // auth -> common/auth.ts
    const rule = rules.find((r) => r.test(folderPath));
    if (!rule || rule.skip) continue;
    const file = rule.file(folderPath);
    if (ONLY && !ONLY.some((o) => file.startsWith(o))) continue;

    const parsed = parseRequest(item);
    if (!parsed) continue;
    if (isCommonOwned(file, parsed.method, parsed.path)) continue;

    const endpointKey = `${parsed.method} ${parsed.path}`;
    if (!modules.has(file)) modules.set(file, []);
    if (!endpointIndex.has(file)) endpointIndex.set(file, new Map());
    const index = endpointIndex.get(file);
    const existing = index.get(endpointKey);
    if (existing) {
      // Another saved example of the same endpoint: each example in the
      // collection tends to only exercise a subset of the real params, so
      // union them instead of silently dropping this example's fields.
      mergeQueryKeys(existing.queryKeys, parsed.queryKeys);
      existing.body = mergeBody(existing.body, parsed.body);
      continue;
    }
    const ops = modules.get(file);
    let fn = camelCase(stripNumbering(item.name)) || camelCase(folderPath.at(-1));
    while (ops.some((o) => o.fn === fn)) fn = fn.replace(/\d+$/, "") + (countSuffix(ops, fn) + 2);
    const op = { ...parsed, fn, requestName: item.name, folder: folderPath.at(-1) };
    index.set(endpointKey, op);
    ops.push(op);
  }
  return modules;
}

function countSuffix(ops, base) {
  let n = 0;
  for (const o of ops) if (o.fn === base || new RegExp(`^${base}\\d+$`).test(o.fn)) n++;
  return Math.max(0, n - 1);
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

// Endpoints covered by COMMON_OWNED above get re-exported here instead, so
// e.g. `client.fhir.practitioner.searchPractitioner` keeps working without a
// second implementation.
const COMMON_REEXPORTS = {
  "fhir/patient.ts": [`export { searchPatient } from "../common/search.js";`],
  "fhir/practitioner.ts": [`export { searchPractitioner } from "../common/search.js";`],
  "fhir/organization.ts": [
    `export { createOrganization, getOrganization } from "../common/organization.js";`,
  ],
  "fhir/location.ts": [`export { createLocation, getLocation } from "../common/organization.js";`],
  "klaim-swasta/primary-payor.ts": [
    `export { createOrganization, createLocation } from "../common/organization.js";`,
    `export { searchPatient, getPatientById, getPractitionerById } from "../common/search.js";`,
  ],
  "klaim-bpjs/contoh-klaim.ts": [
    `export { createOrganization, createLocation } from "../common/organization.js";`,
    `export { searchPatient, getPatientById, searchPractitioner, getPractitionerById } from "../common/search.js";`,
  ],
};

function renderModule(file, ops, collectionFile) {
  const depth = file.split("/").length - 1;
  const coreImport = `${"../".repeat(depth)}core/client.js`;
  const fhirTypesImport = `${"../".repeat(depth)}fhir/types.js`;
  const lines = [];
  lines.push(`/**`);
  lines.push(` * ${file.replace(/\.ts$/, "")} — generated by scripts/generate-modules.mjs`);
  lines.push(` * from "${collectionFile}". Re-run \`npm run generate\` instead of hand-editing.`);
  lines.push(` *`);
  lines.push(` * Request body types are inferred from the collection's example bodies (leaf`);
  lines.push(` * fields optional). Response types use the shared FHIR helpers where the`);
  lines.push(` * endpoint is unambiguous, otherwise \`unknown\`.`);
  lines.push(` */`);
  lines.push(`import type { SatuSehatClient } from "${coreImport}";`);
  const needsTypes = ops.some(
    (o) => o.responseType === "bundle" || o.known || Array.isArray(o.body),
  );
  if (needsTypes) lines.push(`import type { FhirBundle, FhirPatchOperation, FhirResource } from "${fhirTypesImport}";`);
  lines.push("");
  const reexports = COMMON_REEXPORTS[file];
  if (reexports) {
    lines.push(`// Search/create/lookup already implemented once in src/common/*.ts.`);
    for (const line of reexports) lines.push(line);
    lines.push("");
  }

  for (const op of ops) {
    const bodyTypeName = `${cap(op.fn)}Body`;
    const paramsTypeName = `${cap(op.fn)}Params`;
    const hasBody = op.body !== undefined;
    const queryParams = op.queryKeys.map((k) => [camelCase(k), k]);
    const pathParams = op.params;
    const hasParamsObj = queryParams.length > 0;

    if (hasParamsObj) {
      lines.push(`export interface ${paramsTypeName} {`);
      for (const [camel] of queryParams) lines.push(`    ${camel}?: string | number;`);
      lines.push(`}`);
      lines.push("");
    }

    if (hasBody) {
      if (Array.isArray(op.body)) {
        // JSON Patch style body
      } else if (typeof op.body === "object") {
        lines.push(`export interface ${bodyTypeName} {`);
        lines.push(renderFields(Object.entries(op.body).map(([k, v]) => fieldEntry(k, v)), 2));
        lines.push(`}`);
        lines.push("");
      }
    }

    // return type
    let retType = "unknown";
    if (op.responseType === "bundle") {
      retType = op.known ? `FhirBundle<"${op.known}">` : "FhirBundle";
    } else if (op.known) {
      retType = /GET|POST/.test(op.method) ? `FhirResource<"${op.known}">` : "FhirResource";
    }

    const docExtra = op.folder && op.folder !== op.requestName ? ` (${op.folder})` : "";
    lines.push(`/** ${op.requestName} — ${op.method} ${op.path}${docExtra} */`);
    lines.push(`export async function ${op.fn}(`);
    const args = ["client: SatuSehatClient"];
    for (const [p, t] of pathParams) args.push(`${p}: ${t}`);
    if (hasBody) {
      args.push(
        Array.isArray(op.body)
          ? "operations: FhirPatchOperation[]"
          : `body: ${bodyTypeName}`,
      );
    }
    if (hasParamsObj) args.push(`params: ${paramsTypeName} = {}`);
    lines.push(`  ${args.join(", ")}`);
    lines.push(`): Promise<${retType}> {`);

    const pathExpr = pathParams.length ? `\`${op.templatePath}\`` : JSON.stringify(op.templatePath);
    const callArgs = [JSON.stringify(op.method), pathExpr];
    const opts = [];
    if (hasParamsObj && queryParams.length) {
      opts.push(
        `    query: { ${queryParams
          .map(([c, k]) =>
            /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? `${k}: params.${c}` : `${JSON.stringify(k)}: params.${c}`,
          )
          .join(", ")} },`,
      );
    }
    if (hasBody) {
      opts.push(
        Array.isArray(op.body)
          ? `    body: operations,`
          : `    body: body as unknown as Record<string, unknown>,`,
      );
    }
    if (opts.length) {
      callArgs.push(`{\n${opts.join("\n")}\n  }`);
    }
    lines.push(`  return client.request(${callArgs.join(", ")}) as Promise<${retType}>;`);
    lines.push(`}`);
    lines.push("");
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(join(pkgRoot, "src"), { recursive: true });
let written = 0;
let skipped = 0;
for (const [key, collectionFile] of Object.entries(SRC)) {
  const keyKebab = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  if (ONLY && !ONLY.some((o) => keyKebab === o || keyKebab.startsWith(o) || o.startsWith(keyKebab))) {
    continue;
  }
  const modules = collect(collectionFile, RULES[key]);
  if (key === "fhir") {
    // Ensure common-only-owned files (all ops filtered out above) still get
    // written with their re-export shim, e.g. fhir/practitioner.ts.
    for (const file of Object.keys(COMMON_REEXPORTS)) {
      if (!modules.has(file)) modules.set(file, []);
    }
  }
  for (const [file, ops] of modules) {
    const target = join(pkgRoot, "src", file);
    if (existsSync(target) && !FORCE) {
      skipped++;
      console.log(`skip (exists): ${file}`);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, renderModule(file, ops, collectionFile));
    written++;
    console.log(`wrote: ${file} (${ops.length} operations)`);
  }
}
console.log(`\nDone. ${written} module(s) written, ${skipped} skipped (already exist).`);
