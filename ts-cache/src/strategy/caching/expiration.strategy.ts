import { AbstractBaseStrategy } from './abstract.base.strategy.js';

interface IExpiringCacheItem {
	content: any;
	meta: {
		createdAt: number;
		ttl: number;
	};
}

interface IOptions {
	ttl: number;
	isLazy: boolean;
	isCachedForever: boolean;
}

export class ExpirationStrategy extends AbstractBaseStrategy {
	public async getItem<T>(key: string): Promise<T | undefined> {
		const item: IExpiringCacheItem | undefined = await (this.storage.getItem as any)(key); // <IExpiringCacheItem>
		if (item && item.meta && item.meta.ttl && this.isItemExpired(item)) {
			await this.storage.setItem(key, undefined);
			return undefined;
		}
		return item ? item.content : undefined;
	}

	public async setItem(key: string, content: any, options: Partial<IOptions>): Promise<void> {
		const mergedOptions: IOptions = {
			ttl: 60,
			isLazy: true,
			isCachedForever: false,
			...options
		};

		const meta = !mergedOptions.isCachedForever && {
			ttl: mergedOptions.ttl * 1000,
			createdAt: Date.now()
		};

		if (meta && !mergedOptions.isLazy) {
			setTimeout(() => {
				this.unsetKey(key);
			}, meta.ttl);
		}
		await this.storage.setItem(key, { meta, content });
	}

	public async clear(): Promise<void> {
		await this.storage.clear();
	}

	private isItemExpired(item: IExpiringCacheItem): boolean {
		return Date.now() > item.meta.createdAt + item.meta.ttl;
	}

	private async unsetKey(key: string): Promise<void> {
		await this.storage.setItem(key, undefined);
	}
}
