interface ICacheEntry {
	content: any;
	meta: any;
}

export interface IMultiIAsynchronousCacheType<C = ICacheEntry> {
	getItems<T>(keys: string[]): Promise<{ [key: string]: T | undefined }>;

	setItems(values: { key: string; content: C | undefined }[], options?: any): Promise<void>;

	clear(): Promise<void>;
}

export interface IMultiSynchronousCacheType<C = ICacheEntry> {
	getItems<T>(keys: string[]): { [key: string]: T | undefined };

	setItems(values: { key: string; content: C | undefined }[], options?: any): void;

	clear(): void;
}

export interface IAsynchronousCacheType<C = ICacheEntry> {
	getItem<T>(key: string): Promise<T | undefined>;

	setItem(key: string, content: C | undefined, options?: any): Promise<void>;

	clear(): Promise<void>;
}

export interface ISynchronousCacheType<C = ICacheEntry> {
	getItem<T>(key: string): T | undefined;

	setItem(key: string, content: C | undefined, options?: any): void;

	clear(): void;
}
