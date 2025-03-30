import { Hono } from "hono"
import { BlogService } from '../services/blog-service';
import { authorArraySchema } from '../schemas/schemas';
import { controller } from '../decorators'
import { resolver } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'

@controller
export class AuthorsController extends OpenAPIHono {
	private blogService: BlogService

	constructor(blogService: BlogService) {
		super()
		this.blogService = blogService;
	}

	public list() {
		return this.openapi(createRoute({
			method: 'get',
			path: '/',
			responses: {
				200: {
					content: {
						'application/json': {
							schema: authorArraySchema,
						},
					},
					description: 'Retrieve the user',
				},
			},
		}), async (c) => {
			const result = await this.blogService.getBloggers()
			return c.json(result.value, 200)
		})
	}
}
