UPDATE "Post" 
SET published = false, "updatedAt" = NOW()
WHERE id = $1
RETURNING id, title, content, published, "createdAt", "updatedAt";