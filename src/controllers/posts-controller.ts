
import { Hono } from "hono";
import { BlogService } from '../services/blog-service';
import {
	postArraySchema,
	getBlogsRawQuery,
	getBlogsQuery,
	createBlogBody,
	postSchema,
	getBlogParam,
} from '../schemas/schemas';
import { controller } from '../decorators';
import { resolver, validator } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";

@controller
export class PostsController extends Hono {
	private blogService: BlogService;

	constructor(blogService: BlogService) {
		super();
		this.blogService = blogService;
	}

	public list() {
		return this.get(
			'/',
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
				parameters: [
					{
						in: "query",
						name: "published",
						required: false,
					},
				],
			}),
			validator('query', getBlogsRawQuery.pipe(getBlogsQuery)),
			async (c) => {
				const result = await this.blogService.getBlogs({
					query: c.req.valid('query'),
				});
				return c.json(result.value, 200);
			}
		);
	}

	public create() {
		return this.post(
			'/',
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
			validator('json', createBlogBody),
			async (c) => {
				const result = await this.blogService.createBlog({
					body: c.req.valid('json'),
				});
				return c.json(result.value, 200);
			}
		);
	}

	public getById() {
		return this.get(
			'/:blogId',
			describeRoute({
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
								schema: resolver(postSchema),
							},
						},
					},
				},
			}),
			validator('param', getBlogParam),
			async (c) => {
				const result = await this.blogService.getBlog({
					param: c.req.valid('param'),
				});
				return c.json(result.value, 200);
			}
		);
	}

	public unpublish() {
		return this.post(
			'/:blogId/unpublish',
			describeRoute({
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
								schema: resolver(postSchema),
							},
						},
					},
				},
			}),
			validator('param', getBlogParam),
			async (c) => {
				const result = await this.blogService.unpublishBlog({
					param: c.req.valid('param'),
				});
				return c.json(result.value, 200);
			}
		);
	}
}
