# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@6.0.0...@hokify/node-ts-cache@6.0.1) (2024-04-18)

### Bug Fixes

- update versions§ ([6caf1a5](https://github.com/hokify/node-ts-cache/commit/6caf1a525dc136ca902ead121ea04a484e8b8f75))

# [6.0.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.6.0...@hokify/node-ts-cache@6.0.0) (2021-11-19)

**Note:** Version bump only for package @hokify/node-ts-cache

# [5.6.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.5.1...@hokify/node-ts-cache@5.6.0) (2021-10-05)

**Note:** Version bump only for package @hokify/node-ts-cache

## [5.5.1](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.5.0...@hokify/node-ts-cache@5.5.1) (2021-02-12)

**Note:** Version bump only for package @hokify/node-ts-cache

# [5.5.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.4.1...@hokify/node-ts-cache@5.5.0) (2021-02-12)

### Features

- **redisio:** snappy compression ([21d8dc9](https://github.com/hokify/node-ts-cache/commit/21d8dc96fc5eb563d6a13e7d74925e8c0702038e))

## [5.4.1](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.4.0...@hokify/node-ts-cache@5.4.1) (2020-11-09)

### Bug Fixes

- **multicache:** handle get key undefined ([b0ded49](https://github.com/hokify/node-ts-cache/commit/b0ded498ad988a44ff62566909403268e4b6b288))

# [5.4.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.3.2...@hokify/node-ts-cache@5.4.0) (2020-11-09)

### Features

- pass in current phase (read or write) to multicache get key method ([5726a10](https://github.com/hokify/node-ts-cache/commit/5726a10da141db71d49ce3b8c5963b261e0ef961))

## [5.3.2](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.3.1...@hokify/node-ts-cache@5.3.2) (2020-10-21)

### Bug Fixes

- **multicache:** fix async storages and do not save redisio undefined ([79e1e95](https://github.com/hokify/node-ts-cache/commit/79e1e957a08359c262cdddd07e1181e70890399e))

## [5.3.1](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.3.0...@hokify/node-ts-cache@5.3.1) (2020-10-21)

### Bug Fixes

- export multicache ([5e91b9c](https://github.com/hokify/node-ts-cache/commit/5e91b9c7c0a3e4f65c6a91fe4e62e8b646f0d509))

# [5.3.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.2.2...@hokify/node-ts-cache@5.3.0) (2020-10-21)

### Features

- **multicache:** allow caching multiple keys at once ([68315b3](https://github.com/hokify/node-ts-cache/commit/68315b3c73f65a62a60ffe5e21921bbd2ea471a6))

## [5.2.2](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.2.1...@hokify/node-ts-cache@5.2.2) (2020-10-21)

### Bug Fixes

- allow setting DISABLE_CACHE_DECORATOR for easier debugging ([f39a92c](https://github.com/hokify/node-ts-cache/commit/f39a92c8ab630a71cd09b81452c743d305705a09))

## [5.2.1](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.2.0...@hokify/node-ts-cache@5.2.1) (2020-09-22)

### Bug Fixes

- cache null and false values when it is the return value ([f86539a](https://github.com/hokify/node-ts-cache/commit/f86539a1608a68af3f46e8747de71f35a3ebf016))

# [5.2.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.7...@hokify/node-ts-cache@5.2.0) (2020-07-28)

### Features

- **cachekey:** allow undefined cache key to skip cache ([5550758](https://github.com/hokify/node-ts-cache/commit/555075821c6e581aebb41c76cb6b81fe56724f98))

## [5.1.7](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.6...@hokify/node-ts-cache@5.1.7) (2020-06-18)

**Note:** Version bump only for package @hokify/node-ts-cache

## [5.1.6](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.5...@hokify/node-ts-cache@5.1.6) (2020-06-10)

### Bug Fixes

- **expiration:** logic ttl fixes ([cbc3d89](https://github.com/hokify/node-ts-cache/commit/cbc3d8951076e7c0bcbf5fb2df65ec1b3cbd45af))

## [5.1.5](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.4...@hokify/node-ts-cache@5.1.5) (2020-06-10)

### Bug Fixes

- **expiration:** logic ttl fixes ([85c2337](https://github.com/hokify/node-ts-cache/commit/85c2337d850920b0f46eb30551f7beba11ef0af0))

## [5.1.4](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.3...@hokify/node-ts-cache@5.1.4) (2020-03-13)

### Bug Fixes

- **sync:** remove wrong async ([c253991](https://github.com/hokify/node-ts-cache/commit/c25399152c01643e146876b631848c2cafe45a95))

## [5.1.3](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.2...@hokify/node-ts-cache@5.1.3) (2020-03-12)

**Note:** Version bump only for package @hokify/node-ts-cache

## [5.1.2](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.1...@hokify/node-ts-cache@5.1.2) (2020-03-09)

**Note:** Version bump only for package @hokify/node-ts-cache

## [5.1.1](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.0...@hokify/node-ts-cache@5.1.1) (2020-03-09)

**Note:** Version bump only for package @hokify/node-ts-cache

# [5.1.0](https://github.com/hokify/node-ts-cache/compare/@hokify/node-ts-cache@5.1.0...@hokify/node-ts-cache@5.1.0) (2020-03-09)

**Note:** Version bump only for package @hokify/node-ts-cache

# 5.1.0 (2020-03-09)

### Bug Fixes

- **cache-decorator:** use temporary holder for pending promises to prevent race conditions and multiple parallel calls to a cached method ([6a818e2](https://github.com/hokify/node-ts-cache/commit/6a818e2acf5cd3bca9698268bfeb242334cd5eda))
- **exports:** add memory and fs storage exports ([e1cdd97](https://github.com/hokify/node-ts-cache/commit/e1cdd97e1238f1c0ee71b703d14086ce5158b4e0))
- **tests:** finish monorepo setup ([c4448ee](https://github.com/hokify/node-ts-cache/commit/c4448eebfc30c20681ba1546f2494f98a63e6193))
