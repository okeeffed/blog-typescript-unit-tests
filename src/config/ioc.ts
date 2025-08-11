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
import { OpenAPIHono } from "@hono/zod-openapi";

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

function autoInvokeCustomMethods(instance: any): void {
  if (!(instance instanceof OpenAPIHono)) {
    return; // Only apply to OpenAPIHono controllers
  }

  const proto = Object.getPrototypeOf(instance);
  const methodNames = Object.getOwnPropertyNames(proto)
    .filter(name => {
      // Filter out constructor, private methods, and OpenAPIHono methods
      if (name === 'constructor' || name.startsWith('_')) {
        return false;
      }

      // Check if it's a function and not inherited from OpenAPIHono
      const method = instance[name as keyof typeof instance];
      if (typeof method !== 'function') {
        return false;
      }

      // Exclude OpenAPIHono methods by checking if they exist on OpenAPIHono prototype
      const honoProto = OpenAPIHono.prototype;
      if (honoProto.hasOwnProperty(name) || name in honoProto) {
        return false;
      }

      return true;
    });

  // Invoke each custom method
  methodNames.forEach(methodName => {
    console.log(`Setting up route: ${methodName}`);
    (instance[methodName as keyof typeof instance] as Function).call(instance);
  });
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

// For controllers - no tracing, but auto-invoke routes
const asController = <T extends OpenAPIHono>(
  ClassConstructor: new (...args: any[]) => T,
) => {
  return awilix
    .asFunction((cradle) => {
      const instance = new ClassConstructor(cradle);

      console.log(`Auto-invoking routes for ${ClassConstructor.name}`);
      autoInvokeCustomMethods(instance);

      return instance;
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
  authorsController: asController(AuthorsController),
  postsController: asController(PostsController),
});

export { container };
