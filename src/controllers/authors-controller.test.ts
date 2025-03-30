import { AuthorsController } from "./authors-controller"
import { authorFactory } from "@/mocks/author-factory";
import { prisma } from "@/lib/prisma";
import { Author } from "@prisma/client";
import { BlogService } from "@/services/blog-service";
import { BlogRepository } from "@/repositories/blog-repository";
import { RecordsClient } from "@/clients/records-client";
import { getKeyv } from "@/lib/keyv";
import { authorArraySchema } from "@/schemas/schemas";
import { sortBy } from "es-toolkit";

describe("AuthorsController", () => {
	let authors: Author[]
	let app: AuthorsController;
	let baseHeaders: Record<string, string>

	beforeAll(async () => {
		const keyv = getKeyv()
		const recordsClient = new RecordsClient()
		const blogRepository = new BlogRepository(prisma, keyv)
		const blogService = new BlogService(blogRepository, recordsClient);
		app = new AuthorsController(blogService)

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

