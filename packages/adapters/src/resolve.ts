import { CommonAdapter } from "./common/index.js";
import { KufarAdapter } from "./kufar/index.js";
import { RealtAdapter } from "./realt/index.js";
import type { SiteAdapter } from "./types.js";

/**
 * Host-specific adapters (Kufar, Realt, Av, …).
 * CommonAdapter is the fallback when nothing matches.
 */
export const siteAdapters: SiteAdapter[] = [KufarAdapter, RealtAdapter];

export function resolveAdapter(hostname: string): SiteAdapter {
  const specific = siteAdapters.find((adapter) =>
    adapter.hostPattern?.test(hostname),
  );
  return specific ?? CommonAdapter;
}
