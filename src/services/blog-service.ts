import { IocKeys } from "@/config/ioc-keys";
import { inject, injectable } from "inversify";
import type { RecordsClient } from "../clients/records-client";
import type { BlogRepository } from "../repositories/blog-repository";
import type {
  CreateBlogBody,
  GetBlogParam,
  GetBlogsQuery,
} from "@/shared/schemas/post";

@injectable()
export class BlogService {
  private blogRepository: BlogRepository;
  private recordsClient: RecordsClient;

  constructor(
    @inject(IocKeys.BlogRepository) blogRepository: BlogRepository,
    @inject(IocKeys.RecordsClient) recordsClient: RecordsClient,
  ) {
    this.blogRepository = blogRepository;
    this.recordsClient = recordsClient;
  }

  async createBlog(ctx: { body: CreateBlogBody }) {
    const result = await this.blogRepository.createBlog(ctx);

    await this.recordsClient.putRecord({
      type: "CREATE",
      data: JSON.stringify(result.value),
    });

    return result;
  }

  async unpublishBlog(ctx: { param: { blogId: string } }) {
    const result = await this.blogRepository.unpublishBlog(ctx);

    // NOTE: This is simplified and not handling any edge cases.
    // More for demonstrating MSW in action.
    await this.recordsClient.putRecord({
      type: "DELETE",
      data: JSON.stringify(result.value),
    });

    return result;
  }

  async getBlog(ctx: { param: GetBlogParam }) {
    return this.blogRepository.getBlog(ctx);
  }

  async getBlogs(ctx: { query: GetBlogsQuery }) {
    return this.blogRepository.getBlogs(ctx);
  }

  async getBloggers() {
    return this.blogRepository.getBloggers();
  }
}
