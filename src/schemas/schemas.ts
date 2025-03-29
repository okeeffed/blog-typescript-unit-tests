import { z } from "zod";
import type { Author, Post } from '@prisma/client'
import { TypeEqual, expectType } from 'ts-expect'

export const authorSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	name: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const authorArraySchema = z.array(authorSchema);

export const postSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	content: z.string().nullable(),
	published: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
export const postArraySchema = z.array(postSchema);

export type AuthorEntity = z.infer<typeof authorSchema>;
expectType<TypeEqual<AuthorEntity, Author>>(true)

export type PostEntity = z.infer<typeof postSchema>;
expectType<TypeEqual<PostEntity, Post>>(true)

/**
 * Request schemas
 */
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
	blogId: z.string().uuid(),
});
export type GetBlogParam = z.infer<typeof getBlogParam>;

