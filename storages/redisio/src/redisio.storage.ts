import { AsynchronousCacheType } from "@hokify/node-ts-cache";
import * as Redis from "ioredis";

export class RedisIOStorage implements AsynchronousCacheType {
  constructor(private redis: () => Redis.Redis) {}

  public async getItem<T>(key: string): Promise<T | undefined> {
    const entry: any = await this.redis().get(key);
    let finalItem = entry;
    try {
      finalItem = JSON.parse(entry);
    } catch (error) {}
    return finalItem || undefined;
  }

  public async setItem(key: string, content: any, options?: { ttl?: number }): Promise<void> {
    if (typeof content === "object") {
      content = JSON.stringify(content);
    } else if (content === undefined) {
      await this.redis().del(key);
      return;
    }
    if (options?.ttl) {
      await this.redis().setex(key, options.ttl, content);
    } else {
      await this.redis().set(key, content);
    }
  }

  public async clear(): Promise<void> {
    await this.redis().flushdb();
  }
}
