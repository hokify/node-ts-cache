import { JSONStringifyKeyStrategy } from '../strategy/key/json.stringify.strategy.js';
import { ISyncKeyStrategy } from '../types/key.strategy.types.js';
import { ISynchronousCacheType } from '../types/cache.types.js';

const defaultKeyStrategy = new JSONStringifyKeyStrategy();

export function SyncCache(
	cachingStrategy: ISynchronousCacheType,
	options?: any,
	keyStrategy: ISyncKeyStrategy = defaultKeyStrategy
) {
	// eslint-disable-next-line @typescript-eslint/ban-types
	return function (target: Object, methodName: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		const className = target.constructor.name;

		descriptor.value = function (...args: any[]) {
			const runMethod = () => {
				const methodResult = originalMethod.apply(this, args);

				const isAsync =
					methodResult?.constructor?.name === 'AsyncFunction' ||
					methodResult?.constructor?.name === 'Promise';

				if (isAsync) {
					throw new Error('async function detected, use @Cache instead');
				}

				return methodResult;
			};

			const cacheKey = keyStrategy.getKey(className, methodName, args);

			if (!cacheKey) {
				return runMethod();
			}

			try {
				const entry = cachingStrategy.getItem(cacheKey);
				if (entry !== undefined) {
					return entry;
				}
			} catch (err) {
				console.warn('@hokify/node-ts-cache: reading cache failed', cacheKey, err);
			}
			const methodResult = runMethod();

			try {
				cachingStrategy.setItem(cacheKey, methodResult, options);
			} catch (err) {
				console.warn('@hokify/node-ts-cache: writing result to cache failed', cacheKey, err);
			}
			return methodResult;
		};

		return descriptor;
	};
}
