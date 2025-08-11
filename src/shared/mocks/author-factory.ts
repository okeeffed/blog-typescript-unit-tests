import { faker } from "@faker-js/faker";
import type { Author } from "@/db/client";
import { Factory } from "fishery";

export const authorFactory = Factory.define<Author>(() => {
  const createdAt = new Date(faker.date.past());

  return {
    name: faker.person.fullName(),
    id: faker.string.uuid(),
    email: faker.internet.email(),
    updatedAt: createdAt,
    createdAt,
  };
});
