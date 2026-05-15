// Additional API routes: access keys, send mail, endpoint docs, API-key auth
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const DKIM_PRIVATE_KEY = (() => {
  try { return fs.readFileSync(path.join(__dirname, '..', 'dkim', 'private.key'), 'utf8'); }
  catch (e) { return null; }
})();

const ENDPOINT_CATALOG = [
  { method: 'POST', path: '/api/v1/auth/signup', auth: 'none', tokens: 0, desc: 'Generate a new 40-char user token' },
  { method: 'POST', path: '/api/v1/auth/login', auth: 'token (body)', tokens: 0, desc: 'Login with user token, returns JWT session' },
  { method: 'POST', path: '/api/v1/email/create', auth: 'session OR access-key', tokens: 5, desc: 'Create new temp email (body: {type:"random|custom", name, subdomain})' },
  { method: 'GET',  path: '/api/v1/email/list', auth: 'session OR access-key', tokens: 0, desc: 'List your active temp emails' },
  { method: 'GET',  path: '/api/v1/email/:id/messages', auth: 'session OR access-key', tokens: 3, desc: 'List messages received for an email' },
  { method: 'GET',  path: '/api/v1/email/:id/messages/:msgId', auth: 'session OR access-key', tokens: 1, desc: 'Get a single message body (text + html)' },
  { method: 'DELETE', path: '/api/v1/email/:id', auth: 'session OR access-key', tokens: 2, desc: 'Delete a temp email (and its messages)' },
  { method: 'GET',  path: '/api/v1/token/usage', auth: 'session OR access-key', tokens: 0, desc: 'Get today\'s token usage and limits' },
  { method: 'GET',  path: '/api/v1/keys', auth: 'session', tokens: 0, desc: 'List your API access keys (no secrets shown)' },
  { method: 'POST', path: '/api/v1/keys/create', auth: 'session', tokens: 0, desc: 'Create an API access key (only 1 active at a time; full key returned ONCE)' },
  { method: 'DELETE', path: '/api/v1/keys/:id', auth: 'session', tokens: 0, desc: 'Revoke / delete an access key' },
  { method: 'POST', path: '/api/v1/mail/send', auth: 'session OR access-key', tokens: 5, desc: 'Send outbound email from one of your temp addresses. Body: {emailId, to, subject, body}' },
  { method: 'GET',  path: '/api/v1/docs/endpoints', auth: 'none', tokens: 0, desc: 'Get this endpoint catalog (public)' }
];

function generateAccessKey() {
  // mtak_ = mail-temp access key, then 36 url-safe chars
  const raw = crypto.randomBytes(27).toString('base64').replace(/[+/=]/g, '').slice(0, 36);
  return 'mtak_' + raw;
}

