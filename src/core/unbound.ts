const UNBOUND = new WeakSet<object>();

/**
 * Mark module exports that don't take a `SatuSehatClient` first, so
 * `bindModule` attaches them to the client namespace unchanged instead of
 * prepending `client` to their arguments.
 */
export function markUnbound(...fns: object[]): void {
  for (const fn of fns) UNBOUND.add(fn);
}

export function isUnbound(fn: object): boolean {
  return UNBOUND.has(fn);
}
