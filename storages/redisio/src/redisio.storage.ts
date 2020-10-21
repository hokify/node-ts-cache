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
    const res = Object.fromEntries(
      (await this.redis().mget(...keys)).map((entry, i) => {
        if (entry === null) {
          return [keys[i], undefined]; // value does not exist yet
        }

        if (entry === '') {
          return [keys[i], null as any]; // value does exist, but is empty
        }

        let finalItem = entry;
        try {
          finalItem = entry && JSON.parse(entry);
        } catch (error) {}

        return [keys[i], finalItem];
      })
    );
    return res;
  }

  async setItems(
    values: { key: string; content: any }[],
    options?: { ttl?: number }
  ): Promise<void> {
    const redisPipeline = this.redis().pipeline();
    values.forEach((val) => {
      if (val.content === undefined) return;

      const ttl = options?.ttl ?? this.options?.maxAge;
      if (ttl) {
        redisPipeline.setex(val.key, ttl, JSON.stringify(val.content));
      } else {
        redisPipeline.set(val.key, JSON.stringify(val.content));
      }
    });
    await redisPipeline.exec();
  }

  public async getItem<T>(key: string): Promise<T | undefined> {
    const entry: any = await this.redis().get(key);
    if (entry === null) {
      return undefined;
    }
    if (entry === '') {
      return null as any;
    }
    let finalItem = entry;
    try {
      finalItem = JSON.parse(entry);
    } catch (error) {}
    return finalItem;
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
