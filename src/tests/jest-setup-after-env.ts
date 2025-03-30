import { server } from "../mocks/server"
import { PrismaClient } from '@prisma/client'
import { getKeyv } from '../lib/keyv'

export const prisma = new PrismaClient()

beforeAll(async () => {
	// Start MSW
	server.listen({ onUnhandledRequest: "bypass" })
}, 30000)

beforeEach(async () => {
	// Start transaction
	await prisma.$executeRaw`BEGIN;`;
});

afterEach(async () => {
	server.resetHandlers()
	// Rollback any transactions
	await prisma.$executeRaw`ROLLBACK;`;
	const keyv = getKeyv();
	if (keyv) {
		await keyv.clear()
	}
})

afterAll(async () => {
	server.close()

	await prisma.$disconnect()
	const keyv = getKeyv();
	if (keyv) {
		await keyv.disconnect()
	}
})
