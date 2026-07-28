import type { RateResult } from "@byn/core";

export type ScanFn = (root: ParentNode, rate: RateResult) => void;

function asElement(node: Node): Element | null {
  if (node instanceof Element) return node;
  return node.parentElement;
}

/** True if the node is inside (or is) a Yandex Maps `ymaps` element. */
export function isYmapsRelated(node: Node): boolean {
  const el = asElement(node);
  if (!el) return false;
  return el.tagName === "YMAPS" || Boolean(el.closest("ymaps"));
}

/**
 * Outermost map host: parent of the top-level `ymaps` chain.
 * Falls back to `document.body`.
 */
export function resolveMapScanRoot(from: Node): ParentNode {
  const el = asElement(from);
  if (!el) return document.body;

  let outermost: Element | null = el.closest("ymaps");
  if (!outermost) return document.body;

  let parentYmaps = outermost.parentElement?.closest("ymaps") ?? null;
  while (parentYmaps) {
    outermost = parentYmaps;
    parentYmaps = outermost.parentElement?.closest("ymaps") ?? null;
  }

  return outermost.parentElement ?? outermost;
}

export interface ScanScheduler {
  /** Batch DOM mutation roots; flushes after debounce. */
  notify(roots: readonly Node[]): void;
  /** Immediate full-document scan (e.g. rate update). */
  scanAll(): void;
  dispose(): void;
}

/**
 * Debounced scan scheduler with YMaps follow-ups:
 * - normal mutations → debounce, scan each scope;
 * - ymaps mutations → debounce, scan map container + follow-ups at 100/300ms.
 */
export function createScanScheduler(options: {
  getRate: () => RateResult | null;
  scan: ScanFn;
  debounceMs?: number;
  mapFollowUpMs?: readonly number[];
}): ScanScheduler {
  const debounceMs = options.debounceMs ?? 80;
  const mapFollowUpMs = options.mapFollowUpMs ?? [100, 300];

  const pendingScopes = new Set<ParentNode>();
  const pendingMapRoots = new Set<ParentNode>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const followUpTimers = new Set<ReturnType<typeof setTimeout>>();

  const runScan = (root: ParentNode) => {
    const rate = options.getRate();
    if (!rate) return;
    options.scan(root, rate);
  };

  const clearFollowUps = () => {
    for (const id of followUpTimers) clearTimeout(id);
    followUpTimers.clear();
  };

  const scheduleMapFollowUps = () => {
    clearFollowUps();
    for (const ms of mapFollowUpMs) {
      const id = setTimeout(() => {
        followUpTimers.delete(id);
        // Full body: placemarks may remount under a new host after zoom.
        runScan(document.body);
      }, ms);
      followUpTimers.add(id);
    }
  };

  const flush = () => {
    debounceTimer = null;
    const rate = options.getRate();
    if (!rate) {
      pendingScopes.clear();
      pendingMapRoots.clear();
      return;
    }

    for (const scope of pendingScopes) {
      runScan(scope);
    }

    if (pendingMapRoots.size > 0) {
      for (const mapRoot of pendingMapRoots) {
        runScan(mapRoot);
      }
      scheduleMapFollowUps();
    }

    pendingScopes.clear();
    pendingMapRoots.clear();
  };

  return {
    notify(roots) {
      for (const root of roots) {
        if (isYmapsRelated(root)) {
          pendingMapRoots.add(resolveMapScanRoot(root));
          continue;
        }

        const scope =
          root instanceof Element || root instanceof Document
            ? root
            : root.parentElement;
        if (scope) pendingScopes.add(scope);
      }

      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flush, debounceMs);
    },

    scanAll() {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      pendingScopes.clear();
      pendingMapRoots.clear();
      clearFollowUps();
      runScan(document.body);
    },

    dispose() {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = null;
      pendingScopes.clear();
      pendingMapRoots.clear();
      clearFollowUps();
    },
  };
}
