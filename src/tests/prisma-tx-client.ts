import { PrismaClient } from "@prisma/client";

// Create a proxy that wraps every method call in a transaction
export function createTransactionalProxy(prismaClient: PrismaClient): PrismaClient {
	return new Proxy(prismaClient, {
		get(target, prop, receiver) {
			const origProperty = target[prop as keyof typeof target];
			if (typeof origProperty === "function" && prop !== "$transaction") {
				return async function(...args: any[]) {
					// Wrap the call in a transaction. Depending on your needs,
					// you might need to adjust how you handle nested calls.
					return target.$transaction(async (tx) => {
						// Call the original method on the transactional client
						return (tx as any)[prop](...args);
					});
				};
			}
			return origProperty;
		},
	});
}
