import { faker } from "@faker-js/faker";
import type { Post } from "@prisma/client";
import { Factory } from "fishery";

export const postFactory = Factory.define<Post>(() => {
  const createdAt = new Date(faker.date.past());

  return {
    title: faker.lorem.sentence(),
    id: faker.string.uuid(),
    content: faker.lorem.paragraph(),
    published: true,
    updatedAt: createdAt,
    createdAt,
  };
});
