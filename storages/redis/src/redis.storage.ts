import { IAsynchronousCacheType } from '@hokify/node-ts-cache';

import Bluebird from 'bluebird';
import * as Redis from 'redis';
import { ClientOpts } from 'redis';
import { IRedisClient } from './custom';

Bluebird.promisifyAll(Redis.RedisClient.prototype);
Bluebird.promisifyAll(Redis.Multi.prototype);

export class RedisStorage implements IAsynchronousCacheType {
	private client: IRedisClient;

	constructor(private redisOptions: ClientOpts, redis = Redis) {
		this.client = redis.createClient(this.redisOptions) as IRedisClient;
		console.log('this.client', this.client);
	}

	public async getItem<T>(key: string): Promise<T> {
		const entry: any = await this.client.getAsync(key);
		let finalItem = entry;
		try {
			finalItem = JSON.parse(entry);
		} catch (error) {
			/** ignore */
		}
		return finalItem || undefined;
	}

	public async setItem(key: string, content: any): Promise<void> {
		if (typeof content === 'object') {
			content = JSON.stringify(content);
		} else if (content === undefined) {
			return this.client.delAsync(key);
		}
		return this.client.setAsync(key, content);
	}

	public async clear(): Promise<void> {
		return this.client.flushdbAsync();
	}
}
