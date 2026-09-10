#!/usr/bin/env node
/**
 * One-off generator for the ICD-10 / ICD-9-CM reference-data modules.
 *
 * Reads the e-klaim CSVs shipped in the repo root (Kemkes ICD10_2010 /
 * ICD9CM_2010) at build time and emits static TypeScript data modules:
 *   - src/fhir/coding/icd10.ts
 *   - src/fhir/coding/icd9cm.ts
 *
 * Each module holds a compact [code, display][] tuple array plus helpers:
 *   icd10Coding(code)            -> Coding | undefined
 *   searchIcd10(query, limit=20) -> Coding[] (case-insensitive substring on display)
 * (mirrored for icd9cm).
 *
 * No filesystem access at runtime — plain static data, edge-safe.
 *
 * Usage: node scripts/generate-icd.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const SOURCES = [
  {
    csv: "[PUBLIC] ICD-10 e-klaim.xlsx - ICD10.csv",
    out: "icd10",
    system: "ICD10",
    version: "ICD10_2010",
  },
  {
    csv: "[PUBLIC] ICD-9CM e-klaim.xlsx - ICD9 CM.csv",
    out: "icd9cm",
    system: "ICD9CM",
    version: "ICD9CM_2010",
  },
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

function esc(s) {
  return JSON.stringify(s);
}

for (const { csv, out, system, version } of SOURCES) {
  const text = readFileSync(join(pkgRoot, csv), "utf8");
  const rows = parseCsv(text);
  const header = rows[0];
  if (header[0] !== "CODE" || header[1] !== "DISPLAY") {
    throw new Error(`${csv}: unexpected header ${JSON.stringify(header)}`);
  }
  const data = rows.slice(1).map((r) => [r[0], r[1]]);

  const seen = new Set();
  for (const [code] of data) {
    if (seen.has(code)) throw new Error(`${csv}: duplicate code ${code}`);
    seen.add(code);
    if (!code) throw new Error(`${csv}: empty code`);
  }

  const tuples = data.map(([code, display]) => `    [${esc(code)}, ${esc(display)}],`).join("\n");
  const content = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node scripts/generate-icd.mjs
 *
 * Source: ${csv} (Kemkes e-klaim ${version}), ${data.length} entries.
 * Static data only — no filesystem access at runtime.
 */
import { SYSTEM } from "./systems.js";
import type { Coding } from "../types.js";

/** All ${out.toUpperCase()} codes and displays, in source (alphabetical) order. */
const ENTRIES: readonly (readonly [string, string])[] = [
${tuples}
];

const LOOKUP: Map<string, string> = new Map(ENTRIES);

/** Look up one ${out.toUpperCase()} code; undefined if unknown. */
export function ${out}Coding(code: string): Coding | undefined {
  const display = LOOKUP.get(code);
  return display === undefined ? undefined : { system: SYSTEM.${system}, code, display };
}

/** Case-insensitive substring search over displays (cheap linear scan). */
export function search${out === "icd10" ? "Icd10" : "Icd9Cm"}(query: string, limit = 20): Coding[] {
  const q = query.toLowerCase();
  const hits: Coding[] = [];
  if (q !== "") {
    for (const [code, display] of ENTRIES) {
      if (display.toLowerCase().includes(q)) {
        hits.push({ system: SYSTEM.${system}, code, display });
        if (hits.length >= limit) break;
      }
    }
  }
  return hits;
}

/** Number of entries in this catalog. */
export const ${out.toUpperCase()}_COUNT = ENTRIES.length;
`;
  const outFile = join(pkgRoot, "src/fhir/coding", `${out}.ts`);
  writeFileSync(outFile, content);
  console.log(`${out}.ts: ${data.length} entries`);
}
