import { IAsynchronousCacheType, IMultiIAsynchronousCacheType } from '@hokify/node-ts-cache';
import * as Redis from 'ioredis';
import * as snappy from 'snappy';

export class RedisIOStorage implements IAsynchronousCacheType, IMultiIAsynchronousCacheType {
  constructor(
    private redis: () => Redis.Redis,
    private options: {
      maxAge: number;
      compress?: boolean;
    } = { maxAge: 86400 }
  ) { }

  private errorHandler: ((error: Error) => void) | undefined;

  onError(listener: (error: Error) => void) {
    this.errorHandler = listener;
  }

  async getItems<T>(keys: string[]): Promise<{ [key: string]: T | undefined }> {
    const mget = this.options.compress
      ? await (this.redis() as any).mgetBuffer(...keys)
      : await this.redis().mget(...keys);
    const res = Object.fromEntries(
      await Promise.all(
        mget.map(async (entry: Buffer | string, i: number) => {
          if (entry === null) {
            return [keys[i], undefined]; // value does not exist yet
          }

          if (entry === '') {
            return [keys[i], null as any]; // value does exist, but is empty
          }

          let finalItem: string =
            entry && this.options.compress
              ? await this.uncompress(entry as Buffer)
              : (entry as string);

          try {
            finalItem = finalItem && JSON.parse(finalItem);
          } catch (error) {
            /** ignore */
          }

          return [keys[i], finalItem];
        })
      )
    );
    return res;
  }

  async compress(uncompressed: string): Promise<Buffer> {
    const result = await snappy.compress(uncompressed);
    return result;
  }

  async uncompress(compressed: Buffer): Promise<string> {
    const result = await snappy.uncompress(compressed, { asBuffer: false });

    return result.toString();
  }

  async setItems(
    values: { key: string; content: any }[],
    options?: { ttl?: number }
  ): Promise<void> {
    const redisPipeline = this.redis().pipeline();
    await Promise.all(
      values.map(async val => {
        if (val.content === undefined) return;

        let content: string | Buffer = JSON.stringify(val.content);

        if (this.options.compress) {
          content = await this.compress(content);
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
      savePromise.catch(err => this.errorHandler && this.errorHandler(err));
    } else {
      await savePromise;
    }
  }

  public async getItem<T>(key: string): Promise<T | undefined> {
    const entry = this.options.compress
      ? await this.redis().getBuffer(key)
      : await this.redis().get(key);
    if (entry === null) {
      return undefined;
    }
    if (entry === '') {
      return null as any;
    }
    let finalItem: string =
      entry && this.options.compress ? await this.uncompress(entry as Buffer) : (entry as string);

    try {
      finalItem = JSON.parse(finalItem);
    } catch (error) {
      /** ignore */
    }
    return finalItem as unknown as T;
  }

  public async setItem(key: string, content: unknown, options?: { ttl?: number }): Promise<void> {
    if (typeof content === 'object') {
      content = JSON.stringify(content);
    } else if (content === undefined) {
      await this.redis().del(key);
      return;
    }

    if (this.options.compress) {
      content = await this.compress(content as string);
    }

    const ttl = options?.ttl ?? this.options.maxAge;
    let savePromise: Promise<any>;
    if (ttl) {
      savePromise = this.redis().setex(key, ttl, content as Buffer | string);
    } else {
      savePromise = this.redis().set(key, content as Buffer | string);
    }
    if (this.errorHandler) {
      // if we have an error handler, we do not need to await the result
      savePromise.catch(err => this.errorHandler && this.errorHandler(err));
    } else {
      await savePromise;
    }
  }

  public async clear(): Promise<void> {
    await this.redis().flushdb();
  }
}
