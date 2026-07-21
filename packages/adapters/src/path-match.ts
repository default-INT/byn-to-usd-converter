/**
 * Match `location.pathname` against `pathMatch` patterns.
 * - omitted / empty / includes `*` → all paths
 * - `/list` → `/list` or `/list/...`
 * - patterns with `*` → simple glob (`*` → `.*`)
 */
export function matchesPath(pathname: string, pathMatch?: string[]): boolean {
  if (!pathMatch || pathMatch.length === 0 || pathMatch.includes("*")) {
    return true;
  }

  return pathMatch.some((pattern) => matchPathPattern(pathname, pattern));
}

function matchPathPattern(pathname: string, pattern: string): boolean {
  if (pattern === "*") return true;

  if (!pattern.includes("*")) {
    return pathname === pattern || pathname.startsWith(`${pattern}/`);
  }

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(pathname);
}

export function getPathname(): string {
  if (typeof location === "undefined") return "/";
  return location.pathname;
}
