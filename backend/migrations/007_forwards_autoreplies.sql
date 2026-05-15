-- Email forwarding
CREATE TABLE IF NOT EXISTS forwards (
    id SERIAL PRIMARY KEY,
    email_id INT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    forward_to VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_forwards_email ON forwards(email_id);

-- Auto-replies
CREATE TABLE IF NOT EXISTS auto_replies (
    id SERIAL PRIMARY KEY,
    email_id INT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    subject VARCHAR(255) DEFAULT 'Auto-Reply',
    body TEXT NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_auto_replies_email ON auto_replies(email_id);
