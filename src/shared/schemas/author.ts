import { z } from "@hono/zod-openapi";
import type { Author } from "@prisma/client";
import { type TypeEqual, expectType } from "ts-expect";

export const authorSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const authorSchemaSerialised = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const authorArraySchema = z.array(authorSchemaSerialised);

export type AuthorEntity = z.infer<typeof authorSchema>;
expectType<TypeEqual<AuthorEntity, Author>>(true);
