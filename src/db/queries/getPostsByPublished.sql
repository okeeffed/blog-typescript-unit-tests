SELECT id, title, content, published, "createdAt", "updatedAt"
FROM "Post"
WHERE published = $1;