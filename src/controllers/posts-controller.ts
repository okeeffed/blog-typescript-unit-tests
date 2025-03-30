import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { BlogService } from '../services/blog-service';
import {
	postArraySchema,
	getBlogsQuery,
	createBlogBody,
	postSchema,
	getBlogParam,
	unpublishBlogParam,
} from '../schemas/schemas';
import { controller } from '../decorators';
import { z } from 'zod';

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

				c.res.headers.append('X-Cache-Hit', result.value._cacheHit ? 'true' : 'false');
				return c.json(result.value.data, 200);
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
			request: {
				params: getBlogParam

			},
			responses: {
				200: {
					description: "Successful response",
					content: {
						"application/json": {
							schema: postSchema.nullable(),
						},
					},
				},
				404: {
					description: "Blog not found",
					content: {
						"application/json": {
							schema: z.object({
								blogId: z.string(),
								message: z.string(),
							})
						},
					}
				}
			},
		}), async (c) => {
			const param = c.req.valid('param')
			const result = await this.blogService.getBlog({ param })
			return result.match(
				(value) => {
					c.res.headers.append('X-Cache-Hit', value._cacheHit ? 'true' : 'false');
					return c.json(value.data, 200);
				},
				(err) => {
					switch (err._tag) {
						case "BlogNotFoundError": {
							return c.json({
								blogId: param.blogId,
								message: "Blog post not found"
							}, 404)
						}
					}
				}
			)

		});
	}

	public unpublish() {
		return this.openapi(createRoute({
			method: 'post',
			path: '/:blogId/unpublish',
			description: "Unpublish a blog",
			request: {
				params: unpublishBlogParam
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
			const param = { blogId: c.req.param('blogId') };
			const result = await this.blogService.unpublishBlog({ param });
			return c.json(result.value, 200);
		});
	}
}

