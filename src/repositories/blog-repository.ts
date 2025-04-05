import { BlogNotFoundError } from "@/errors/blog-not-found-error";
import type { Post } from "@prisma/client";
import { inject, injectable } from "inversify";
import { err, ok } from "neverthrow";
import superjson from "superjson";
import { IocKeys } from "@/config/ioc-keys";
import type { IKeyvClient } from "@/lib/keyv";
import type { IPrismaClient } from "@/lib/prisma";
import type {
  CreateBlogBody,
  GetBlogParam,
  GetBlogsQuery,
  UnpublishBlogParam,
} from "@/shared/schemas/post";
import { authorSchema } from "@/shared/schemas/author";

@injectable()
export class BlogRepository {
  private postgresClient: IPrismaClient;
  private cacheClient: IKeyvClient;

  constructor(
    @inject(IocKeys.PrismaClient) postgresClient: IPrismaClient,
    @inject(IocKeys.KeyvClient) cacheClient: IKeyvClient,
  ) {
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
      return ok({ data: JSON.parse(cachedResult) as Post, _cacheHit: true });
    }

    const blog = await this.postgresClient.post.findUnique({
      where: {
        id: ctx.param.blogId,
      },
    });

    if (!blog) {
      return err(new BlogNotFoundError(ctx.param.blogId));
    }

    await this.cacheClient.set(
      ctx.param.blogId,
      JSON.stringify(blog),
      1000 * 60 * 1,
    );
    return ok({ data: blog, _cacheHit: false });
  }

  async getBlogs(ctx: { query: GetBlogsQuery }) {
    const key = `getBlogs ${JSON.stringify(ctx.query)}`;
    const cachedResult = await this.cacheClient.get(key);
    if (cachedResult) {
      return ok({ data: JSON.parse(cachedResult), _cacheHit: true });
    }

    const blogs = await this.postgresClient.post.findMany({
      where: {
        published: ctx.query.published,
      },
    });

    await this.cacheClient.set(key, JSON.stringify(blogs), 1000 * 60 * 1);
    return ok({ data: blogs, _cacheHit: false });
  }

  async getBloggers() {
    const cachedResult = await this.cacheClient.get("bloggers");
    if (cachedResult) {
      const parsedResult = await authorSchema
        .array()
        .safeParseAsync(superjson.parse(cachedResult));

      if (parsedResult.success) {
        return ok({ data: parsedResult.data, _cacheHit: true });
      }
    }

    const bloggers = await this.postgresClient.author.findMany();
    await this.cacheClient.set(
      "bloggers",
      superjson.stringify(bloggers),
      1000 * 60 * 1,
    );
    return ok({ data: bloggers, _cacheHit: false });
  }
}
