import { Hono } from 'hono'
import pino from 'pino'
import { createKeyv } from "@keyv/valkey"
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";

import { BlogService } from './services/blog-service'

import { BlogRepository } from './repositories/blog-repository'
import { RecordsClient } from './clients/records-client'
import { PrismaClient } from '@prisma/client'
import { addTrace } from './proxies/add-trace'
import { authorArraySchema, createBlogBody, getBlogParam, postArraySchema, postSchema } from './schemas/schemas';

export const createApp = () => {
	const prismaClient = new PrismaClient()
	const keyv = createKeyv(process.env.VALKEY_URL!) // omitted validation for brevity
	const logger = pino()

	const blogRepository = addTrace(new BlogRepository(prismaClient, keyv), logger)
	const recordsClient = addTrace(new RecordsClient(), logger)
	const blogService = addTrace(new BlogService(blogRepository, recordsClient), logger)


	const app = new Hono()

	app.get('/v1/authors',
		describeRoute({
			description: "Fetch all authors",
			responses: {
				200: {
					description: "Successful response",
					content: {
						"text/plain": {
							schema: resolver(authorArraySchema),
						},
					},
				},
			},
		}),
		async (c) => {
			const result = await blogService.getBloggers()
			return c.json(result.value)
		})

	app.get('/v1/blogs',
		describeRoute({
			description: "Fetch all blogs",
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: resolver(postArraySchema),
						},
					},
				},
			},
		})
		, async (c) => {
			const result = await blogService.getBlogs()
			return c.json(result.value)
		})

	app.post('/v1/blogs',
		describeRoute({
			description: "Create a blog",
			requestBody: {
				content: {
					"application/json": {
						schema: resolver(createBlogBody),
					},
				},
			},
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: resolver(postSchema),
						},
					},
				},
			},
		}),
		zValidator('json', createBlogBody),
		async (c) => {
			const result = await blogService.createBlog({
				body: c.req.valid('json'),
			})
			return c.json(result.value)
		})

	app.get('/v1/blogs/:blogId',
		describeRoute({
			description: "Fetch a blog",
			parameters: [{
				in: "path",
				name: "blogId",
				required: true,
				schema: {
					type: "string",
					format: "uuid",
				},
			}],
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: resolver(postSchema),
						},
					},
				},
			},

		}),

		zValidator('param', getBlogParam),
		async (c) => {
			const result = await blogService.getBlog({
				param: c.req.valid('param'),
			})
			return c.json(result.value)
		})

	app.post('/v1/blogs/:blogId/unpublish',
		describeRoute({
			description: "Unpublish a blog",
			parameters: [{
				in: "path",
				name: "blogId",
				required: true,
				schema: {
					type: "string",
					format: "uuid",
				},
			}],
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: resolver(postSchema),
						},
					},
				},
			},
		}),
		zValidator('param', getBlogParam)
		, async (c) => {
			const result = await blogService.unpublishBlog({
				param: c.req.valid('param'),
			})
			return c.json(result.value)
		})

	app.get(
		'/openapi',
		openAPISpecs(app, {
			documentation: {
				info: {
					title: 'Hono API',
					version: '1.0.0',
					description: 'Greeting API',
				},
				servers: [
					{ url: 'http://localhost:3000', description: 'Local Server' },
				],
			},
		})
	)
	return app
}

