import { server } from "../mocks/server"
import { PrismaClient } from '@prisma/client'
import { getKeyv } from '../lib/keyv'
import { beforeAll, afterEach, afterAll } from 'vitest'

export const prisma = new PrismaClient()

beforeAll(async () => {
	// Start MSW
	server.listen({ onUnhandledRequest: "bypass" })
}, 30000)


afterEach(async () => {
	server.resetHandlers()
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