function mountExtra(app, pool, redisClient) {
  // ---- Public docs ----
  app.get('/api/v1/docs/endpoints', (req, res) => {
    res.json({ success: true, endpoints: ENDPOINT_CATALOG, base_url: 'https://' + (req.get('host') || 'temp.amitbrand.shop'), tokens_consumed: 0 });
  });

  // ---- Combined auth middleware: accepts session JWT/token OR X-API-Key access key ----
  async function flexAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      if (!apiKey.startsWith('mtak_') || apiKey.length !== 41) {
        return res.status(401).json({ error: 'Invalid X-API-Key format' });
      }
      try {
        const keyHash = hashToken(apiKey);
        const r = await pool.query(
          'SELECT id, token_id FROM access_keys WHERE key_hash = $1 AND is_active = TRUE',
          [keyHash]
        );
        if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid or revoked API key' });
        req.tokenId = r.rows[0].token_id;
        req.accessKeyId = r.rows[0].id;
        pool.query('UPDATE access_keys SET last_used_at = NOW() WHERE id = $1', [r.rows[0].id]).catch(() => {});
        return next();
      } catch (err) {
        console.error('API key auth error:', err);
        return res.status(500).json({ error: 'Auth failed' });
      }
    }
    // Fall through to the existing authMiddleware on req chain (already attached for these endpoints)
    return next();
  }

  // ---- Per-key/IP rate limit on sensitive endpoints ----
  const sendLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30, // 30 sends per minute
    keyGenerator: (req) => req.headers['x-api-key'] || req.tokenId || req.ip,
    message: { error: 'Send rate limit exceeded. Max 30 emails/minute.' }
  });

  // ---- Helper to use BOTH flex auth AND original auth ----
  function dualAuth(originalAuth) {
    return async (req, res, next) => {
      if (req.headers['x-api-key']) return flexAuth(req, res, next);
      return originalAuth(req, res, next);
    };
  }

  // ---- Access keys CRUD (session-only) ----
  // We expect the original authMiddleware to be passed in. We attach via app.locals.
  const sessionAuth = app.locals.authMiddleware;
  const consumeTokens = app.locals.consumeTokens;

  app.get('/api/v1/keys', sessionAuth, async (req, res) => {
    try {
      const r = await pool.query(
        'SELECT id, key_prefix, name, is_active, last_used_at, created_at FROM access_keys WHERE token_id = $1 ORDER BY created_at DESC',
        [req.tokenId]
      );
      res.json({ success: true, keys: r.rows, tokens_consumed: 0 });
    } catch (err) {
      console.error('List keys error:', err);
      res.status(500).json({ error: 'Failed to list keys' });
    }
  });

  app.post('/api/v1/keys/create', sessionAuth, async (req, res) => {
    try {
      const existing = await pool.query(
        'SELECT COUNT(*)::int as c FROM access_keys WHERE token_id = $1 AND is_active = TRUE',
        [req.tokenId]
      );
      if (existing.rows[0].c >= 1) {
        return res.status(409).json({ error: 'You already have an active API key. Delete it before creating a new one.' });
      }
      const key = generateAccessKey();
      const keyHash = hashToken(key);
      const keyPrefix = key.slice(0, 12);
      const name = (req.body && req.body.name) ? String(req.body.name).slice(0, 100) : 'Default Key';
      const r = await pool.query(
        'INSERT INTO access_keys (token_id, key_hash, key_prefix, name) VALUES ($1, $2, $3, $4) RETURNING id, key_prefix, name, created_at',
        [req.tokenId, keyHash, keyPrefix, name]
      );
      res.status(201).json({
        success: true,
        message: 'Save this key now — it will not be shown again.',
        api_key: key,
        key: r.rows[0],
        usage_header: 'X-API-Key: ' + key,
        tokens_consumed: 0
      });
    } catch (err) {
      console.error('Create key error:', err);
      res.status(500).json({ error: 'Failed to create access key' });
    }
  });

  app.delete('/api/v1/keys/:id', sessionAuth, async (req, res) => {
    try {
      const r = await pool.query(
        'DELETE FROM access_keys WHERE id = $1 AND token_id = $2 RETURNING id',
        [req.params.id, req.tokenId]
      );
      if (r.rows.length === 0) return res.status(404).json({ error: 'Key not found' });
      res.json({ success: true, message: 'Access key revoked', tokens_consumed: 0 });
    } catch (err) {
      console.error('Delete key error:', err);
      res.status(500).json({ error: 'Failed to delete key' });
    }
  });

  // ---- Outbound mail (session OR api key) ----
  app.post('/api/v1/mail/send',
    sendLimiter,
    dualAuth(sessionAuth),
    (req, res, next) => { req.tokenCost = 5; next(); },
    consumeTokens,
    async (req, res) => {
      const { emailId, to, subject, body } = req.body || {};
      if (!emailId || !to || !subject || !body) {
        return res.status(400).json({ error: 'emailId, to, subject, body are required' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return res.status(400).json({ error: 'Invalid recipient email' });
      }
      try {
        const er = await pool.query(
          'SELECT full_address, subdomain FROM emails WHERE id = $1 AND token_id = $2 AND expires_at > NOW()',
          [emailId, req.tokenId]
        );
        if (er.rows.length === 0) return res.status(404).json({ error: 'Sender email not found or expired' });
        const fromAddress = er.rows[0].full_address;
        const subdomain = er.rows[0].subdomain;

        const transporter = nodemailer.createTransport({
          host: '127.0.0.1',
          port: 2525,
          secure: false,
          tls: { rejectUnauthorized: false },
          ignoreTLS: true,
          name: 'mail.' + subdomain + '.amitbrand.shop',
          dkim: DKIM_PRIVATE_KEY ? {
            domainName: 'amitbrand.shop',
            keySelector: 'default',
            privateKey: DKIM_PRIVATE_KEY
          } : undefined
        });

        // Use direct MX delivery instead of relay since we don't have an outbound MTA
        const mxTransporter = nodemailer.createTransport({
          // direct sending: nodemailer will look up MX of recipient
          // but since this requires DNS, use a public relay approach via "sendmail" fallback
          // simplest: use Sendmail-less direct MX via "direct-mail" — not built in.
          // We instead use a dummy stream and log it — production should use a relay.
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });

        // Best approach: use built-in nodemailer with direct MX
        const directTransporter = require('nodemailer').createTransport({
          // Custom SMTP relay through known relays not available; use direct MX
          host: undefined,
          port: undefined,
          // Fallback: spool to outbox table and let user know it's queued
        });

        // We will actually attempt direct send via MX using a simple resolver
        const dns = require('dns').promises;
        const toDomain = to.split('@')[1];
        let mxHost;
        try {
          const mxs = await dns.resolveMx(toDomain);
          mxs.sort((a, b) => a.priority - b.priority);
          mxHost = mxs[0]?.exchange;
        } catch (e) {
          mxHost = null;
        }

        if (!mxHost) {
          await pool.query(
            'INSERT INTO sent_mails (email_id, token_id, from_address, to_address, subject, body_text, status, error) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
            [emailId, req.tokenId, fromAddress, to, subject, body, 'failed', 'No MX record for ' + toDomain]
          );
          return res.status(502).json({ error: 'No MX record found for recipient domain: ' + toDomain });
        }

        const realTransporter = nodemailer.createTransport({
          host: mxHost,
          port: 25,
          secure: false,
          tls: { rejectUnauthorized: false },
          name: 'mail.' + subdomain + '.amitbrand.shop',
          dkim: DKIM_PRIVATE_KEY ? {
            domainName: 'amitbrand.shop',
            keySelector: 'default',
            privateKey: DKIM_PRIVATE_KEY
          } : undefined,
          connectionTimeout: 10000,
          greetingTimeout: 10000
        });

        const info = await realTransporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: body,
          envelope: { from: fromAddress, to }
        });

        await pool.query(
          'INSERT INTO sent_mails (email_id, token_id, from_address, to_address, subject, body_text, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [emailId, req.tokenId, fromAddress, to, subject, body, 'sent']
        );

        res.json({
          success: true,
          message: 'Email sent successfully',
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
          from: fromAddress,
          to,
          tokens_consumed: 5,
          current_usage: req.currentUsage
        });
      } catch (err) {
        console.error('Send mail error:', err.message);
        try {
          await pool.query(
            'INSERT INTO sent_mails (email_id, token_id, from_address, to_address, subject, body_text, status, error) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
            [emailId, req.tokenId, 'unknown', to || 'unknown', subject || '', body || '', 'failed', String(err.message || err)]
          );
        } catch (e) { /* ignore */ }
        res.status(500).json({ error: 'Failed to send email: ' + err.message });
      }
    }
  );
}

module.exports = { mountExtra };
