-- Enhanced messages with spam score, labels, starring, snippet
ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS spam_score FLOAT DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS snippet TEXT;

-- Update existing messages to have snippets
UPDATE messages SET snippet = LEFT(body_text, 140) WHERE snippet IS NULL AND body_text IS NOT NULL;

-- Full text search
ALTER TABLE messages ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE messages SET search_vector = to_tsvector('english', COALESCE(subject, '') || ' ' || COALESCE(body_text, '\'));
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_messages_email_received ON messages(email_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_starred ON messages(email_id, is_starred) WHERE is_starred = TRUE;
