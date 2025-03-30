import 'reflect-metadata'
import pino from 'pino'
import { createKeyv } from "@keyv/valkey"
import { PrismaClient } from '@prisma/client'
import { OpenAPIHono } from '@hono/zod-openapi'

import { BlogService } from './services/blog-service'
import { BlogRepository } from './repositories/blog-repository'
import { RecordsClient } from './clients/records-client'
import { addTraceCurried } from './proxies/add-trace'
import { AuthorsController } from './controllers/authors-controller';
import { PostsController } from './controllers/posts-controller';

const prismaClient = new PrismaClient()
const keyv = createKeyv(process.env.VALKEY_URL!) // omitted validation for brevity
const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true
		}
	}
})

const addTrace = addTraceCurried(logger)

const blogRepository = addTrace(new BlogRepository(prismaClient, keyv))
const recordsClient = addTrace(new RecordsClient())
const blogService = addTrace(new BlogService(blogRepository, recordsClient))

const authorsController = addTrace(new AuthorsController(blogService))
const postsController = addTrace(new PostsController(blogService))


export const app = new OpenAPIHono()

app.route('/v1/authors', authorsController)
app.route('/v1/posts', postsController)


