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
					logger.trace({ args, className }, `${className}.${String(prop)}() called`);
					try {
						// Track timing for performance
						const start = performance.now()
						// Execute the original method
						const result = await originalValue.apply(target, args);
						const end = performance.now()
						// Log after method execution
						logger.trace({ className, duration: `${(end - start).toFixed(4)}ms` }, `${className}.${String(prop)}() returned`);
						return result;
					} catch (error) {
						// Log errors
						logger.error({ error, className }, `${className}.${String(prop)}() failed`, { error });
						throw error;
					}
				};
			}
			return originalValue;
		}
	});
}

/**
 * Curried version of addTrace to partially apply the logger first.
 */
export const addTraceCurried = (logger: ILoggerService) => <T extends object>(classObj: T): T =>
	addTrace(classObj, logger);
