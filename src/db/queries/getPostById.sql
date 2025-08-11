SELECT id, title, content, published, "createdAt", "updatedAt"
FROM "Post"
WHERE id = $1;