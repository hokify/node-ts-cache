interface ICacheEntry {
  content: any;
  meta: any;
}

export interface MultiAsynchronousCacheType<C = ICacheEntry> {
  getItems<T>(keys: string[]): Promise<{ [key: string]: T | undefined }>;

  setItems(
    values: { key: string; content: C | undefined }[],
    options?: any
  ): Promise<void>;

  clear(): Promise<void>;
}

export interface MultiSynchronousCacheType<C = ICacheEntry> {
  getItems<T>(keys: string[]): { [key: string]: T | undefined };

  setItems(
    values: { key: string; content: C | undefined }[],
    options?: any
  ): void;

  clear(): void;
}

export interface AsynchronousCacheType<C = ICacheEntry> {
  getItem<T>(key: string): Promise<T | undefined>;

  setItem(key: string, content: C | undefined, options?: any): Promise<void>;

  clear(): Promise<void>;
}

export interface SynchronousCacheType<C = ICacheEntry> {
  getItem<T>(key: string): T | undefined;

  setItem(key: string, content: C | undefined, options?: any): void;

  clear(): void;
}
