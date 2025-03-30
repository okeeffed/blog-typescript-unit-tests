import { PrismaClient } from '@prisma/client';
import * as d from "../src/mocks/seed-data";

async function main() {
	const prisma = new PrismaClient();
	await prisma.author.createMany({ data: d.authorsSeedData });
	await prisma.post.createMany({ data: d.postsSeedData });
	await prisma.authorsToPosts.createMany({ data: d.authorsToPostsSeedData });
}

main().then(() => console.log("Seed data created"))
