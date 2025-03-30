import { PrismaClient } from '@prisma/client';
import * as d from "../src/mocks/seed-data";
import { faker } from "@faker-js/faker"
import { authorsToPostsFactory } from '@/mocks/author-to-posts-factory';

faker.seed(0)

async function main() {
	const prisma = new PrismaClient();

	const authors = d.authorsSeedData()
	await prisma.author.createMany({ data: authors });

	const publishedPosts = d.publishedPostsSeedData()
	await prisma.post.createMany({ data: publishedPosts });

	const unpublishedPosts = d.unpublishedPostSeedData()
	await prisma.post.createMany({ data: unpublishedPosts });

	const authorsToPosts = [...publishedPosts, ...unpublishedPosts].map((post, idx) => authorsToPostsFactory.build({ authorId: authors[idx % authors.length].id, postId: post.id }));
	await prisma.authorsToPosts.createMany({ data: authorsToPosts });
}

main().then(() => console.log("Seed data created"))
