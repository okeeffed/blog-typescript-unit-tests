import { z } from "@hono/zod-openapi";
import type { Post } from "@prisma/client";
import { type TypeEqual, expectType } from "ts-expect";

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const postSchemaSerialised = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const postArraySchema = z.array(postSchemaSerialised);

export type PostEntity = z.infer<typeof postSchema>;
expectType<TypeEqual<PostEntity, Post>>(true);

export const createBlogBody = z.object({
  title: z.string(),
  content: z.string(),
});
export type CreateBlogBody = z.infer<typeof createBlogBody>;

export const unpublishBlogParam = z.object({
  blogId: z.string().uuid(),
});
export type UnpublishBlogParam = z.infer<typeof unpublishBlogParam>;

export const getBlogParam = z.object({
  blogId: z
    .string()
    .uuid()
    .openapi({
      param: {
        in: "path",
        required: true,
        description: "The ID of the blog",
      },
    }),
});
export type GetBlogParam = z.infer<typeof getBlogParam>;

export const getBlogsRawQuery = z.object({
  published: z.string().optional(),
});
export type GetBlogsRawQuery = z.infer<typeof getBlogsRawQuery>;

export const getBlogsQuery = z.object({
  published: z.preprocess(
    (val) => {
      switch (val) {
        case "true":
          return true;
        case "false":
          return false;
        default:
          return undefined;
      }
    },
    z
      .boolean()
      .optional()
      .openapi({
        param: {
          in: "query",
          required: false,
          description: "Filter by published status",
        },
      }),
  ),
});
export type GetBlogsQuery = z.infer<typeof getBlogsQuery>;

export const getBlogById200Response = postSchema.nullable();
export const getBlogById404Response = z.object({
  blogId: z.string(),
  message: z.string(),
});
