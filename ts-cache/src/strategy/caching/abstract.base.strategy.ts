import { IAsynchronousCacheType, ISynchronousCacheType } from '../../types/cache.types.js';

export abstract class AbstractBaseStrategy implements IAsynchronousCacheType {
	constructor(protected storage: IAsynchronousCacheType | ISynchronousCacheType) {}

	public abstract getItem<T>(key: string): Promise<T | undefined>;

	public abstract setItem(key: string, content: any, options: any): Promise<void>;

	public abstract clear(): Promise<void>;
}
