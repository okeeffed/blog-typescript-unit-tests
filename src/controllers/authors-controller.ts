import { IocKeys } from "@/config/ioc-keys";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { inject, injectable } from "inversify";
import { authorArraySchema } from "../schemas/schemas";
import type { BlogService } from "../services/blog-service";

@injectable()
export class AuthorsController extends OpenAPIHono {
  private blogService: BlogService;

  constructor(@inject(IocKeys.BlogService) blogService: BlogService) {
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
