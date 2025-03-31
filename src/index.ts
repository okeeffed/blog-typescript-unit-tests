import 'reflect-metadata'
import { OpenAPIHono } from '@hono/zod-openapi'

import { AuthorsController } from './controllers/authors-controller';
import { PostsController } from './controllers/posts-controller';
import { container } from "@/config/ioc";
import { IocKeys } from './config/ioc-keys'


export const app = new OpenAPIHono()

app.route('/v1/authors', container.get<AuthorsController>(IocKeys.AuthorsController))
app.route('/v1/posts', container.get<PostsController>(IocKeys.PostsController))


