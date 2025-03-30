import { BlogRepository } from './blog-repository'
import { prisma } from "@/lib/prisma"
import { getKeyv } from '../lib/keyv'


describe('BlogRepository', () => {
	let blogRepository: BlogRepository

	beforeEach(() => {
		const keyv = getKeyv()
		blogRepository = new BlogRepository(prisma, keyv)
	})

	describe('createBlog', () => {
		test('createBlog', async () => {
			const result = await blogRepository.createBlog({ body: { title: 'title', content: 'content' } })
			expect(result.isOk()).toBe(true)
			expect(result.value.title).toBe('title')
			expect(result.value.content).toBe('content')
		})
	})

	describe('unpublishBlog', () => {
		test('can set a blog to unpublished', async () => {
			const createResult = await blogRepository.createBlog({ body: { title: 'title', content: 'content' } })
			const result = await blogRepository.unpublishBlog({ param: { blogId: createResult.value.id } })
			expect(result.isOk()).toBe(true)
			expect(result.value.published).toBe(false)
		})
	})

	describe('getBlog', () => {
		test('can get a blog', async () => {
			const createResult = await blogRepository.createBlog({ body: { title: 'title', content: 'content' } })
			const result = await blogRepository.getBlog({ param: { blogId: createResult.value.id } })
			expect(result.isOk()).toBe(true)
			expect(result.value.data?.title).toBe('title')
			expect(result.value.data?.content).toBe('content')
		})

		test('can retrieve a blog from cache', async () => {
			const createResult = await blogRepository.createBlog({ body: { title: 'title', content: 'content' } })
			const noCacheResult = await blogRepository.getBlog({ param: { blogId: createResult.value.id } })
			expect(noCacheResult.isOk()).toBe(true)
			expect(noCacheResult.value._cacheHit).toBe(false)

			const result = await blogRepository.getBlog({ param: { blogId: createResult.value.id } })
			expect(result.isOk()).toBe(true)
			expect(result.value._cacheHit).toBe(true)
		})
	})

	describe('getBlogs', () => {
		test('can get blogs', async () => {
			const result = await blogRepository.getBlogs({ query: { published: true } })
			expect(result.isOk()).toBe(true)
			expect(result.value.data.length).toBeGreaterThan(0)
		})

		test('can retrieve blogs from cache', async () => {
			const noCacheResult = await blogRepository.getBlogs({ query: { published: true } })
			expect(noCacheResult.isOk()).toBe(true)
			expect(noCacheResult.value._cacheHit).toBe(false)

			const result = await blogRepository.getBlogs({ query: { published: true } })
			expect(result.isOk()).toBe(true)
			expect(result.value._cacheHit).toBe(true)
		})
	})

	describe('getBloggers', () => {
		test('can get bloggers', async () => {
			const result = await blogRepository.getBloggers()
			expect(result.isOk()).toBe(true)
			expect(result.value.data.length).toBeGreaterThan(0)
		})

		test('can retrieve bloggers from cache', async () => {
			const noCacheResult = await blogRepository.getBloggers()
			expect(noCacheResult.isOk()).toBe(true)
			expect(noCacheResult.value._cacheHit).toBe(false)

			const result = await blogRepository.getBloggers()
			expect(result.isOk()).toBe(true)
			expect(result.value._cacheHit).toBe(true)
		})
	})
})
