import * as awilix from "awilix";

import { container } from "./ioc";
import { RecordsClient } from "@/clients/records-client";
import { BlogRepository } from "@/repositories/blog-repository";
import { BlogService } from "@/services/blog-service";
import { AuthorsController } from "@/controllers/authors/authors-controller";
import { PostsController } from "@/controllers/posts/posts-controller";

container.register({
  recordsClient: awilix.asClass(RecordsClient).singleton(),
  blogRepository: awilix.asClass(BlogRepository).singleton(),
  blogService: awilix.asClass(BlogService).singleton(),
  authorsController: awilix.asClass(AuthorsController).singleton(),
  postsController: awilix.asClass(PostsController).singleton(),
});

// Rebind
container.dispose();

export { container };
