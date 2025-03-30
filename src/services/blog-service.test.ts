import { sortBy } from "es-toolkit"
import { RecordsClient } from "@/clients/records-client"
import { BlogRepository } from "@/repositories/blog-repository"
import { BlogService } from "./blog-service"
import { getKeyv } from "@/lib/keyv"
import { prisma } from "@/lib/prisma"
import { CreateBlogBody } from "@/schemas/schemas"
import { authorsSeedData, publishedPostsSeedData } from "@/mocks/seed-data"


describe('BlogService', () => {
	let blogRepository: BlogRepository
	let recordsClient: RecordsClient
	let blogService: BlogService

	beforeEach(() => {
		const keyv = getKeyv()
		blogRepository = new BlogRepository(prisma, keyv)
		recordsClient = new RecordsClient()
		blogService = new BlogService(blogRepository, recordsClient)
	})

	test('createBlog', async () => {
		const createBlogBody: CreateBlogBody = { title: 'title', content: 'content' }
		const result = await blogService.createBlog({ body: createBlogBody })

		expect(result.isOk()).toBe(true)
		expect(result.value.title).toBe('title')
		expect(result.value.content).toBe('content')
	})

	test('unpublishBlog', async () => {
		const createBlogBody: CreateBlogBody = { title: 'title', content: 'content' }
		const createResult = await blogService.createBlog({ body: createBlogBody })
		const result = await blogService.unpublishBlog({ param: { blogId: createResult.value.id } })

		expect(result.isOk()).toBe(true)
		expect(result.value.published).toBe(false)
	})

	test('getBlog', async () => {
		const createBlogBody: CreateBlogBody = { title: 'title', content: 'content' }
		const createResult = await blogService.createBlog({ body: createBlogBody })
		const result = await blogService.getBlog({ param: { blogId: createResult.value.id } })

		expect(result.isOk()).toBe(true)
		expect(result.value.data?.title).toBe('title')
		expect(result.value.data?.content).toBe('content')
	})

	test('getBlogs', async () => {
		const result = await blogService.getBlogs({ query: { published: true } })
		const cmp = sortBy(publishedPostsSeedData, ['createdAt'])

		expect(result.isOk()).toBe(true)
		expect(sortBy(result.value.data, ['createdAt'])[0]).toMatchObject({
			...cmp[0],
			updatedAt: expect.any(String),
			createdAt: expect.any(String)
		})
	})

	test('getBloggers', async () => {
		const result = await blogService.getBloggers()

		expect(result.isOk()).toBe(true)
		expect(result.value.data).toContain(authorsSeedData)
	})
})
