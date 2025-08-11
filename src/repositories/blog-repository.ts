import { BlogNotFoundError } from "@/errors/blog-not-found-error";
import { err, ok } from "neverthrow";
import superjson from "superjson";
import type { IKeyvClient } from "@/lib/keyv";
import type { IPrismaClient } from "@/lib/prisma";
import {
  postSchema,
  type CreateBlogBody,
  type GetBlogParam,
  type GetBlogsQuery,
  type UnpublishBlogParam,
} from "@/shared/schemas/post";
import { authorSchema } from "@/shared/schemas/author";
import { BlogData } from "@/models/blog-data";
import { createPost, unpublishPost, getPostById, getPostsByPublished, getAllAuthors } from '@/db/sql'

export class BlogRepository {
  private postgresClient: IPrismaClient;
  private cacheClient: IKeyvClient;

  constructor({
    prismaClient,
    keyvClient,
  }: {
    prismaClient: IPrismaClient;
    keyvClient: IKeyvClient;
  }) {
    this.postgresClient = prismaClient;
    this.cacheClient = keyvClient;
  }

  async createBlog(ctx: { body: CreateBlogBody }) {
    const [blog] = await this.postgresClient.$queryRawTyped(createPost(ctx.body.title, ctx.body.content))

    if (!blog) {
      throw new Error("No blog created")
    }

    return ok(new BlogData(blog));
  }

  async unpublishBlog(ctx: { param: UnpublishBlogParam }) {
    await this.cacheClient.delete(ctx.param.blogId);

    const [blog] = await this.postgresClient.$queryRawTyped(unpublishPost(ctx.param.blogId));

    if (!blog) {
      throw new Error("No blog found to unpublish");
    }

    return ok(new BlogData(blog));
  }

  async getBlog(ctx: { param: GetBlogParam }) {
    const cachedResult = await this.cacheClient.get(ctx.param.blogId);
    if (cachedResult) {
      return ok({ data: new BlogData(JSON.parse(cachedResult)), _cacheHit: true });
    }

    const [blog] = await this.postgresClient.$queryRawTyped(getPostById(ctx.param.blogId));

    if (!blog) {
      return err(new BlogNotFoundError(ctx.param.blogId));
    }

    await this.cacheClient.set(
      ctx.param.blogId,
      JSON.stringify(blog),
      1000 * 60 * 1,
    );
    return ok({ data: new BlogData(blog), _cacheHit: false });
  }

  async getBlogs(ctx: { query: GetBlogsQuery }) {
    const key = `getBlogs ${JSON.stringify(ctx.query)}`;
    const cachedResult = await this.cacheClient.get(key);
    if (cachedResult) {
      const parsedResult = await postSchema.array().safeParseAsync(superjson.parse(cachedResult))

      if (parsedResult.success) {
        const serialisedData = parsedResult.data.map(d => new BlogData(d))
        return ok({ data: serialisedData, _cacheHit: true });
      } else {
        return err(new Error('Failed'))
      }

    }

    const blogs = await this.postgresClient.$queryRawTyped(getPostsByPublished(ctx.query.published));

    await this.cacheClient.set(key, superjson.stringify(blogs), 1000 * 60 * 1);
    return ok({ data: blogs.map(d => new BlogData(d)), _cacheHit: false });
  }

  async getBloggers() {
    const cachedResult = await this.cacheClient.get("bloggers");
    if (cachedResult) {
      const parsedResult = await authorSchema
        .array()
        .safeParseAsync(superjson.parse(cachedResult));

      if (parsedResult.success) {
        return ok({ data: parsedResult.data, _cacheHit: true });
      } else {
        return err(new Error('Failed'))
      }
    }

    const bloggers = await this.postgresClient.$queryRawTyped(getAllAuthors());
    await this.cacheClient.set(
      "bloggers",
      superjson.stringify(bloggers),
      1000 * 60 * 1,
    );
    return ok({ data: bloggers, _cacheHit: false });
  }
}
