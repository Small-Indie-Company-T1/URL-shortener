-- name: CreateLink :one
INSERT INTO links (creator_id, original_url, short_code)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetLinkByCode :one
SELECT * FROM links
WHERE short_code = $1 AND is_deleted = false AND is_active = TRUE
LIMIT 1;

-- name: GetLinksByUserId :many
SELECT * FROM links
WHERE creator_id = sqlc.arg('creator_id')
    AND is_deleted = false
    AND (
        original_url ILIKE '%' || sqlc.narg('original_url') || '%'
        OR sqlc.narg('original_url') IS NULL
    )
    AND (
        is_active = sqlc.narg('is_active')
        OR sqlc.narg('is_active') IS NULL
    )
ORDER BY
    CASE WHEN sqlc.arg('order_by')::text = 'created_at' AND sqlc.arg('order_dir')::text = 'asc' THEN created_at END ASC,
    CASE WHEN sqlc.arg('order_by')::text = 'created_at' AND sqlc.arg('order_dir')::text = 'desc' THEN created_at END DESC,
    CASE WHEN sqlc.arg('order_by')::text = 'clicks' AND sqlc.arg('order_dir')::text = 'asc' THEN clicks_count END ASC,
    CASE WHEN sqlc.arg('order_by')::text = 'clicks' AND sqlc.arg('order_dir')::text = 'desc' THEN clicks_count END DESC,
    created_at DESC
LIMIT sqlc.narg('limit') OFFSET sqlc.narg('offset');

-- name: GetLinksCountByUserId :one
SELECT COUNT(*) FROM links
WHERE creator_id = sqlc.arg('creator_id')
    AND is_deleted = false
    AND (
        original_url ILIKE '%' || sqlc.narg('original_url') || '%' 
        OR sqlc.narg('original_url') IS NULL
    )
    AND (
        is_active = sqlc.narg('is_active') 
        OR sqlc.narg('is_active') IS NULL
    );

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