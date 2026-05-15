-- Enhanced access keys with scopes, rate limits, IP whitelist
ALTER TABLE access_keys 
    ADD COLUMN IF NOT EXISTS scopes JSONB DEFAULT '["email:read","email:write","mail:send"]'::jsonb,
    ADD COLUMN IF NOT EXISTS rate_limit_per_min INT DEFAULT 60,
    ADD COLUMN IF NOT EXISTS daily_limit INT DEFAULT 200000,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS allowed_ips TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Remove 1-key limit constraint if exists
DROP INDEX IF EXISTS idx_access_keys_one_active;
