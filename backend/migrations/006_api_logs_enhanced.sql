-- Enhanced API logs
ALTER TABLE api_logs 
    ADD COLUMN IF NOT EXISTS ip INET,
    ADD COLUMN IF NOT EXISTS country VARCHAR(2),
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS response_ms INT,
    ADD COLUMN IF NOT EXISTS status_code INT,
    ADD COLUMN IF NOT EXISTS method VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_api_logs_token_ts ON api_logs(token_id, timestamp DESC);
