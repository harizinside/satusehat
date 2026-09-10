import { httpRequest, type HttpResult } from "./http.js";

export type SatuSehatEnvironment = "staging" | "production";

export interface SatuSehatClientConfig {
  /** OAuth2 client_id from the SATUSEHAT portal (needed only to mint tokens via `common/auth`) */
  clientId?: string;
  /** OAuth2 client_secret from the SATUSEHAT portal */
  clientSecret?: string;
  /**
   * Access token obtained via `getAccessToken()` (or your own cache/Redis).
   * Token lifetime is caller-managed: store it wherever you like and pass it
   * back here (`token` or `setToken()`) on every client construction.
   */
  token?: string;
  environment?: SatuSehatEnvironment;
  /** Override the FHIR base (host + `/fhir-r4/v1` path prefix) */
  baseUrl?: string;
  /** Override the OAuth2 base, e.g. `https://api-satusehat.kemkes.go.id/oauth2/v1` */
  authBaseUrl?: string;
  /** Override the KYC base, e.g. `https://api-satusehat-stg.dto.kemkes.go.id/kyc/v1` */
  kycBaseUrl?: string;
  /**
   * Override the Master Data + KFA host (`collection.json`'s `base_url`/`base_url_staging`,
   * confirmed against the official Master Wilayah docs — same host as `baseUrl`/`rmeBaseUrl`
   * minus their path prefixes).
   */
  masterDataBaseUrl?: string;
  /** Override the RME (national health record) host — bare host, no `/fhir-r4/v1` prefix. */
  rmeBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface EnvironmentDefaults {
  baseUrl: string;
  authBaseUrl: string;
  kycBaseUrl: string;
  masterDataBaseUrl: string;
  rmeBaseUrl: string;
}

/**
 * All API families share the same staging host: `api-satusehat-stg.dto.kemkes.go.id`
 * (OAuth2, FHIR, KYC, RME, and — confirmed from the official Master Wilayah
 * docs at platform/docs/id/master-data/master-wilayah/rest-api-wilayah —
 * Master Data + KFA too). `collection.json`'s own `base_url_staging` variable
 * (the non-`.dto.` host) turned out to be a stale value from an older export,
 * not a second real staging host — the official docs are current infra and
 * take priority. `masterDataBaseUrl` stays a separate config from `baseUrl`
 * because the *paths* differ (`/masterdata/v1/...`, `/kfa/...` vs the
 * `/fhir-r4/v1/...` prefix baked into `baseUrl`), not because the hosts do.
 *
 * `baseUrl` carries a `/fhir-r4/v1` path prefix — confirmed from the official
 * SATU SEHAT API docs (api-catalogue pages for HealthcareService, Appointment,
 * AppointmentResponse, PractitionerRole, Slot all show the full path as
 * `.../fhir-r4/v1/<Resource>`). The Postman collections never show this
 * literally because it's baked into their `{{base_url}}` environment variable
 * (not exported), which is why every resource module's call site can keep
 * using plain relative paths like `/Patient` — only this one prefix needed
 * fixing, not every call site.
 */
const ENVIRONMENT_DEFAULTS: Record<SatuSehatEnvironment, EnvironmentDefaults> = {
  production: {
    baseUrl: "https://api-satusehat.kemkes.go.id/fhir-r4/v1",
    authBaseUrl: "https://api-satusehat.kemkes.go.id/oauth2/v1",
    // The public collections only ship a staging KYC base URL; the production
    // value is assumed symmetric and can be overridden via `kycBaseUrl`.
    kycBaseUrl: "https://api-satusehat.kemkes.go.id/kyc/v1",
    masterDataBaseUrl: "https://api-satusehat.kemkes.go.id",
    rmeBaseUrl: "https://api-satusehat.kemkes.go.id",
  },
  staging: {
    baseUrl: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1",
    authBaseUrl: "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1",
    kycBaseUrl: "https://api-satusehat-stg.dto.kemkes.go.id/kyc/v1",
    masterDataBaseUrl: "https://api-satusehat-stg.dto.kemkes.go.id",
    rmeBaseUrl: "https://api-satusehat-stg.dto.kemkes.go.id",
  },
};

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Object → sent as JSON; string → sent verbatim (set your own Content-Type) */
  body?: unknown;
  headers?: Record<string, string>;
  /** Set `false` to skip the `Authorization: Bearer` header (e.g. the token endpoint) */
  auth?: boolean;
}

