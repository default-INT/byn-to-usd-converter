export type DomChangeHandler = (roots: readonly Node[]) => void;

/**
 * Watches the document for SPA-style DOM mutations and notifies the caller.
 */
export function createDomObserver(
  root: ParentNode,
  onChange: DomChangeHandler,
  options?: MutationObserverInit,
): () => void {
  const observer = new MutationObserver((mutations) => {
    const roots: Node[] = [];
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => roots.push(node));
      } else if (mutation.type === "characterData" && mutation.target.parentNode) {
        roots.push(mutation.target.parentNode);
      }
    }
    if (roots.length > 0) onChange(roots);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    ...options,
  });

  return () => observer.disconnect();
}
