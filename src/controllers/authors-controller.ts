import { Hono } from 'hono'
import { BlogService } from '../services/blog-service'
import pino from 'pino'

const app = new Hono()
const blogService = new BlogService(pino())


app.get('/authors', async (c) => {
	const result = await blogService.getBloggers()

	return c.text('Hello Hono!')
})

export default app

