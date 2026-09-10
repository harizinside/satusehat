import type { SatuSehatClient } from "../core/client.js";

export interface AccessTokenResult {
  accessToken: string;
  /** Seconds until expiry as reported by the server (null when absent) */
  expiresInSeconds: number | null;
  tokenType: string | null;
  /** Absolute epoch-ms expiry, computed from `expiresInSeconds` (null when absent) */
  expiresAt: number | null;
  /** Raw OAuth2 response (may contain extra fields such as `scope`) */
  raw: Record<string, unknown>;
}

export interface CredentialsOverride {
  clientId?: string;
  clientSecret?: string;
}

function formEncode(entries: Record<string, string>): string {
  return new URLSearchParams(entries).toString();
}

/**
 * Mint a fresh OAuth2 client-credentials access token.
 *
 *   POST {authBaseUrl}/accesstoken?grant_type=client_credentials
 *   Content-Type: application/x-www-form-urlencoded
 *   client_id=...&client_secret=...
 *
 * The SDK deliberately does NOT cache or auto-refresh: store the returned token
 * wherever your app already keeps state (Redis, DB, memory) and pass it back
 * via the client's `token` / `setToken()` on every call.
 */
export async function getAccessToken(
  client: SatuSehatClient,
  credentials: CredentialsOverride = {},
): Promise<AccessTokenResult> {
  const clientId = credentials.clientId ?? client.config.clientId;
  const clientSecret = credentials.clientSecret ?? client.config.clientSecret;
  if (!clientId || !clientSecret) {
    throw new Error(
      "getAccessToken requires clientId/clientSecret — pass them to the client config or as the `credentials` argument",
    );
  }
  const url = `${client.config.authBaseUrl.replace(/\/$/, "")}/accesstoken?grant_type=client_credentials`;
  const raw = (await client.requestUrl("POST", url, {
    auth: false,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formEncode({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })) as { access_token?: string; expires_in?: number | string; token_type?: string } & Record<
    string,
    unknown
  >;
  if (!raw?.access_token) {
    throw new Error(`SATU SEHAT token response did not contain access_token: ${JSON.stringify(raw)}`);
  }
  const expiresInSeconds =
    raw.expires_in === undefined || raw.expires_in === null ? null : Number(raw.expires_in);
  return {
    accessToken: raw.access_token,
    expiresInSeconds: Number.isFinite(expiresInSeconds) ? (expiresInSeconds as number) : null,
    tokenType: raw.token_type ?? null,
    expiresAt:
      expiresInSeconds && Number.isFinite(expiresInSeconds)
        ? Date.now() + (expiresInSeconds as number) * 1000
        : null,
    raw,
  };
}

/** Convenience: mint a token and immediately install it on the client. */
export async function authenticate(
  client: SatuSehatClient,
  credentials: CredentialsOverride = {},
): Promise<AccessTokenResult> {
  const result = await getAccessToken(client, credentials);
  client.setToken(result.accessToken);
  return result;
}
