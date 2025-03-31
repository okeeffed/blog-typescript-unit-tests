import 'reflect-metadata'
import { Container } from "inversify";
import pino from 'pino'
import { PrismaClient } from "@prisma/client"
import { createKeyv } from "@keyv/valkey";

import { BlogService } from '../services/blog-service'
import { BlogRepository } from '../repositories/blog-repository'
import { RecordsClient } from '../clients/records-client'
import { addTraceCurried } from '../proxies/add-trace'
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

	const prismaClient = new PrismaClient()
	c.bind(IocKeys.PrismaClient).toConstantValue(prismaClient);

	const keyvInstance = createKeyv(process.env.VALKEY_URL!)
	c.bind(IocKeys.KeyvClient).toConstantValue(keyvInstance);

	// Create the addTrace proxy
	const addTrace = addTraceCurried(logger);

	// Bind dependencies with onActivation to wrap them with the proxy.
	c.bind<RecordsClient>(IocKeys.RecordsClient)
		.to(RecordsClient)
		.onActivation((_ctx, instance) => addTrace(instance));

	c.bind<BlogRepository>(IocKeys.BlogRepository)
		.to(BlogRepository)
		.onActivation((_ctx, instance) => addTrace(instance));

	c.bind<BlogService>(IocKeys.BlogService)
		.to(BlogService)
		.onActivation((_ctx, instance) => addTrace(instance));

	c.bind<AuthorsController>(IocKeys.AuthorsController)
		.to(AuthorsController)
		.onActivation((_ctx, instance) => addTrace(instance));

	c.bind<PostsController>(IocKeys.PostsController)
		.to(PostsController)
		.onActivation((_ctx, instance) => addTrace(instance));
}

const container = new Container();
bind(container);

export { container };
