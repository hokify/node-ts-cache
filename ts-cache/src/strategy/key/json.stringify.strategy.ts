import { ISyncKeyStrategy } from '../../types/key.strategy.types.js';

export class JSONStringifyKeyStrategy implements ISyncKeyStrategy {
	public getKey(className: string, methodName: string, args: any[]): string {
		return `${className}:${methodName}:${JSON.stringify(args)}`;
	}
}
