import { authorFactory } from "./author-factory";
import { postFactory } from "./post-factory";

export const authorsSeedData = () => authorFactory.buildList(10);
export const publishedPostsSeedData = () => postFactory.buildList(3);
export const unpublishedPostSeedData = () =>
  postFactory.buildList(3, { published: false });
