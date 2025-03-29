import { BlogRepository } from "../repositories/blog-repository";
import { RecordsClient } from "../clients/records-client";
import { CreateBlogBody } from "../schemas/schemas";

export class BlogService {
	private blogRepository: BlogRepository;
	private recordsClient: RecordsClient;

	constructor(blogRepository: BlogRepository, recordsClient: RecordsClient) {
		this.blogRepository = blogRepository;
		this.recordsClient = recordsClient;
	}

	async createBlog(ctx: { body: CreateBlogBody }) {
		const result = await this.blogRepository.createBlog(ctx);

		if (result.isOk()) {
			await this.recordsClient.putRecord({
				type: "CREATE",
				data: JSON.stringify(result.value),
			});
		}

		return result;
	}

	async unpublishBlog(ctx: { param: { blogId: string } }) {
		const result = await this.blogRepository.unpublishBlog(ctx);

		if (result.isOk()) {
			await this.recordsClient.putRecord({
				type: "DELETE",
				data: JSON.stringify(result.value),
			});
		}

		return result;
	}

	async getBlog(ctx: { param: { blogId: string } }) {
		return this.blogRepository.getBlog(ctx);
	}

	async getBlogs() {
		return this.blogRepository.getBlogs();
	}

	async getBloggers() {
		return this.blogRepository.getBloggers();
	}
}
