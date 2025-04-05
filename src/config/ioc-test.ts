import { createKeyv } from "@keyv/valkey";
import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import pino from "pino";

import { RecordsClient } from "../clients/records-client";
import { AuthorsController } from "../controllers/authors/authors-controller";
import { PostsController } from "../controllers/posts/posts-controller";
import { BlogRepository } from "../repositories/blog-repository";
import { BlogService } from "../services/blog-service";
import { IocKeys } from "./ioc-keys";

function bind(c: Container) {
  if (!process.env.VALKEY_URL) {
    throw new Error("Valkey URL not defined");
  }

  const logger = pino({
    enabled: false,
  });
  c.bind(IocKeys.LoggerService).toConstantValue(logger);

  // Create the original Prisma client and then wrap it
  const prismaClient = new PrismaClient();
  c.bind(IocKeys.PrismaClient).toConstantValue(prismaClient);

  const keyvInstance = createKeyv(process.env.VALKEY_URL);
  c.bind(IocKeys.KeyvClient).toConstantValue(keyvInstance);

  // Bind controllers
  c.bind(IocKeys.RecordsClient).to(RecordsClient);
  c.bind(IocKeys.BlogRepository).to(BlogRepository);
  c.bind(IocKeys.BlogService).to(BlogService);
  c.bind(IocKeys.AuthorsController).to(AuthorsController);
  c.bind(IocKeys.PostsController).to(PostsController);
}

const container = new Container();
bind(container);

export { container };
