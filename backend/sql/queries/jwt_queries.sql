-- name: CreateSession :one
INSERT INTO user_sessions (id, user_id, refresh_token, expires_at, user_agent)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetSession :one
SELECT * FROM user_sessions
WHERE id = $1 LIMIT 1;

-- name: RevokeUserSessions :exec
UPDATE user_sessions
SET is_revoked = TRUE
WHERE user_id = $1;

-- name: RevokeUserSessionByID :exec
UPDATE user_sessions
SET is_revoked = TRUE
WHERE id = $1;

-- name: RevokeSessionsByUA :exec
UPDATE user_sessions
SET is_revoked = TRUE
WHERE user_id = $1 AND user_agent = $2 AND is_revoked = FALSE;

-- name: UpdateUserSession :exec
UPDATE user_sessions
SET refresh_token = $1, expires_at = $2, user_agent = $3
WHERE id = $4;
