import { JSONStringifyKeyStrategy } from '../strategy/key/json.stringify.strategy.js';
import { IAsyncKeyStrategy } from '../types/key.strategy.types.js';
import { IAsynchronousCacheType, ISynchronousCacheType } from '../types/cache.types.js';

const defaultKeyStrategy = new JSONStringifyKeyStrategy();

export function Cache(
	cachingStrategy: IAsynchronousCacheType | ISynchronousCacheType,
	options?: any,
	keyStrategy: IAsyncKeyStrategy = defaultKeyStrategy
) {
	return function (
		// eslint-disable-next-line @typescript-eslint/ban-types
		target: Object & {
			__cache_decarator_pending_results?: {
				[key: string]: Promise<any> | undefined;
			};
		},
		methodName: string,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;
		const className = target.constructor.name;

		descriptor.value = async function (...args: any[]) {
			const cacheKey = await keyStrategy.getKey(className, methodName, args);

			const runMethod = async () => {
				const methodCall = originalMethod.apply(this, args);

				let methodResult;

				const isAsync =
					methodCall?.constructor?.name === 'AsyncFunction' ||
					methodCall?.constructor?.name === 'Promise';
				if (isAsync) {
					methodResult = await methodCall;
				} else {
					methodResult = methodCall;
				}
				return methodResult;
			};

			if (!cacheKey || process.env.DISABLE_CACHE_DECORATOR) {
				// do not cache this function, execute function
				return runMethod();
			}

			if (!target.__cache_decarator_pending_results) {
				target.__cache_decarator_pending_results = {};
			}

			if (!target.__cache_decarator_pending_results[cacheKey]) {
				target.__cache_decarator_pending_results[cacheKey] = (async () => {
					try {
						try {
							const entry = await (cachingStrategy.getItem as any)(cacheKey);
							if (entry !== undefined) {
								return entry;
							}
						} catch (err) {
							console.warn('@hokify/node-ts-cache: reading cache failed', cacheKey, err);
						}

						const methodResult = await runMethod();

						try {
							await cachingStrategy.setItem(cacheKey, methodResult, options);
						} catch (err) {
							console.warn('@hokify/node-ts-cache: writing result to cache failed', cacheKey, err);
						}
						return methodResult;
					} finally {
						// reset pending result object
						target.__cache_decarator_pending_results![cacheKey] = undefined;
					}
				})();
			}

			return target.__cache_decarator_pending_results[cacheKey];
		};

		return descriptor;
	};
}
