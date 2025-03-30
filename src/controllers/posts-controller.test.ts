import { PostsController } from "./posts-controller"
import { postFactory } from "@/mocks/post-factory";
import { prisma } from "@/lib/prisma";
import { Post } from "@prisma/client";
import { BlogService } from "@/services/blog-service";
import { BlogRepository } from "@/repositories/blog-repository";
import { RecordsClient } from "@/clients/records-client";
import { getKeyv } from "@/lib/keyv";
import { postArraySchema, postSchema, postSchemaSerialised } from "@/schemas/schemas";
import { faker } from "@faker-js/faker";
import { sortBy } from "es-toolkit";

describe("PostsController", () => {
	let posts: Post[]
	let app: PostsController;
	let baseHeaders: Record<string, string>
	let blogService: BlogService;

	beforeAll(async () => {
		const keyv = getKeyv()
		const recordsClient = new RecordsClient()
		const blogRepository = new BlogRepository(prisma, keyv)
		blogService = new BlogService(blogRepository, recordsClient);
		app = new PostsController(blogService)

		baseHeaders = {
			"content-type": "application/json"
		}
	})

	beforeEach(async () => {
		const timestamp = new Date()
		posts = postFactory.buildList(5, {
			createdAt: timestamp,
			updatedAt: timestamp
		});
		await prisma.post.createMany({
			data: posts
		})
	})

	afterEach(async () => {
		await prisma.post.deleteMany({
			where: {
				id: {
					in: posts.map(p => p.id)
				}
			}
		})
	})

	describe("GET /", () => {
		test("should return a list of posts", async () => {
			const response = await app.request('/', {
				method: "GET",
				headers: baseHeaders
			})

			expect(response.status).toBe(200);
			const json = await response.json()
			const expectedResponse = posts.map(p => ({
				...p,
				createdAt: p.createdAt.toISOString(),
				updatedAt: p.updatedAt.toISOString()
			}))
			const expectedResponseSerialised = postArraySchema.parse(json)
			const sortedPosts = sortBy(expectedResponseSerialised, ['id'])
			const sortedExpectedPosts = sortBy(expectedResponse, ['id'])
			expect(sortedPosts).toEqual(sortedExpectedPosts)
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

	describe("POST /", () => {
		test("should create a new post", async () => {
			const newPost = {
				title: "Test Post",
				content: "This is a test post content",
				authorId: "author-123"
			}

			const response = await app.request('/', {
				method: "POST",
				headers: baseHeaders,
				body: JSON.stringify(newPost)
			})

			expect(response.status).toBe(200);
			const json = await response.json()
			const expectedResponse = postSchemaSerialised.parse(json)
			expect(expectedResponse).toMatchObject({
				title: newPost.title,
				content: newPost.content,
			})

			await prisma.post.delete({
				where: {
					id: expectedResponse.id
				}
			})
		})
	})

	describe("GET /:blogId", () => {
		test("should return a specific post by id", async () => {
			const post = posts[0]
			const response = await app.request(`/${post.id}`, {
				method: "GET",
				headers: baseHeaders
			})

			expect(response.status).toBe(200);
			const json = await response.json()
			const expectedResponse = postSchemaSerialised.parse(json)

			expect(expectedResponse).toEqual({
				...post,
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString()
			})
		})

		test("should return 404 when post does not exist", async () => {
			const blogId = faker.string.uuid()
			const response = await app.request(`/${blogId}`, {
				method: "GET",
				headers: baseHeaders
			})

			expect(response.status).toBe(404);
			const json = await response.json()
			expect(json).toEqual({
				blogId,
				message: "Blog post not found"
			})
		})

		test("should return cache headers as expected", async () => {
			const post = posts[0]
			const response = await app.request(`/${post.id}`, {
				method: "GET",
				headers: baseHeaders
			})

			expect(response.status).toBe(200);
			expect(response.headers.get('X-Cache-Hit')).toBe('false')

			const cachedResponse = await app.request(`/${post.id}`, {
				method: "GET",
				headers: baseHeaders
			})

			expect(cachedResponse.status).toBe(200);
			expect(cachedResponse.headers.get('X-Cache-Hit')).toBe('true')
		})
	})

	describe("POST /:blogId/unpublish", () => {
		test("should unpublish a post", async () => {
			const post = posts[0]
			const response = await app.request(`/${post.id}/unpublish`, {
				method: "POST",
				headers: baseHeaders
			})

			expect(response.status).toBe(200);
			const json = await response.json()
			expect(json).toMatchObject({
				id: post.id,
				published: false
			})
		})
	})
})
