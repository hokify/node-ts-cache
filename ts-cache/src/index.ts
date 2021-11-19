export {
	ISynchronousCacheType,
	IAsynchronousCacheType,
	IMultiIAsynchronousCacheType,
	IMultiSynchronousCacheType
} from './types/cache.types.js';
export { ExpirationStrategy } from './strategy/caching/expiration.strategy.js';
export { ISyncKeyStrategy } from './types/key.strategy.types.js';
export { Cache } from './decorator/cache.decorator.js';
export { SyncCache } from './decorator/synccache.decorator.js';
export { MultiCache } from './decorator/multicache.decorator.js';

export { FsJsonStorage } from './storage/fs/index.js';
export { MemoryStorage } from './storage/memory/index.js';
