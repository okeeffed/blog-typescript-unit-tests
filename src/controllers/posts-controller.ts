

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { BlogService } from '../services/blog-service';
import { z } from "@hono/zod-openapi"
import {
	postArraySchema,
	getBlogsRawQuery,
	getBlogsQuery,
	createBlogBody,
	postSchema,
	getBlogParam,
} from '../schemas/schemas';
import { controller } from '../decorators';

@controller
export class PostsController extends OpenAPIHono {
	private blogService: BlogService;

	constructor(blogService: BlogService) {
		super();
		this.blogService = blogService;
	}

	public list() {
		return this.openapi(createRoute({
			method: 'get',
			path: '/',
			description: "Fetch all blogs",
			request: {
				query: getBlogsQuery,
			},
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: postArraySchema,
						},
					},
				},
			},

		}),
			async (c) => {
				const result = await this.blogService.getBlogs({ query: c.req.valid('query') });
				return c.json(result.value, 200);
			});
	}

	public create() {
		return this.openapi(createRoute({
			method: 'post',
			path: '/',
			description: "Create a blog",
			request: {
				body: {
					content: {
						"application/json": {
							schema: createBlogBody,
						},
					},
				},
			},
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: postSchema,
						},
					},
				},
			},
		}), async (c) => {
			const body = await c.req.json();
			const result = await this.blogService.createBlog({ body });
			return c.json(result.value, 200);
		});
	}

	public getById() {
		return this.openapi(createRoute({
			method: 'get',
			path: '/:blogId',
			description: "Fetch a blog",
			parameters: [
				{
					in: "path",
					name: "blogId",
					required: true,
				},
			],
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: postSchema,
						},
					},
				},
			},
		}), async (c) => {
			const param = { blogId: c.req.param('blogId') };
			const result = await this.blogService.getBlog({ param });
			return c.json(result.value, 200);
		});
	}

	public unpublish() {
		return this.openapi(createRoute({
			method: 'post',
			path: '/:blogId/unpublish',
			description: "Unpublish a blog",
			parameters: [
				{
					in: "path",
					name: "blogId",
					required: true,
				},
			],
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: postSchema,
						},
					},
				},
			},
		}), async (c) => {
			const param = { blogId: c.req.param('blogId') };
			const result = await this.blogService.unpublishBlog({ param });
			return c.json(result.value, 200);
		});
	}
}

