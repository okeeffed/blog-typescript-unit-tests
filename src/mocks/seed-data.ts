import { faker } from "@faker-js/faker";
import { authorFactory } from "./author-factory";
import { authorsToPostsFactory } from "./author-to-posts-factory";
import { postFactory } from "./post-factory";

// Use a seed for consistency
faker.seed(0);

export const authorsSeedData = () => authorFactory.buildList(10);
export const publishedPostsSeedData = () => postFactory.buildList(3);
export const unpublishedPostSeedData = () =>
  postFactory.buildList(3, { published: false });
