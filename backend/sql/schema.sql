DROP TABLE IF EXISTS clicks;
DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_sessions;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    creator_id UUID NOT NULL REFERENCES users(id),
    original_url VARCHAR(2047) NOT NULL,
    short_code VARCHAR(15) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX links_original_idx ON links (original_url);
CREATE INDEX links_code_idx ON links (short_code);
CREATE INDEX links_creator_idx ON links (creator_id);

CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    user_agent TEXT,
    referred_from TEXT,
    ip_address INET,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clicks_link_idx ON clicks (link_id);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE ,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX sessions_token_idx ON user_sessions (refresh_token);
CREATE INDEX sessions_user_idx ON user_sessions (user_id);