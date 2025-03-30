
import { faker } from "@faker-js/faker";
import { authorFactory } from "./author-factory";
import { postFactory } from "./post-factory";
import { authorsToPostsFactory } from "./author-to-posts-factory";

// Use a seed for consistency
faker.seed(0);

export const authorsSeedData = authorFactory.buildList(10);
export const publishedPostsSeedData = postFactory.buildList(20);
export const unpublishedPostSeedData = postFactory.buildList(3, { published: false });
export const postsSeedData = [...publishedPostsSeedData, ...unpublishedPostSeedData];

export const authorsToPostsSeedData = [...publishedPostsSeedData, ...unpublishedPostSeedData].map((post, idx) => authorsToPostsFactory.build({ authorId: authorsSeedData[idx % authorsSeedData.length].id, postId: post.id }));
