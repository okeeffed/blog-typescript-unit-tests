import type { PrismaClient } from "@prisma/client"
import type { Keyv } from 'keyv';
import { ok } from "neverthrow";
import { authorArraySchema, CreateBlogBody, GetBlogParam, GetBlogsQuery, UnpublishBlogParam } from "../schemas/schemas";


export class BlogRepository {
	postgresClient: PrismaClient;
	cacheClient: Keyv<any>;

	constructor(postgresClient: PrismaClient, cacheClient: Keyv<any>) {
		this.postgresClient = postgresClient;
		this.cacheClient = cacheClient;
	}

	async createBlog(ctx: { body: CreateBlogBody }) {
		const blog = await this.postgresClient.post.create({
			data: {
				title: ctx.body.title,
				content: ctx.body.content,
				published: true,
			},
		});

		return ok(blog);
	}

	async unpublishBlog(ctx: { param: UnpublishBlogParam }) {
		await this.cacheClient.delete(ctx.param.blogId);

		const blog = await this.postgresClient.post.update({
			where: {
				id: ctx.param.blogId,
			},
			data: {
				published: false,
			},
		});

		return ok(blog);
	}

	async getBlog(ctx: { param: GetBlogParam }) {
		const cachedResult = await this.cacheClient.get(ctx.param.blogId);
		if (cachedResult) {
			return ok(JSON.parse(cachedResult));
		}

		const blog = await this.postgresClient.post.findUnique({
			where: {
				id: ctx.param.blogId,
			},
		});

		return ok(blog);
	}

	async getBlogs(ctx: { query: GetBlogsQuery }) {
		const cachedResult = await this.cacheClient.get('blogs');
		if (cachedResult) {
			return ok(JSON.parse(cachedResult));
		}

		const blogs = await this.postgresClient.post.findMany({
			where: {
				published: ctx.query.published,
			},
		});
		return ok(blogs);
	}

	async getBloggers() {
		const cachedResult = await this.cacheClient.get('bloggers');
		if (cachedResult) {
			const parsedResult = await authorArraySchema.safeParseAsync(JSON.parse(cachedResult));

			if (parsedResult.success) {
				return ok(parsedResult.data);
			}
		}

		const bloggers = await this.postgresClient.author.findMany();
		return ok(bloggers);
	}
}
