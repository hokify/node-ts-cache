import { IMultiIAsynchronousCacheType, IMultiSynchronousCacheType } from '../types/cache.types.js';

const defaultKeyStrategy = {
	getKey(
		className: string,
		methodName: string,
		parameter: any,
		args: any,
		_phase: 'read' | 'write'
	): string | undefined {
		return `${className}:${methodName}:${JSON.stringify(parameter)}:${JSON.stringify(args)}`;
	}
};

export function MultiCache(
	cachingStrategies: (IMultiIAsynchronousCacheType | IMultiSynchronousCacheType)[],
	parameterIndex = 0,
	keyStrategy = defaultKeyStrategy
) {
	return function (
		// eslint-disable-next-line @typescript-eslint/ban-types
		target: Object /* & {
      __cache_decarator_pending_results: {
        [key: string]: Promise<any> | undefined;
      };
    } */,
		methodName: string,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;
		const className = target.constructor.name;

		descriptor.value = async function (...args: any[]) {
			const runMethod = async (newSet: any[]) => {
				const newArgs = [...args];
				newArgs[parameterIndex] = newSet;

				const methodCall = originalMethod.apply(this, newArgs);

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

			const parameters = args[parameterIndex];
			const cacheKeys: (string | undefined)[] = parameters.map((parameter: any) => {
				return keyStrategy.getKey(className, methodName, parameter, args, 'read');
			});

			let result: any[] = [];
			if (!process.env.DISABLE_CACHE_DECORATOR) {
				let currentCachingStrategy = 0;
				do {
					// console.log('cacheKeys', cacheKeys, currentCachingStrategy)
					const foundEntries = await (cachingStrategies[currentCachingStrategy] as any).getItems(
						cacheKeys.filter(key => key !== undefined)
					);

					// console.log('foundEntries', foundEntries);

					// remove all found entries from cacheKeys
					Object.keys(foundEntries).forEach(entry => {
						if (foundEntries[entry] === undefined) return;
						// remove entry from cacheKey
						cacheKeys[cacheKeys.indexOf(entry)] = undefined;
					});
					// save back to strategies before this strategy
					if (currentCachingStrategy > 0) {
						const setCache = Object.keys(foundEntries)
							.map(key => ({
								key,
								content: foundEntries[key]
							}))
							.filter(f => f.content !== undefined);

						if (setCache.length > 0) {
							let saveCurrentCachingStrategy = currentCachingStrategy - 1;
							do {
								await cachingStrategies[saveCurrentCachingStrategy].setItems(setCache);

								saveCurrentCachingStrategy--;
							} while (saveCurrentCachingStrategy >= 0);
						}
					}

					// save to final result

					result = [...result, ...Object.values(foundEntries).filter(f => f !== undefined)];
					// console.log('result', result);

					currentCachingStrategy++;
				} while (
					cacheKeys.filter(key => key !== undefined).length > 0 &&
					currentCachingStrategy < cachingStrategies.length
				);
			}

			if (cacheKeys.filter(key => key !== undefined).length > 0) {
				// use original method to resolve them
				const missingKeys = cacheKeys
					.map((key, i) => {
						if (key !== undefined) {
							return parameters[i];
						}
						return undefined;
					})
					.filter(k => k !== undefined);

				const originalMethodResult: any[] = await runMethod(missingKeys);
				if (originalMethodResult.length !== missingKeys.length) {
					throw new Error(
						`input and output has different size! input: ${cacheKeys.length}, returned ${originalMethodResult.length}`
					);
				}

				// console.log('originalMethodResult', originalMethodResult);
				if (!process.env.DISABLE_CACHE_DECORATOR) {
					// save back to all caching strategies
					const saveToCache = originalMethodResult
						.map((content, i) => {
							const key = keyStrategy.getKey(className, methodName, missingKeys[i], args, 'write');
							if (key === undefined) {
								return undefined;
							}

							return {
								key,
								content
							};
						})
						.filter(f => f !== undefined) as { key: string; content: any }[];

					// console.log('saveToCache', saveToCache);

					let saveCurrentCachingStrategy = cachingStrategies.length - 1;
					do {
						await cachingStrategies[saveCurrentCachingStrategy].setItems(saveToCache);

						saveCurrentCachingStrategy--;
					} while (saveCurrentCachingStrategy >= 0);
				}

				result = [...result, ...originalMethodResult];
			}

			return result;
		};

		return descriptor;
	};
}
