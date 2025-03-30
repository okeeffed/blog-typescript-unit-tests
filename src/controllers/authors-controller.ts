import { BlogService } from '../services/blog-service';
import { authorArraySchema } from '../schemas/schemas';
import { controller } from '../decorators'
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
					description: 'Returns a list of authors',
				},
			},
		}), async (c) => {
			const result = await this.blogService.getBloggers()
			return c.json(result.value, 200)
		})
	}
}
