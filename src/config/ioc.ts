import { createKeyv } from "@keyv/valkey";
import { PrismaClient } from "@prisma/client";
import * as awilix from "awilix";
import pino, { type Logger } from "pino";

import { RecordsClient } from "../clients/records-client";
import { AuthorsController } from "../controllers/authors/authors-controller";
import { PostsController } from "../controllers/posts/posts-controller";
import { addTraceCurried } from "../shared/proxies/add-trace";
import { BlogRepository } from "../repositories/blog-repository";
import { BlogService } from "../services/blog-service";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// Create the addTrace proxy
const addTrace = addTraceCurried(logger);

export interface Container {
  loggerService: Logger;
  prismaClient: PrismaClient;
  keyvClient: ReturnType<typeof createKeyv>;
  recordsClient: RecordsClient;
  blogRepository: BlogRepository;
  blogService: BlogService;
  authorsController: AuthorsController;
  postsController: PostsController;
}

const withTrace = <T extends object>(
  // biome-ignore lint/suspicious/noExplicitAny: We are okay for args in this case
  ClassConstructor: new (...args: any[]) => T,
) => {
  return awilix
    .asFunction((cradle) => {
      const instance = new ClassConstructor(cradle);
      return addTrace(instance);
    })
    .singleton();
};

const container = awilix.createContainer<Container>();
const prismaClient = new PrismaClient();
const keyvInstance = createKeyv(process.env.VALKEY_URL as string);

container.register({
  loggerService: awilix.asValue(logger),
  prismaClient: awilix.asValue(prismaClient),
  keyvClient: awilix.asValue(keyvInstance),
  recordsClient: withTrace(RecordsClient),
  blogRepository: withTrace(BlogRepository),
  blogService: withTrace(BlogService),
  authorsController: withTrace(AuthorsController),
  postsController: withTrace(PostsController),
});

export { container };
