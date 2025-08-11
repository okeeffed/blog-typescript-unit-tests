import { authorsToPostsFactory } from "@/shared/mocks/author-to-posts-factory";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "@/db/client";
import * as d from "@/shared/mocks/seed-data";

faker.seed(0);

async function main() {
  const prisma = new PrismaClient();

  const authors = d.authorsSeedData();
  await prisma.author.createMany({ data: authors });

  const publishedPosts = d.publishedPostsSeedData();
  await prisma.post.createMany({ data: publishedPosts });

  const unpublishedPosts = d.unpublishedPostSeedData();
  await prisma.post.createMany({ data: unpublishedPosts });

  const authorsToPosts = [...publishedPosts, ...unpublishedPosts].map(
    (post, idx) =>
      authorsToPostsFactory.build({
        authorId: authors[idx % authors.length].id,
        postId: post.id,
      }),
  );
  await prisma.authorsToPosts.createMany({ data: authorsToPosts });
}

main().then(() => console.log("Seed data created"));
