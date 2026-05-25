-- name: CreateClick :exec
WITH inserted_click AS (
    INSERT INTO clicks (link_id, user_agent, referred_from, ip_address)
    VALUES ($1, $2, $3, $4)
    RETURNING link_id
)
UPDATE links
SET clicks_count = clicks_count + 1
WHERE id = (SELECT link_id FROM inserted_click);

-- name: GetTotalClicksByLinkId :one
SELECT COUNT(*) FROM clicks
WHERE link_id = $1;

-- name: GetUniqueIPClickStats :one
SELECT COUNT(DISTINCT ip_address) FROM clicks
WHERE link_id = $1;

-- name: GetLatestClicksByLinkId :many
SELECT id, link_id, user_agent, referred_from, ip_address, clicked_at
FROM clicks
WHERE link_id = $1
ORDER BY clicked_at DESC
LIMIT $2 OFFSET $3;