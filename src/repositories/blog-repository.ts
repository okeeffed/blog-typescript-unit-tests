import type { Author, PrismaClient } from "@prisma/client"
import type { Keyv } from 'keyv';


export class BlogRepository<T> {
	postgresClient: PrismaClient;
	cacheClient: Keyv<T>;

	constructor(postgresClient: PrismaClient, cacheClient: Keyv<T>) {
		this.postgresClient = postgresClient;
		this.cacheClient = cacheClient;
	}

	async createBlog() {
		// TODO
	}

	async deleteBlog() {
		// TODO
	}

	async getBlogs() {
		// TODO
	}

	async getBloggers() {
		const cachedResult = await this.cacheClient.get<Author[]>('bloggers');
		if (cachedResult) {
			return this.cacheClient.get('bloggers');
		}

		// TODO
		const bloggers = await this.postgresClient.author.findMany();

		return bloggers;
	}
}
