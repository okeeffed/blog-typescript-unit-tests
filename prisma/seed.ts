import { PrismaClient } from '@prisma/client';
import * as d from "../src/mocks/seed-data";
import { faker } from "@faker-js/faker"

faker.seed(0)

async function main() {
	const prisma = new PrismaClient();
	await prisma.author.createMany({ data: d.authorsSeedData });
	await prisma.post.createMany({ data: d.postsSeedData });
	await prisma.authorsToPosts.createMany({ data: d.authorsToPostsSeedData });
}

main().then(() => console.log("Seed data created"))
