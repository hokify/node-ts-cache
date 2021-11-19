import type { IMultiSynchronousCacheType, ISynchronousCacheType } from '@hokify/node-ts-cache';

import LRU from 'lru-cache';

export class LRUStorage implements ISynchronousCacheType, IMultiSynchronousCacheType {
	myCache: LRU<string, any>;

	constructor(/** maxAge in seconds! */ private options: LRU.Options<string, any>) {
		this.myCache = new LRU({
			...options,
			maxAge: options.maxAge ? options.maxAge * 1000 : undefined
		});
	}

	getItems<T>(keys: string[]): { [key: string]: T | undefined } {
		return Object.fromEntries(keys.map(key => [key, this.myCache.get(key)]));
	}

	setItems(values: { key: string; content: any }[]): void {
		values.forEach(val => {
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
		this.myCache = new LRU({
			...this.options,
			maxAge: this.options.maxAge ? this.options.maxAge * 1000 : undefined // in ms
		});
	}
}
