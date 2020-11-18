import {AsynchronousCacheType} from "@hokify/node-ts-cache";

import * as LRU from "lru-cache";
import * as Redis from "ioredis";

export class LRUWithRedisStorage implements AsynchronousCacheType {
  private myCache: LRU<string, any>;
  /** maxAge and ttl in seconds! */
  private options:  LRU.Options<string, any>;

  constructor(
    options: LRU.Options<string, any>,
    private redis: () => Redis.Redis
  ) {
    this.options = {
      max: 500,
      maxAge: 86400,
      ...options
    }
    this.myCache = new LRU({
      ...this.options,
      maxAge: (this.options.maxAge || 86400) * 1000 // in ms
    });
  }

  public async getItem<T>(key: string): Promise<T | undefined> {
    // check local cache
    let localCache = this.myCache.get(key);

    if (localCache === undefined) {
      // check central cache
      localCache = await this.redis().get(key);

      if (localCache !== undefined) {
        try {
          localCache = JSON.parse(localCache);
        } catch (err) {
          console.error('lru redis cache failed parsing data', err);
          localCache = undefined;
        }
        // if found on central cache, copy it to a local cache
        this.myCache.set(key, localCache);
      }
    }

    return localCache ?? undefined;
  }

  /** ttl in seconds! */
  public async setItem(key: string, content: any, options?: { ttl?: number }): Promise<void> {
    this.myCache.set(key, content);
    if (this.options?.maxAge) {
      await this.redis().setex(key, options?.ttl || this.options.maxAge, JSON.stringify(content));
    } else {
      await this.redis().set(key, JSON.stringify(content));
    }
  }

  public async clear(): Promise<void> {
    // flush not supported, recreate local lru cache instance
    this.myCache = new LRU({
      ...this.options,
      maxAge: (this.options.maxAge || 86400) * 1000 // in ms
    });
  }
}
