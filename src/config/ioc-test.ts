import { Container } from "inversify";
import pino from 'pino'
import { PrismaClient } from "@prisma/client"
import { createKeyv } from "@keyv/valkey";


import { BlogService } from '../services/blog-service'
import { BlogRepository } from '../repositories/blog-repository'
import { RecordsClient } from '../clients/records-client'
import { AuthorsController } from '../controllers/authors-controller';
import { PostsController } from '../controllers/posts-controller';
import { IocKeys } from "./ioc-keys";


function bind(c: Container) {
	const logger = pino({
		level: process.env.LOG_LEVEL || 'info',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true
			}
		}
	})
	c.bind(IocKeys.LoggerService).toConstantValue(logger);

	// Create the original Prisma client and then wrap it
	const prismaClient = new PrismaClient();
	c.bind(IocKeys.PrismaClient).toConstantValue(prismaClient);

	const keyvInstance = createKeyv(process.env.VALKEY_URL!)
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
