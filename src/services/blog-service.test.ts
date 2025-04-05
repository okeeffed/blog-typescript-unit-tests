import { authorFactory } from "@/shared/mocks/author-factory";
import { postFactory } from "@/shared/mocks/post-factory";
import type { CreateBlogBody } from "@/shared/schemas/post";
import { faker } from "@faker-js/faker";
import type { Author, Post, PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, test } from "vitest";
import { IocKeys } from "../config/ioc-keys";
import { container } from "../config/ioc-test";
import type { BlogService } from "./blog-service";

describe("BlogService", () => {
  let blogService: BlogService;
  let prisma: PrismaClient;

  beforeEach(() => {
    blogService = container.get<BlogService>(IocKeys.BlogService);
    prisma = container.get<PrismaClient>(IocKeys.PrismaClient);
  });

  describe("createBlog", () => {
    test("creates and returns a blog post and putRecordResult", async () => {
      const createBlogBody: CreateBlogBody = {
        title: "title",
        content: "content",
      };
      const result = await blogService.createBlog({ body: createBlogBody });

      expect(result.isOk()).toBe(true);
      expect(result.value.title).toBe("title");
      expect(result.value.content).toBe("content");

      await prisma.post.delete({
        where: {
          id: result.value.id,
        },
      });
    });
  });

  describe("unpublishBlog", () => {
    let post: Post;

    beforeEach(async () => {
      post = postFactory.build();
      await prisma.post.create({
        data: post,
      });
    });

    test("can set the published value of a blog post to false", async () => {
      const result = await blogService.unpublishBlog({
        param: { blogId: post.id },
      });
      expect(result.isOk()).toBe(true);
      expect(result.value.published).toBe(false);
    });
  });

  describe("getBlog", () => {
    let post: Post;

    beforeEach(async () => {
      post = postFactory.build();
      await prisma.post.create({
        data: post,
      });
    });

    test("can get a blog by ID", async () => {
      const result = await blogService.getBlog({ param: { blogId: post.id } });

      expect(result.isOk()).toBe(true);
      result.map((value) => {
        expect(value.data?.title).toBe(post.title);
        expect(value.data?.content).toBe(post.content);
      });
    });

    test("returns BlogNotFoundError when the id does not exist", async () => {
      const result = await blogService.getBlog({
        param: { blogId: faker.string.uuid() },
      });

      expect(result.isErr()).toBe(true);
      result.mapErr((e) => {
        expect(e._tag).toBe("BlogNotFoundError");
      });
    });
  });

  describe("getBlogs", () => {
    let publishedPosts: Post[];
    let unpublishedPosts: Post[];
    let allPosts: Post[];

    beforeEach(async () => {
      const timestamp = new Date();
      publishedPosts = postFactory.buildList(5, {
        published: true,
        updatedAt: timestamp,
        createdAt: timestamp,
      });
      unpublishedPosts = postFactory.buildList(5, {
        published: false,
        updatedAt: timestamp,
        createdAt: timestamp,
      });
      allPosts = [...publishedPosts, ...unpublishedPosts];

      await prisma.post.createMany({
        data: allPosts,
      });
    });

    test("can list all available blogs", async () => {
      const result = await blogService.getBlogs({ query: { published: true } });
      expect(result.isOk()).toBe(true);

      expect(result.value.data).toEqualSortedBy(publishedPosts, "id");
    });
  });

  describe("getBloggers", () => {
    let authors: Author[];

    beforeEach(async () => {
      const timestamp = new Date();
      authors = authorFactory.buildList(10, {
        updatedAt: timestamp,
        createdAt: timestamp,
      });
      await prisma.author.createMany({
        data: authors,
      });
    });

    test("can list all blog authors", async () => {
      const result = await blogService.getBloggers();

      expect(result.isOk()).toBe(true);
      expect(result.value.data).toEqualSortedBy(authors, "id");
    });
  });
});
