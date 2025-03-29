import { ILoggerService } from "../services/logger-service";

export function addTrace<T extends object>(
	classObj: T,
	logger: ILoggerService
): T {
	const className = classObj.constructor.name;
	return new Proxy(classObj, {
		get(target, prop, receiver) {
			const originalValue = Reflect.get(target, prop, receiver);
			if (typeof originalValue === 'function' && prop !== 'constructor') {
				return async function(...args: any[]) {
					// Log before method execution
					logger.trace(`${String(prop)}() called`, { args }, className);
					try {
						// Track timing for performance
						const start = performance.now()
						// Execute the original method
						const result = await originalValue.apply(target, args);
						const end = performance.now()
						// Log after method execution
						logger.trace(`${String(prop)}() returned`, { result, time: `${end - start}ms` }, className);
						return result;
					} catch (error) {
						// Log errors
						logger.error(`${String(prop)}() failed`, { error }, className);
						throw error;
					}
				};
			}
			return originalValue;
		}
	});
}
