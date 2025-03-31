import { AuthorsController } from "./authors-controller"
import { authorFactory } from "@/mocks/author-factory";
import { Author, PrismaClient } from "@prisma/client";
import { authorArraySchema } from "@/schemas/schemas";
import { sortBy } from "es-toolkit";
import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { IocKeys } from "../config/ioc-keys";
import { container } from "../config/ioc-test";

describe("AuthorsController", () => {
	let authors: Author[]
	let app: AuthorsController;
	let baseHeaders: Record<string, string>
	let prisma: PrismaClient

	beforeAll(async () => {
		app = container.get<AuthorsController>(IocKeys.AuthorsController)
		prisma = container.get<PrismaClient>(IocKeys.PrismaClient)

		baseHeaders = {
			"content-type": "application/json"
		}
	})

	describe("GET /", () => {
		beforeEach(async () => {
			const timestamp = new Date()
			authors = authorFactory.buildList(5, {
				createdAt: timestamp,
				updatedAt: timestamp
			});
			await prisma.author.createMany({
				data: authors
			})
		})

		afterEach(async () => {
			await prisma.author.deleteMany({
				where: {
					id: {
						in: authors.map(a => a.id)
					}
				}
			})
		})

		test("should return a list of authors", async () => {
			const response = await app.request('/', {
				method: "GET",
				headers: baseHeaders
			})

			expect(response.status).toBe(200);
			const json = await response.json()
			const expectedResponse = authors.map(a => ({
				...a,
				createdAt: a.createdAt.toISOString(),
				updatedAt: a.updatedAt.toISOString()
			}))
			const validatedAuthors = authorArraySchema.parse(json)
			const sortedAuthors = sortBy(validatedAuthors, ['id'])
			const sortedExpectedAuthors = sortBy(expectedResponse, ['id'])
			expect(sortedAuthors).toEqual(sortedExpectedAuthors)
		})

		test("should return cache headers as expected", async () => {
			const response = await app.request('/', {
				method: "GET",
				headers: baseHeaders
			})

			expect(response.status).toBe(200);
			expect(response.headers.get('X-Cache-Hit')).toBe('false')

			const cachedResponse = await app.request('/', {
				method: "GET",
				headers: baseHeaders
			})

			expect(cachedResponse.status).toBe(200);
			expect(cachedResponse.headers.get('X-Cache-Hit')).toBe('true')
		})
	})
})

