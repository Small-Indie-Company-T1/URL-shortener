-- name: CreateClick :exec
INSERT INTO clicks (link_id, user_agent, referred_from, ip_address)
VALUES ($1, $2, $3, $4);