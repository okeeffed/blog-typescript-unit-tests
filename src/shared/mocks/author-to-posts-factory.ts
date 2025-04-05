import { faker } from "@faker-js/faker";
import type { AuthorsToPosts } from "@prisma/client";
import { Factory } from "fishery";

export const authorsToPostsFactory = Factory.define<AuthorsToPosts>(() => ({
  authorId: faker.string.uuid(),
  postId: faker.string.uuid(),
  assignedAt: new Date(Date.now()),
  role: "OWNER",
}));
