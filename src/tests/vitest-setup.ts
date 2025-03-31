import { server } from "../mocks/server"
import { PrismaClient } from '@prisma/client'
import { container } from "../config/ioc-test"
import { beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { IocKeys } from "../config/ioc-keys"

const keyv = container.get<any>(IocKeys.KeyvClient)
const prisma = container.get<PrismaClient>(IocKeys.PrismaClient)


beforeAll(async () => {
	// Start MSW
	server.listen({ onUnhandledRequest: "bypass" })
}, 30000)

beforeEach(async () => {
	// Create a new transaction client for each test
	await prisma.$executeRaw`BEGIN TRANSACTION`;

	// Get a reference to the original prisma client
	const originalPrisma = container.get<PrismaClient>(IocKeys.PrismaClient);

	// Unbind and rebind with same instance (this ensures we're using the same connection)
	if (container.isBound(IocKeys.PrismaClient)) {
		container.unbind(IocKeys.PrismaClient);
	}
	container.bind(IocKeys.PrismaClient).toConstantValue(originalPrisma);
});

afterEach(async () => {
	// Roll back the transaction
	await prisma.$executeRaw`ROLLBACK`;

	await keyv.clear();
	server.resetHandlers();
});

afterAll(async () => {
	server.close()

	await prisma.$disconnect()
	await keyv.disconnect()
})
