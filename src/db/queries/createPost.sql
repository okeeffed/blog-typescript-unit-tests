INSERT INTO "Post" (id, title, content, published, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
RETURNING id, title, content, published, "createdAt", "updatedAt";