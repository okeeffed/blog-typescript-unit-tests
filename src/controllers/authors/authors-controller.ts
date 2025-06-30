import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { BlogService } from "@/services/blog-service";
import { authorArraySchema } from "@/shared/schemas/author";

export class AuthorsController extends OpenAPIHono {
  private blogService: BlogService;

  constructor({ blogService }: { blogService: BlogService }) {
    super();
    this.blogService = blogService;

    this.list();
  }

  public list() {
    return this.openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: {
          200: {
            content: {
              "application/json": {
                schema: authorArraySchema,
              },
            },
            description: "Returns a list of authors",
          },
        },
      }),
      async (c) => {
        const result = await this.blogService.getBloggers();
        c.res.headers.append(
          "X-Cache-Hit",
          result.value._cacheHit ? "true" : "false",
        );
        return c.json(result.value.data, 200);
      },
    );
  }
}
