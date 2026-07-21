/**
 * Storage abstraction so `@byn/core` stays free of chrome.storage.
 * The extension layer provides a chrome.storage-backed implementation.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
