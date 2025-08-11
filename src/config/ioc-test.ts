import * as awilix from "awilix";

import { container } from "./ioc";
import { RecordsClient } from "@/clients/records-client";
import { BlogRepository } from "@/repositories/blog-repository";
import { BlogService } from "@/services/blog-service";
import pino from "pino";

const logger = pino({
  level: "silent",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

container.register({
  loggerService: awilix.asValue(logger),
  recordsClient: awilix.asClass(RecordsClient).singleton(),
  blogRepository: awilix.asClass(BlogRepository).singleton(),
  blogService: awilix.asClass(BlogService).singleton(),
});

// Rebind
container.dispose();

export { container };
