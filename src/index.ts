import "reflect-metadata";
import { OpenAPIHono } from "@hono/zod-openapi";

import { container } from "@/config/ioc";
export const app = new OpenAPIHono();

app.route("/v1/authors", container.resolve("authorsController"));
app.route("/v1/posts", container.resolve("postsController"));
