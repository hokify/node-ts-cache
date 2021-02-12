import { ISynchronousCacheType } from '../../types/cache.types';

export class MemoryStorage implements ISynchronousCacheType {
	private memCache: any = {};

	public getItem<T>(key: string): T | undefined {
		return this.memCache[key];
	}

	public setItem(key: string, content: any): void {
		this.memCache[key] = content;
	}

	public clear(): void {
		this.memCache = {};
	}
}
