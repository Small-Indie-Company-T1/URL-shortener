-- name: CreateLink :one
INSERT INTO links (creator_id, original_url, short_code)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetLinkByCode :one
SELECT * FROM links
WHERE short_code = $1 AND is_deleted = false
LIMIT 1;

-- name: GetLinksByUserId :many
SELECT * FROM links
WHERE creator_id = $1 AND is_deleted = false
ORDER BY created_at DESC;

-- name: DeleteLink :one
UPDATE links
SET is_deleted = true
WHERE short_code = $1 AND creator_id = $2
RETURNING id;

-- name: CheckLinkExists :one
SELECT EXISTS(
    SELECT 1 FROM links
    WHERE short_code = $1 AND is_deleted = false
);