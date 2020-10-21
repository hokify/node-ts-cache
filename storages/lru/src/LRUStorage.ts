import {
  MultiSynchronousCacheType,
  SynchronousCacheType,
} from "@hokify/node-ts-cache";

import * as LRU from "lru-cache";

export class LRUStorage
  implements SynchronousCacheType, MultiSynchronousCacheType {
  myCache: LRU<string, any>;

  constructor(private options: LRU.Options<string, any>) {
    this.myCache = new LRU(options);
  }

  getItems<T>(keys: string[]): { [key: string]: T | undefined } {
    return Object.fromEntries(keys.map((key) => [key, this.myCache.get(key)]));
  }

  setItems(values: { key: string; content: any }[]): void {
    values.forEach((val) => {
      this.myCache.set(val.key, val.content);
    });
  }

  public getItem<T>(key: string): T | undefined {
    return this.myCache.get(key) || undefined;
  }

  public setItem(key: string, content: any): void {
    this.myCache.set(key, content);
  }

  public clear(): void {
    // flush not supported, recreate lru cache instance
    this.myCache = new LRU(this.options);
  }
}
