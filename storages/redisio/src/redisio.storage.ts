import {
  AsynchronousCacheType,
  MultiAsynchronousCacheType,
} from "@hokify/node-ts-cache";
import * as Redis from "ioredis";
import * as snappy from "snappy";

export class RedisIOStorage
  implements AsynchronousCacheType, MultiAsynchronousCacheType {
  constructor(
    private redis: () => Redis.Redis,
    private options: {
      maxAge: number;
      compress?: boolean;
    } = { maxAge: 86400 }
  ) {}

  private errorHandler: ((error: Error) => void) | undefined;

  onError(listener: (error: Error) => void) {
    this.errorHandler = listener;
  }

  async getItems<T>(keys: string[]): Promise<{ [key: string]: T | undefined }> {
      const mget = this.options.compress ? await (this.redis() as any).mgetBuffer(...keys) : await this.redis().mget(...keys);
    const res = Object.fromEntries(
      await Promise.all(mget.map(async (entry: Buffer | string, i: number) => {
        if (entry === null) {
          return [keys[i], undefined]; // value does not exist yet
        }

        if (entry === "") {
          return [keys[i], null as any]; // value does exist, but is empty
        }

        let finalItem: string = entry && this.options.compress
            ? await new Promise((resolve, reject) =>
                snappy.uncompress(entry as any, {}, (err, uncompressed) =>
                    err ? reject(err) : resolve(uncompressed as any)
                )
            )
            : entry as string;

        try {
          finalItem = finalItem && JSON.parse(finalItem);
        } catch (error) {}

        return [keys[i], finalItem];
      }))
    );
    return res;
  }

  async setItems(
    values: { key: string; content: any }[],
    options?: { ttl?: number }
  ): Promise<void> {
    const redisPipeline = this.redis().pipeline();
    await Promise.all(
      values.map(async (val) => {
        if (val.content === undefined) return;

        let content: string | Buffer = JSON.stringify(val.content);

        if (this.options.compress) {
          content = await new Promise((resolve, reject) =>
            snappy.compress(content, (err, compressed) =>
              err ? reject(err) : resolve(compressed)
            )
          );
        }

        const ttl = options?.ttl ?? this.options.maxAge;
        if (ttl) {
          redisPipeline.setex(val.key, ttl, content);
        } else {
          redisPipeline.set(val.key, content);
        }
      })
    );
    const savePromise = redisPipeline.exec();

    if (this.errorHandler) {
      // if we have an error handler, we do not need to await the result
      savePromise.catch((err) => this.errorHandler && this.errorHandler(err));
    } else {
      await savePromise;
    }
  }

  public async getItem<T>(key: string): Promise<T | undefined> {
    const entry: any = this.options.compress ? await this.redis().getBuffer(key) : await this.redis().get(key);
    if (entry === null) {
      return undefined;
    }
    if (entry === "") {
      return null as any;
    }
    let finalItem: T | undefined = this.options.compress
      ? await new Promise((resolve, reject) =>
          snappy.uncompress(entry, {}, (err, uncompressed) =>
            err ? reject(err) : resolve(uncompressed?.toString() as any)
          )
        )
      : entry;

    try {
      finalItem = JSON.parse(finalItem as any);
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

    if (this.options.compress) {
      content = await new Promise((resolve, reject) =>
        snappy.compress(content, (err, compressed) =>
          err ? reject(err) : resolve(compressed)
        )
      );
    }

    const ttl = options?.ttl ?? this.options.maxAge;
    let savePromise: Promise<any>;
    if (ttl) {
      savePromise = this.redis().setex(key, ttl, content);
    } else {
      savePromise = this.redis().set(key, content);
    }
    if (this.errorHandler) {
      // if we have an error handler, we do not need to await the result
      savePromise.catch((err) => this.errorHandler && this.errorHandler(err));
    } else {
      await savePromise;
    }
  }

  public async clear(): Promise<void> {
    await this.redis().flushdb();
  }
}
