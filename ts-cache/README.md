[![npm](https://img.shields.io/npm/v/@hokify/node-ts-cache.svg)](https://www.npmjs.org/package/@hokify/node-ts-cache)
[![The MIT License](https://img.shields.io/npm/l/@hokify/node-ts-cache.svg)](http://opensource.org/licenses/MIT)

[![NPM](https://nodei.co/npm/@hokify/node-ts-cache.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@hokify/node-ts-cache/)

# @hokify/node-ts-cache

Simple and extensible caching module supporting decorators

<!-- TOC depthTo:2 -->

- [Install](#install)
- [Usage](#usage)
  - [With decorator](#with-decorator)
  - [Directly](#directly)
- [Strategies](#strategies)
  - [ExpirationStrategy](#expirationstrategy)
- [Storages](#storages)
- [Test](#test)

<!-- /TOC -->

# Install

```bash
npm install --save @ħokify/node-ts-cache
```

# Usage

## With decorator

Caches function response using the given options. Works with different strategies and storages. Uses all arguments to build an unique key.

`@Cache(strategy, options)`

Standard method to cache an async method.

- `strategy`: A supported caching [Strategy](#strategies) (Async)
- `options`: Options passed to the strategy for this particular method

_Note: @Cache always converts the method response to a promise because caching might be async._

E.g.

```ts
import { Cache, ExpirationStrategy, MemoryStorage } from "@hokify/node-ts-cache";

const myStrategy = new ExpirationStrategy(new MemoryStorage());

class MyService {
  @Cache(myStrategy, { ttl: 60 })
  public async getUsers(): Promise<string[]> {
    return ["Max", "User"];
  }
}
```

`@SyncCache(strategy, options)`
Method to use only sync caches. This allows you to use caching without a promise function.
 
- `strategy`: A supported caching [Strategy](#strategies) (Sync)
- `options`: Options passed to the strategy for this particular method

E.g.

```ts
import { SyncCache, ExpirationStrategy, MemoryStorage } from "@hokify/node-ts-cache";

const myStrategy = new ExpirationStrategy(new MemoryStorage());

class MyService {
  @SyncCache(myStrategy, { ttl: 60 })
  public getUsers(): string[] {
    return ["Max", "User"];
  }
}
```

`@MultiCache(strategy, parameterIndex, cacheKey, options)`
This method uses multi get and multi set of the cache providers if supported and therefore can use
different input paramters and still cache each variation.

- `strategies`: A list of caching [Strategy](#strategies), which is handled by provided order
- `parameterIndex`: The parameter index of the array
- `cacheKey`: a custom cache key function for each element of the cache
- `options`: Options passed to the strategy for this particular method

E.g.
```ts
import { MultiCache } from "@hokify/node-ts-cache";
import NodeCacheStorage from '@hokify/node-ts-cache-node-cache-storage'; 
import RedisIOStorage from '@hokify/node-ts-cache-redisio-storage';

const localStrategy = new NodeCacheStorage();
const centralStrategy = new RedisIOStorage({/*..*/});

class MyService {
  @MultiCache([localStrategy, centralStrategy], 0)
  public getUserNames(userIds: string[]): Promise<string>[] {
    return getUserNamesFromDatabase(userIds); // beware: return same order and number of userIds -> name
        // e.g. 1,2,3 .. shoudl return [userName1, userName2, userName3] (or null for entries that do not exist)
        // if you return undefined (instead of null) for one entry, it is queried the next time again. 
  }
}

const a = new MyService();
/**
* this call checks local cache if it has user id1, 2 or 3..
* all cache misses are then checked by the central cache
* if there are still some missing entries, they are retrieved with the original getUsers method.
*/
const result = await a.getUsers([1,2,3]);

```


Cache decorator generates cache key according to class name, class method and args (with JSON.stringify).
If you want another key creation logic you can bypass key creation strategy to the Cache decorator.

```ts
import {
  Cache,
  ExpirationStrategy,
  ISyncKeyStrategy,
  MemoryStorage
} from "@hokify/node-ts-cache";

class MyKeyStrategy implements ISyncKeyStrategy {
  public getKey(
    className: string,
    methodName: string,
    args: any[]
  ): Promise<string> | string {
    // Here you can implement your own way of creating cache keys
    return `foo bar baz`;
  }
}

const myStrategy = new ExpirationStrategy(new MemoryStorage());
const myKeyStrategy = new MyKeyStrategy();

class MyService {
  @Cache(myStrategy, { ttl: 60 }, myKeyStrategy)
  public async getUsers(): Promise<string[]> {
    return ["Max", "User"];
  }
}
```

## Directly

```ts
import { ExpirationStrategy, MemoryStorage } from "@hokify/node-ts-cache";

const myCache = new ExpirationStrategy(new MemoryStorage());

class MyService {
  public async getUsers(): Promise<string[]> {
    const cachedUsers = await myCache.getItem<string[]>("users");
    if (cachedUsers) {
      return cachedUsers;
    }

    const newUsers = ["Max", "User"];
    await myCache.setItem("users", newUsers, { ttl: 60 });

    return newUsers;
  }
}
```

# Strategies

## ExpirationStrategy

Cached items expire after a given amount of time.

- `ttl`: _(Default: 60)_ Number of seconds to expire the cachte item
- `isLazy`: _(Default: true)_ If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given _ttl_.
- `isCachedForever`: _(Default: false)_ If true, cache entry has no expiration.

# Storages

| Storage          |                 Needed library                 |
| ---------------- | :--------------------------------------------: |
| FsStorage        |                   (bundled)                    |
| MemoryStorage    |                   (bundled)                    |
| RedisStorage     |   `npm install @hokify/node-ts-cache-redis-storage`    |
| RedisIOStorage   |  `npm install @hokify/node-ts-cache-redisio-storage`   |
| NodeCacheStorage | `npm install @hokify/node-ts-cache-node-cache-storage` |
| LRUStorage       |       `npm install node-ts-lru-storage`        |

#### MemoryStorage()

in memory

```
import { Cache, ExpirationStrategy, MemoryStorage } from "@hokify/node-ts-cache";

const myStrategy = new ExpirationStrategy(new MemoryStorage());
```

#### FsJsonStorage(`fileName: string`)

file based

```
import { Cache, ExpirationStrategy, FileStorage } from "@hokify/node-ts-cache";

const myStrategy = new ExpirationStrategy(new FileStorage());
```

#### RedisStorage(`clientOpts:` [RedisClientOptions](https://github.com/NodeRedis/node_redis#options-object-properties))

redis client backend

```
import { Cache, ExpirationStrategy } from "@hokify/node-ts-cache";
import RedisStorage from 'node-ts-cache-redis-storage';

const myStrategy = new ExpirationStrategy(new RedisStorage());
```

#### RedisIOStorage(`clientOpts:` [RedisIOClientOptions](https://github.com/NodeRedis/node_redis#options-object-properties))

redis io client backend

```
import { Cache, ExpirationStrategy } from "@hokify/node-ts-cache";
import RedisIOStorage from 'node-ts-cache-redisio-storage';

const myStrategy = new RedisIOStorage();
```

#### NodeCacheStorage(`options:` [NodeCacheOptions](https://www.npmjs.com/package/node-cache#options))

wrapper for [node-cache](https://www.npmjs.com/package/node-cache)

```
import { Cache, ExpirationStrategy } from "@hokify/node-ts-cache";
import NodeCacheStorage from 'node-ts-cache-node-cache-storage';

const myStrategy = new NodeCacheStorage();
```

#### LRUStorage(`options:` [LRUCacheOptions](https://www.npmjs.com/package/lru-cache#options))

wrapper for [lru-cache](https://www.npmjs.com/package/lru-cache)

```
import { Cache, ExpirationStrategy } from "@hokify/node-ts-cache";
import LRUStorage from 'node-ts-cache-lru-storage';

const myStrategy = new LRUStorage();
```


#### LRURedisStorage(`options:` [LRUCacheOptions](https://www.npmjs.com/package/lru-cache#options), () => Redis.Redis)

wrapper for [lru-cache](https://www.npmjs.com/package/lru-cache) with a remote cache redis backend

```
import { Cache, ExpirationStrategy } from "@hokify/node-ts-cache";
import LRUStorage from 'node-ts-cache-lru-redis-storage';

const myStrategy = new LRUStorage({}, () => RedisConnectionInstance);
```

# Test

```bash
npm test
```