export function appendQuery(url: string, query?: RequestOptions["query"]): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  if (!qs) return url;
  return url + (url.includes("?") ? "&" : "?") + qs;
}

/**
 * The only class users touch. Endpoint functions are standalone and take a
 * SatuSehatClient as their first argument; `index.ts` groups them into
 * namespaces on the instance.
 */
export class SatuSehatClient {
  readonly config: Required<
    Pick<
      SatuSehatClientConfig,
      "environment" | "baseUrl" | "authBaseUrl" | "kycBaseUrl" | "masterDataBaseUrl" | "rmeBaseUrl"
    >
  > &
    Pick<SatuSehatClientConfig, "clientId" | "clientSecret" | "fetchImpl"> & { token?: string };

  constructor(config: SatuSehatClientConfig = {}) {
    const environment = config.environment ?? "production";
    const defaults = ENVIRONMENT_DEFAULTS[environment];
    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      token: config.token,
      environment,
      baseUrl: config.baseUrl ?? defaults.baseUrl,
      authBaseUrl: config.authBaseUrl ?? defaults.authBaseUrl,
      kycBaseUrl: config.kycBaseUrl ?? defaults.kycBaseUrl,
      masterDataBaseUrl: config.masterDataBaseUrl ?? defaults.masterDataBaseUrl,
      rmeBaseUrl: config.rmeBaseUrl ?? defaults.rmeBaseUrl,
      fetchImpl: config.fetchImpl,
    };
  }

  /** Replace the access token used for subsequent requests. */
  setToken(token: string): void {
    this.config.token = token;
  }

  clearToken(): void {
    this.config.token = undefined;
  }

  /**
   * Low-level request. `pathOrUrl` may be:
   * - a path relative to `baseUrl` (e.g. `/Patient` — `baseUrl` already carries the `/fhir-r4/v1` prefix) — the normal case
   * - an absolute URL (e.g. the KYC or OAuth host) — used as-is
   */
  async request(method: string, pathOrUrl: string, options: RequestOptions = {}): Promise<unknown> {
    const url = /^https?:\/\//i.test(pathOrUrl)
      ? pathOrUrl
      : this.config.baseUrl.replace(/\/$/, "") +
        (pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
    return this.requestUrl(method, url, options);
  }

  /** Same as `request`, but resolves relative paths against `masterDataBaseUrl` (Master Data + KFA). */
  async requestMasterData(method: string, path: string, options: RequestOptions = {}): Promise<unknown> {
    const url = this.config.masterDataBaseUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
    return this.requestUrl(method, url, options);
  }

  /** Same as `request` but always treats the target as an absolute URL. */
  async requestUrl(method: string, url: string, options: RequestOptions = {}): Promise<unknown> {
    const fullUrl = appendQuery(url, options.query);
    const headers: Record<string, string> = { ...options.headers };
    if (options.auth !== false && this.config.token) {
      headers.Authorization ??= `Bearer ${this.config.token}`;
    }
    let body: string | undefined;
    if (options.body !== undefined) {
      body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      if (!Object.keys(headers).some((k) => k.toLowerCase() === "content-type")) {
        // FHIR PATCH is JSON Patch (RFC 6902) — every generated *Patch* function
        // sends a FhirPatchOperation[] body, which needs this content type, not
        // plain application/json (confirmed: SATU SEHAT rejects it with a 400
        // "invalid_headers" otherwise).
        headers["Content-Type"] =
          method.toUpperCase() === "PATCH" ? "application/json-patch+json" : "application/json";
      }
    }
    const result: HttpResult = await httpRequest({
      method,
      url: fullUrl,
      headers,
      body,
      fetchImpl: this.config.fetchImpl,
    });
    return result.body;
  }
}
