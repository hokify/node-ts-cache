export {
  SynchronousCacheType,
  AsynchronousCacheType,
  MultiAsynchronousCacheType,
  MultiSynchronousCacheType,
} from "./types/cache.types";
export { ExpirationStrategy } from "./strategy/caching/expiration.strategy";
export { ISyncKeyStrategy } from "./types/key.strategy.types";
export { Cache } from "./decorator/cache.decorator";
export { SyncCache } from "./decorator/synccache.decorator";
export { MultiCache } from "./decorator/multicache.decorator";

export { FsJsonStorage } from "./storage/fs";
export { MemoryStorage } from "./storage/memory";
