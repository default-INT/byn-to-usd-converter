/**
 * Optional site-specific adapters (e.g. onliner.by, kufar.by).
 * Place adapter modules here when a generic text scan is not enough.
 */

export interface SiteAdapter {
  readonly hostPattern: RegExp;
  scan(root: ParentNode): void;
}

export const siteAdapters: SiteAdapter[] = [];
