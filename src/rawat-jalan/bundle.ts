import type { SatuSehatClient } from "../core/client.js";
import type { FhirResource } from "../fhir/types.js";

/**
 * FHIR transaction Bundle builder shared by the "Bundle Rawat Jalan" and
 * "Bundle Rawat Jalan Gigi" composites: build the whole outpatient visit as
 * one Bundle and POST it once, letting the server resolve `urn:uuid:`
 * references between the resources.
 */

export type BundleRequestMethod = "POST" | "PUT" | "PATCH" | "GET" | "DELETE";

export interface BundleEntryInput {
  /** FHIR resource to include (resourceType + fields); `id` optional for POST */
  resource: { resourceType: string; [key: string]: unknown };
  /** Defaults to "POST" (create) — the shape SATUSEHAT's examples use */
  method?: BundleRequestMethod;
  /** Required for PUT/PATCH/GET/DELETE */
  url?: string;
  /** Stable local reference: referenced as `${this value}` elsewhere in the Bundle */
  fullUrl?: string;
}

export interface TransactionBundleOptions {
  /** Response: return `return` (default), the full Bundle, or `resource` (first created resource) */
  response?: "return" | "bundle" | "resource";
}

export interface FhirTransactionBundle {
  resourceType: "Bundle";
  type: "transaction";
  entry: Array<{
    fullUrl?: string;
    resource: Record<string, unknown>;
    request: { method: BundleRequestMethod; url: string };
  }>;
}

/** Assemble a FHIR transaction Bundle from typed entries. */
export function buildTransactionBundle(entries: BundleEntryInput[]): FhirTransactionBundle {
  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: entries.map((e) => ({
      ...(e.fullUrl ? { fullUrl: e.fullUrl } : {}),
      resource: e.resource,
      request: {
        method: e.method ?? "POST",
        url: e.url ?? e.resource.resourceType,
      },
    })),
  };
}

/**
 * POST {baseUrl} — submit a FHIR transaction Bundle to SATUSEHAT.
 * The server processes entries atomically and resolves internal references.
 */
export async function submitBundle(
  client: SatuSehatClient,
  bundle: FhirTransactionBundle,
  options: TransactionBundleOptions = {},
): Promise<unknown> {
  return client.request("POST", "/", {
    body: bundle as unknown as Record<string, unknown>,
  });
}

/**
 * Convenience: build + submit in one call.
 * ```ts
 * const result = await submitVisitBundle(client, [
 *   { resource: encounter },
 *   { resource: condition }, // may reference { fullUrl: "urn:uuid:..." }
 * ]);
 * ```
 */
export async function submitVisitBundle(
  client: SatuSehatClient,
  entries: BundleEntryInput[],
  options: TransactionBundleOptions = {},
): Promise<unknown> {
  return submitBundle(client, buildTransactionBundle(entries), options);
}

/** Re-export for callers building Composite bundles from typed resources. */
export type { FhirResource };
