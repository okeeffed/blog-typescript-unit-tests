import type { ILoggerService } from "@/services/logger-service";

/**
 * Adds a trace log to the start and end of any function.
 */
export function addTrace<T extends object>(
  classObj: T,
  logger: ILoggerService,
): T {
  const className = classObj.constructor.name;
  return new Proxy(classObj, {
    get(target, prop, receiver) {
      const originalValue = Reflect.get(target, prop, receiver);
      if (typeof originalValue === "function" && prop !== "constructor") {
        return <T>(...args: T[]) => {
          // Log before method execution
          logger.trace(
            { args, className },
            `${className}.${String(prop)}() called`,
          );

          try {
            // Track timing for performance
            const start = performance.now();

            // Execute the original method
            const result = originalValue.apply(target, args);

            // Check if the result is a Promise
            if (result instanceof Promise) {
              // Handle async method
              return result
                .then((asyncResult) => {
                  const end = performance.now();
                  logger.trace(
                    { className, duration: `${(end - start).toFixed(4)}ms` },
                    `${className}.${String(prop)}() returned`,
                  );
                  return asyncResult;
                })
                .catch((error) => {
                  logger.error(
                    { error, className },
                    `${className}.${String(prop)}() failed`,
                    { error },
                  );
                  throw error;
                });
            }

            // Handle sync method
            const end = performance.now();
            logger.trace(
              { className, duration: `${(end - start).toFixed(4)}ms` },
              `${className}.${String(prop)}() returned`,
            );
            return result;
          } catch (error) {
            // Log synchronous errors
            logger.error(
              { error, className },
              `${className}.${String(prop)}() failed`,
              { error },
            );
            throw error;
          }
        };
      }
      return originalValue;
    },
  });
}

/**
 * Curried version of addTrace to partially apply the logger first.
 */
export const addTraceCurried =
  (logger: ILoggerService) =>
  <T extends object>(classObj: T): T =>
    addTrace(classObj, logger);
