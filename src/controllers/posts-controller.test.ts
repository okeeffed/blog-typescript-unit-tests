import { PostsController } from "./posts-controller"
import { postFactory } from "@/mocks/post-factory";
import { Post, PrismaClient } from "@prisma/client";
import { BlogService } from "@/services/blog-service";
import { postArraySchema, postSchemaSerialised } from "@/schemas/schemas";
import { faker } from "@faker-js/faker";
import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { container } from "../config/ioc-test";
import { IocKeys } from "../config/ioc-keys";

describe("PostsController", () => {
	let posts: Post[]
	let app: PostsController;
	let baseHeaders: Record<string, string>
	let blogService: BlogService;
	let prisma: PrismaClient

	beforeAll(async () => {
		blogService = container.get<BlogService>(IocKeys.BlogService)
		prisma = container.get<PrismaClient>(IocKeys.PrismaClient)
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
			expect(expectedResponseSerialised).toEqualSortedBy(expectedResponse, 'id')
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
