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

export const postSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	content: z.string().nullable(),
	published: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type AuthorEntity = z.infer<typeof authorSchema>;
expectType<TypeEqual<AuthorEntity, Author>>(true)

export type PostEntity = z.infer<typeof postSchema>;
expectType<TypeEqual<PostEntity, Post>>(true)

