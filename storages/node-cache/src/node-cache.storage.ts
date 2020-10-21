import { SynchronousCacheType, MultiSynchronousCacheType } from "@hokify/node-ts-cache";

import * as NodeCache from "node-cache";

export class NodeCacheStorage implements SynchronousCacheType, MultiSynchronousCacheType {
  myCache: NodeCache;

  constructor(options: NodeCache.Options) {
    this.myCache = new NodeCache(options);
  }

  getItems<T>(keys: string[]): { [key: string]: T  | undefined } {
    return this.myCache.mget(keys);
  }

  setItems(values: { key: string; content: any }[]): void {
    this.myCache.mset(values.map(v => ({key: v.key, val: v.content})));
  }

  public getItem<T>(key: string): T | undefined {
    return this.myCache.get(key) || undefined;
  }

  public setItem(key: string, content: any): void {
    this.myCache.set(key, content);
  }

  public clear(): void {
    this.myCache.flushAll();
  }
}
