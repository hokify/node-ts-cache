import {
  AsynchronousCacheType,
  MultiAsynchronousCacheType,
} from "@hokify/node-ts-cache";
import * as Redis from "ioredis";

export class RedisIOStorage
  implements AsynchronousCacheType, MultiAsynchronousCacheType {
  constructor(
    private redis: () => Redis.Redis,
    private options: {
      maxAge?: number;
    } = { maxAge: 86400 }
  ) {}

  async getItems<T>(keys: string[]): Promise<{ [key: string]: T | undefined }> {
    return Object.fromEntries(
      (await this.redis().mget(keys)).map((result, i) => [
        keys[i],
        ((result && JSON.parse(result)) ?? undefined) as T | undefined,
      ])
    );
  }

  async setItems(
    values: { key: string; content: any }[],
    options?: { ttl?: number }
  ): Promise<void> {
    const redisPipeline = this.redis().pipeline();
    values.forEach((val) => {
      const ttl = options?.ttl ?? this.options?.maxAge;
      if (ttl) {
        redisPipeline.setex(val.key, ttl, val.content);
      } else {
        redisPipeline.set(val.key, val.content);
      }
    });
    await redisPipeline.exec();
  }

  public async getItem<T>(key: string): Promise<T | undefined> {
    const entry: any = await this.redis().get(key);
    let finalItem = entry;
    try {
      finalItem = JSON.parse(entry);
    } catch (error) {}
    return finalItem || undefined;
  }

  public async setItem(
    key: string,
    content: any,
    options?: { ttl?: number }
  ): Promise<void> {
    if (typeof content === "object") {
      content = JSON.stringify(content);
    } else if (content === undefined) {
      await this.redis().del(key);
      return;
    }
    const ttl = options?.ttl ?? this.options?.maxAge;
    if (ttl) {
      await this.redis().setex(key, ttl, content);
    } else {
      await this.redis().set(key, content);
    }
  }

  public async clear(): Promise<void> {
    await this.redis().flushdb();
  }
}
