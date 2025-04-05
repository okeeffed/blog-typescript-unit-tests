import { authorFactory } from "@/shared/mocks/author-factory";
import { postFactory } from "@/shared/mocks/post-factory";
import { faker } from "@faker-js/faker";
import type { Author, Post, PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, test } from "vitest";
import { IocKeys } from "@/config/ioc-keys";
import { container } from "@/config/ioc-test";
import type { BlogRepository } from "./blog-repository";

describe("BlogRepository", () => {
  let blogRepository: BlogRepository;
  let prisma: PrismaClient;

  beforeEach(() => {
    blogRepository = container.get<BlogRepository>(IocKeys.BlogRepository);
    prisma = container.get<PrismaClient>(IocKeys.PrismaClient);
  });

  describe("createBlog", () => {
    test("createBlog", async () => {
      const result = await blogRepository.createBlog({
        body: { title: "title", content: "content" },
      });
      expect(result.isOk()).toBe(true);
      expect(result.value.title).toBe("title");
      expect(result.value.content).toBe("content");

      await prisma.post.delete({ where: { id: result.value.id } });
    });
  });

  describe("unpublishBlog", () => {
    test("can set a blog to unpublished", async () => {
      const createResult = await blogRepository.createBlog({
        body: { title: "title", content: "content" },
      });
      const result = await blogRepository.unpublishBlog({
        param: { blogId: createResult.value.id },
      });
      expect(result.isOk()).toBe(true);
      expect(result.value.published).toBe(false);
      await prisma.post.delete({ where: { id: createResult.value.id } });
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

    test("can get a blog", async () => {
      const result = await blogRepository.getBlog({
        param: { blogId: post.id },
      });
      expect(result.isOk()).toBe(true);
      result.map((value) => {
        expect(value.data?.title).toBe(post.title);
        expect(value.data?.content).toBe(post.content);
      });
    });

    test("can retrieve a blog from cache", async () => {
      const noCacheResult = await blogRepository.getBlog({
        param: { blogId: post.id },
      });
      expect(noCacheResult.isOk()).toBe(true);
      noCacheResult.map((value) => {
        expect(value._cacheHit).toBe(false);
      });

      const result = await blogRepository.getBlog({
        param: { blogId: post.id },
      });
      expect(result.isOk()).toBe(true);
      result.map((value) => {
        expect(value._cacheHit).toBe(true);
      });
    });

    test("returns BlogNotFoundError when there is no matching blog found", async () => {
      const result = await blogRepository.getBlog({
        param: { blogId: faker.string.uuid() },
      });
      expect(result.isErr()).toBe(true);
      result.mapErr((e) => {
        expect(e._tag).toBe("BlogNotFoundError");
      });
    });
  });

  describe("getBlogs", () => {
    let posts: Post[];

    beforeEach(async () => {
      const timestamp = new Date();
      posts = postFactory.buildList(3, {
        createdAt: timestamp,
        updatedAt: timestamp,
        published: true,
      });

      await prisma.post.createMany({
        data: posts,
      });
    });

    test("can get blogs", async () => {
      const result = await blogRepository.getBlogs({
        query: { published: true },
      });
      expect(result.isOk()).toBe(true);
      expect(result.value.data).toEqual(posts);
    });

    test("can retrieve blogs from cache", async () => {
      const noCacheResult = await blogRepository.getBlogs({
        query: { published: true },
      });
      expect(noCacheResult.isOk()).toBe(true);
      expect(noCacheResult.value._cacheHit).toBe(false);

      const result = await blogRepository.getBlogs({
        query: { published: true },
      });
      expect(result.isOk()).toBe(true);
      expect(result.value._cacheHit).toBe(true);
    });
  });

  describe("getBloggers", () => {
    let authors: Author[];

    beforeEach(async () => {
      const timestamp = new Date();
      authors = authorFactory.buildList(3, {
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await prisma.author.createMany({
        data: authors,
      });
    });

    test("can get bloggers", async () => {
      const result = await blogRepository.getBloggers();
      expect(result.isOk()).toBe(true);
      expect(result.value.data).toEqual(authors);
    });

    test("can retrieve bloggers from cache", async () => {
      const noCacheResult = await blogRepository.getBloggers();
      expect(noCacheResult.isOk()).toBe(true);
      expect(noCacheResult.value._cacheHit).toBe(false);

      const result = await blogRepository.getBloggers();
      expect(result.isOk()).toBe(true);
      expect(result.value._cacheHit).toBe(true);
    });
  });
});
