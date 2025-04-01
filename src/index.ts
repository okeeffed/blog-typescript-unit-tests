import "reflect-metadata";
import { OpenAPIHono } from "@hono/zod-openapi";

import { container } from "@/config/ioc";
import { IocKeys } from "./config/ioc-keys";
import type { AuthorsController } from "./controllers/authors-controller";
import type { PostsController } from "./controllers/posts-controller";

export const app = new OpenAPIHono();

app.route(
  "/v1/authors",
  container.get<AuthorsController>(IocKeys.AuthorsController),
);
app.route("/v1/posts", container.get<PostsController>(IocKeys.PostsController));
