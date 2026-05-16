// API v2 - Enhanced endpoints: multi-key, webhooks, analytics, search, etc.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAccessKey() {
  const raw = crypto.randomBytes(30).toString("base64").replace(/[+/=]/g, "").slice(0, 36);
  return "mtak_" + raw;
}

function generateWebhookSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function signWebhookPayload(payload, secret) {
  return crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
}

const DKIM_PRIVATE_KEY = (() => {
  try { return fs.readFileSync(path.join(__dirname, "..", "dkim", "private.key"), "utf8"); }
  catch (e) { return null; }
})();

// Auto-update endpoint catalog
const ENDPOINT_CATALOG = [
  { method: "POST", path: "/api/v1/auth/signup", auth: "none", tokens: 0, desc: "Generate a new 40-char user token" },
  { method: "POST", path: "/api/v1/auth/login", auth: "token (body)", tokens: 0, desc: "Login with user token, returns JWT session" },
  { method: "POST", path: "/api/v1/email/create", auth: "session OR api-key", tokens: 5, desc: "Create new temp email" },
  { method: "GET", path: "/api/v1/email/list", auth: "session OR api-key", tokens: 0, desc: "List your active temp emails" },
  { method: "DELETE", path: "/api/v1/email/:id", auth: "session OR api-key", tokens: 2, desc: "Delete a temp email" },
  { method: "GET", path: "/api/v1/email/:emailId/messages", auth: "session OR api-key", tokens: 1, desc: "List messages (inbox)" },
  { method: "GET", path: "/api/v1/email/:emailId/messages/:messageId", auth: "session OR api-key", tokens: 1, desc: "Get full message" },
  { method: "PATCH", path: "/api/v1/email/:emailId/messages/:messageId/read", auth: "session OR api-key", tokens: 0, desc: "Mark read/unread" },
  { method: "POST", path: "/api/v1/mail/send", auth: "session OR api-key", tokens: 5, desc: "Send outbound email (DKIM signed)" },
  { method: "GET", path: "/api/v1/keys", auth: "session", tokens: 0, desc: "List API keys" },
  { method: "POST", path: "/api/v1/keys/create", auth: "session", tokens: 0, desc: "Create API key" },
  { method: "DELETE", path: "/api/v1/keys/:id", auth: "session", tokens: 0, desc: "Delete API key" },
  { method: "POST", path: "/api/v1/keys/:id/rotate", auth: "session", tokens: 0, desc: "Rotate API key" },
  { method: "GET", path: "/api/v1/analytics/usage", auth: "session OR api-key", tokens: 0, desc: "Usage analytics" },
  { method: "GET", path: "/api/v1/analytics/endpoints", auth: "session OR api-key", tokens: 0, desc: "Endpoint analytics" },
  { method: "GET", path: "/api/v1/analytics/errors", auth: "session OR api-key", tokens: 0, desc: "Error analytics" },
  { method: "GET", path: "/api/v1/webhooks", auth: "session", tokens: 0, desc: "List webhooks" },
  { method: "POST", path: "/api/v1/webhooks", auth: "session", tokens: 0, desc: "Create webhook" },
  { method: "DELETE", path: "/api/v1/webhooks/:id", auth: "session", tokens: 0, desc: "Delete webhook" },
  { method: "POST", path: "/api/v1/webhooks/:id/test", auth: "session", tokens: 0, desc: "Test webhook" },
  { method: "GET", path: "/api/v1/docs/endpoints", auth: "none", tokens: 0, desc: "Endpoint catalog" },
  { method: "GET", path: "/api/v1/docs/openapi.json", auth: "none", tokens: 0, desc: "OpenAPI 3.0 spec" },
  { method: "GET", path: "/api/v1/email/:emailId/messages/search", auth: "session OR api-key", tokens: 1, desc: "Full-text search" },
  { method: "PATCH", path: "/api/v1/email/:emailId/messages/:messageId/star", auth: "session OR api-key", tokens: 0, desc: "Star/unstar message" },
  { method: "POST", path: "/api/v1/email/:emailId/messages/bulk", auth: "session OR api-key", tokens: 1, desc: "Bulk delete/mark-read" },
  { method: "GET", path: "/api/v1/sessions", auth: "session", tokens: 0, desc: "List active sessions" },
  { method: "DELETE", path: "/api/v1/sessions/:id", auth: "session", tokens: 0, desc: "Revoke session" }
];

function mountApiV2(app, pool, redisClient) {
  const sessionAuth = app.locals.authMiddleware;
  const consumeTokens = app.locals.consumeTokens;

  // Dual auth: X-API-Key or session
  async function dualAuth(req, res, next) {
    const apiKey = req.headers["x-api-key"];
    if (apiKey) {
      if (!apiKey.startsWith("mtak_") || apiKey.length !== 41) {
        return res.status(401).json({ error: "Invalid X-API-Key format" });
      }
      try {
        const keyHash = hashToken(apiKey);
        const r = await pool.query(
          `SELECT id, token_id, scopes, rate_limit_per_min, daily_limit, allowed_ips, status, expires_at 
           FROM access_keys WHERE key_hash = $1`,
          [keyHash]
        );
        if (r.rows.length === 0) return res.status(401).json({ error: "Invalid API key" });
        const key = r.rows[0];
        if (key.status !== "active" || !key.is_active) return res.status(401).json({ error: "API key revoked" });
        if (key.expires_at && new Date(key.expires_at) < new Date()) return res.status(401).json({ error: "API key expired" });
        if (key.allowed_ips?.length > 0 && !key.allowed_ips.includes(req.ip)) {
          return res.status(403).json({ error: "IP not allowed" });
        }
        req.tokenId = key.token_id;
        req.accessKeyId = key.id;
        pool.query("UPDATE access_keys SET last_used_at = NOW() WHERE id = $1", [key.id]).catch(() => {});
        return next();
      } catch (err) {
        console.error("API key auth error:", err);
        return res.status(500).json({ error: "Auth failed" });
      }
    }
    return sessionAuth(req, res, next);
  }

  // ===== DOCS =====
  app.get("/api/v1/docs/endpoints", (req, res) => {
    res.json({ success: true, endpoints: ENDPOINT_CATALOG, base_url: "https://api.amitbrand.shop" });
  });

  app.get("/api/v1/docs/openapi.json", (req, res) => {
    const openapi = {
      openapi: "3.0.3",
      info: { title: "Temp Amit Brands API", version: "1.0.0", description: "Token-based temporary email service API" },
      servers: [{ url: "https://api.amitbrand.shop", description: "Production" }],
      paths: {},
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
          BearerAuth: { type: "http", scheme: "bearer" }
        }
      }
    };
    ENDPOINT_CATALOG.forEach(ep => {
      const pathKey = ep.path.replace(/:(\w+)/g, "{$1}");
      if (!openapi.paths[pathKey]) openapi.paths[pathKey] = {};
      openapi.paths[pathKey][ep.method.toLowerCase()] = {
        summary: ep.desc,
        security: ep.auth === "none" ? [] : [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Success" }, "401": { description: "Unauthorized" } }
      };
    });
    res.json(openapi);
  });

  // ===== MULTI-KEY SUPPORT =====
  app.get("/api/v1/keys", sessionAuth, async (req, res) => {
    try {
      const r = await pool.query(
        `SELECT id, key_prefix, name, status, scopes, rate_limit_per_min, daily_limit, 
                allowed_ips, expires_at, last_used_at, created_at 
         FROM access_keys WHERE token_id = $1 ORDER BY created_at DESC`,
        [req.tokenId]
      );
      res.json({ success: true, keys: r.rows });
    } catch (err) {
      console.error("List keys error:", err);
      res.status(500).json({ error: "Failed to list keys" });
    }
  });

  app.post("/api/v1/keys/create", sessionAuth, async (req, res) => {
    try {
      const { name, scopes, rate_limit_per_min, daily_limit, expires_at, allowed_ips } = req.body || {};
      const key = generateAccessKey();
      const keyHash = hashToken(key);
      const keyPrefix = key.slice(0, 12);
      const r = await pool.query(
        `INSERT INTO access_keys (token_id, key_hash, key_prefix, name, scopes, rate_limit_per_min, daily_limit, expires_at, allowed_ips) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, key_prefix, name, scopes, created_at`,
        [
          req.tokenId, keyHash, keyPrefix,
          name || "API Key",
          JSON.stringify(scopes || ["email:read", "email:write", "mail:send"]),
          rate_limit_per_min || 60,
          daily_limit || 200000,
          expires_at || null,
          allowed_ips || []
        ]
      );
      res.status(201).json({
        success: true,
        message: "Save this key now - it will not be shown again.",
        api_key: key,
        key: r.rows[0],
        usage: "X-API-Key: " + key
      });
    } catch (err) {
      console.error("Create key error:", err);
      res.status(500).json({ error: "Failed to create key" });
    }
  });

  app.delete("/api/v1/keys/:id", sessionAuth, async (req, res) => {
    try {
      const r = await pool.query(
        "DELETE FROM access_keys WHERE id = $1 AND token_id = $2 RETURNING id",
        [req.params.id, req.tokenId]
      );
      if (r.rows.length === 0) return res.status(404).json({ error: "Key not found" });
      res.json({ success: true, message: "Key deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete key" });
    }
  });

  app.post("/api/v1/keys/:id/rotate", sessionAuth, async (req, res) => {
    try {
      const oldKey = await pool.query(
        "SELECT id, name, scopes, rate_limit_per_min, daily_limit, allowed_ips FROM access_keys WHERE id = $1 AND token_id = $2",
        [req.params.id, req.tokenId]
      );
      if (oldKey.rows.length === 0) return res.status(404).json({ error: "Key not found" });
      
      const newKey = generateAccessKey();
      const newKeyHash = hashToken(newKey);
      const keyPrefix = newKey.slice(0, 12);
      
      await pool.query(
        "UPDATE access_keys SET key_hash = $1, key_prefix = $2, created_at = NOW() WHERE id = $3",
        [newKeyHash, keyPrefix, req.params.id]
      );
      
      res.json({ success: true, api_key: newKey, key_prefix: keyPrefix, message: "Key rotated. Old key deprecated." });
    } catch (err) {
      res.status(500).json({ error: "Failed to rotate key" });
    }
  });

  // ===== ANALYTICS =====
  app.get("/api/v1/analytics/usage", dualAuth, async (req, res) => {
    const range = req.query.range || "24h";
    let intervalValue, sqlInterval;
    switch (range) {
      case "1h": intervalValue = "1 hour"; sqlInterval = "minute"; break;
      case "7d": intervalValue = "7 days"; sqlInterval = "day"; break;
      case "30d": intervalValue = "30 days"; sqlInterval = "day"; break;
      default: intervalValue = "24 hours"; sqlInterval = "hour";
    }
    try {
      const usage = await pool.query(
        `SELECT date_trunc($1, timestamp) as period, COUNT(*) as requests, COALESCE(SUM(tokens_consumed),0) as tokens
         FROM api_logs WHERE token_id = $2 AND timestamp > NOW() - $3::INTERVAL
         GROUP BY period ORDER BY period`,
        [sqlInterval, req.tokenId, intervalValue]
      );
      const total = await pool.query(
        `SELECT COUNT(*) as total_requests, COALESCE(SUM(tokens_consumed),0) as total_tokens
         FROM api_logs WHERE token_id = $1 AND timestamp > NOW() - $2::INTERVAL`,
        [req.tokenId, intervalValue]
      );
      res.json({ success: true, range, data: usage.rows, totals: total.rows[0] });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  app.get("/api/v1/analytics/endpoints", dualAuth, async (req, res) => {
    try {
      const r = await pool.query(
        `SELECT endpoint, COUNT(*) as calls, SUM(tokens_consumed) as tokens
         FROM api_logs WHERE token_id = $1 AND timestamp > NOW() - INTERVAL 30 days
         GROUP BY endpoint ORDER BY calls DESC LIMIT 20`,
        [req.tokenId]
      );
      res.json({ success: true, endpoints: r.rows });
    } catch (err) {
      res.status(500).json({ error: "Failed to get endpoint analytics" });
    }
  });

  app.get("/api/v1/analytics/errors", dualAuth, async (req, res) => {
    try {
      const r = await pool.query(
        `SELECT status_code, COUNT(*) as count
         FROM api_logs WHERE token_id = $1 AND status_code >= 400 AND timestamp > NOW() - INTERVAL 30 days
         GROUP BY status_code ORDER BY count DESC`,
        [req.tokenId]
      );
      res.json({ success: true, errors: r.rows });
    } catch (err) {
      res.status(500).json({ error: "Failed to get error analytics" });
    }
  });

  // ===== WEBHOOKS =====
  app.get("/api/v1/webhooks", sessionAuth, async (req, res) => {
    try {
      const r = await pool.query(
        "SELECT id, url, events, status, last_delivery_at, last_status_code, created_at FROM webhooks WHERE token_id = $1",
        [req.tokenId]
      );
      res.json({ success: true, webhooks: r.rows });
    } catch (err) {
      res.status(500).json({ error: "Failed to list webhooks" });
    }
  });

  app.post("/api/v1/webhooks", sessionAuth, async (req, res) => {
    const { url, events } = req.body || {};
    if (!url) return res.status(400).json({ error: "URL required" });
    try {
      const secret = generateWebhookSecret();
      const r = await pool.query(
        "INSERT INTO webhooks (token_id, url, events, secret) VALUES ($1, $2, $3, $4) RETURNING id, url, events, created_at",
        [req.tokenId, url, events || ["message.received"], secret]
      );
      res.status(201).json({ success: true, webhook: r.rows[0], secret, message: "Save this secret for signature verification" });
    } catch (err) {
      res.status(500).json({ error: "Failed to create webhook" });
    }
  });

  app.delete("/api/v1/webhooks/:id", sessionAuth, async (req, res) => {
    try {
      const r = await pool.query("DELETE FROM webhooks WHERE id = $1 AND token_id = $2 RETURNING id", [req.params.id, req.tokenId]);
      if (r.rows.length === 0) return res.status(404).json({ error: "Webhook not found" });
      res.json({ success: true, message: "Webhook deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  });

  app.post("/api/v1/webhooks/:id/test", sessionAuth, async (req, res) => {
    try {
      const wh = await pool.query("SELECT url, secret FROM webhooks WHERE id = $1 AND token_id = $2", [req.params.id, req.tokenId]);
      if (wh.rows.length === 0) return res.status(404).json({ error: "Webhook not found" });
      
      const payload = { event: "test", timestamp: new Date().toISOString(), data: { message: "Test webhook delivery" } };
      const signature = signWebhookPayload(payload, wh.rows[0].secret);
      
      const response = await fetch(wh.rows[0].url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Signature": signature },
        body: JSON.stringify(payload)
      });
      
      await pool.query(
        "UPDATE webhooks SET last_delivery_at = NOW(), last_status_code = $1 WHERE id = $2",
        [response.status, req.params.id]
      );
      
      res.json({ success: true, status_code: response.status, delivered: response.ok });
    } catch (err) {
      res.status(500).json({ error: "Webhook test failed: " + err.message });
    }
  });

  // ===== SEARCH & ADVANCED MESSAGE FEATURES =====
  app.get("/api/v1/email/:emailId/messages/search", dualAuth, (rq, rs, nx) => { rq.tokenCost = 1; nx(); }, consumeTokens, async (req, res) => {
    const { q, from, has_attachment, is_starred, is_unread, start_date, end_date } = req.query;
    try {
      const emailCheck = await pool.query("SELECT id FROM emails WHERE id = $1 AND token_id = $2", [req.params.emailId, req.tokenId]);
      if (emailCheck.rows.length === 0) return res.status(404).json({ error: "Email not found" });
      
      let sql = "SELECT id, sender, subject, snippet, received_at, is_read, is_starred FROM messages WHERE email_id = $1";
      const params = [req.params.emailId];
      let idx = 2;
      
      if (q) { sql += ` AND search_vector @@ plainto_tsquery(english, $${idx})`; params.push(q); idx++; }
      if (from) { sql += ` AND sender ILIKE $${idx}`; params.push("%" + from + "%"); idx++; }
      if (has_attachment === "true") { sql += ` AND id IN (SELECT message_id FROM attachments)`; }
      if (is_starred === "true") { sql += " AND is_starred = TRUE"; }
      if (is_unread === "true") { sql += " AND is_read = FALSE"; }
      if (start_date) { sql += ` AND received_at >= $${idx}`; params.push(start_date); idx++; }
      if (end_date) { sql += ` AND received_at <= $${idx}`; params.push(end_date); idx++; }
      
      sql += " ORDER BY received_at DESC LIMIT 100";
      
      const r = await pool.query(sql, params);
      res.json({ success: true, messages: r.rows, tokens_consumed: 1 });
    } catch (err) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.patch("/api/v1/email/:emailId/messages/:messageId/read", dualAuth, async (req, res) => {
    const { is_read } = req.body;
    try {
      await pool.query("UPDATE messages SET is_read = $1 WHERE id = $2 AND email_id = $3", [is_read !== false, req.params.messageId, req.params.emailId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update" });
    }
  });

  app.patch("/api/v1/email/:emailId/messages/:messageId/star", dualAuth, async (req, res) => {
    const { is_starred } = req.body;
    try {
      await pool.query("UPDATE messages SET is_starred = $1 WHERE id = $2 AND email_id = $3", [is_starred !== false, req.params.messageId, req.params.emailId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update" });
    }
  });

  app.post("/api/v1/email/:emailId/messages/bulk", dualAuth, (rq, rs, nx) => { rq.tokenCost = 1; nx(); }, consumeTokens, async (req, res) => {
    const { action, message_ids } = req.body || {};
    if (!action || !message_ids?.length) return res.status(400).json({ error: "action and message_ids required" });
    try {
      const emailCheck = await pool.query("SELECT id FROM emails WHERE id = $1 AND token_id = $2", [req.params.emailId, req.tokenId]);
      if (emailCheck.rows.length === 0) return res.status(404).json({ error: "Email not found" });
      
      if (action === "delete") {
        await pool.query("DELETE FROM messages WHERE id = ANY($1) AND email_id = $2", [message_ids, req.params.emailId]);
      } else if (action === "mark_read") {
        await pool.query("UPDATE messages SET is_read = TRUE WHERE id = ANY($1) AND email_id = $2", [message_ids, req.params.emailId]);
      } else if (action === "mark_unread") {
        await pool.query("UPDATE messages SET is_read = FALSE WHERE id = ANY($1) AND email_id = $2", [message_ids, req.params.emailId]);
      }
      res.json({ success: true, affected: message_ids.length });
    } catch (err) {
      res.status(500).json({ error: "Bulk action failed" });
    }
  });

  // ===== SESSIONS =====
  app.get("/api/v1/sessions", sessionAuth, async (req, res) => {
    try {
      const r = await pool.query(
        "SELECT id, ip, user_agent, geo_country, geo_city, created_at, expires_at FROM sessions WHERE token_id = $1 AND revoked_at IS NULL ORDER BY created_at DESC",
        [req.tokenId]
      );
      res.json({ success: true, sessions: r.rows });
    } catch (err) {
      res.status(500).json({ error: "Failed to list sessions" });
    }
  });

  app.delete("/api/v1/sessions/:id", sessionAuth, async (req, res) => {
    try {
      await pool.query("UPDATE sessions SET revoked_at = NOW() WHERE id = $1 AND token_id = $2", [req.params.id, req.tokenId]);
      res.json({ success: true, message: "Session revoked" });
    } catch (err) {
      res.status(500).json({ error: "Failed to revoke session" });
    }
  });

  // ===== OUTBOUND MAIL (already in api-extra, but enhanced) =====
  // Re-export with DKIM signing handled in api-extra.js

  sendMailHandler(app, pool, sessionAuth, consumeTokens);
  mountSEO(app);
  console.log("API v2 routes mounted");
}

module.exports = { mountApiV2, ENDPOINT_CATALOG, signWebhookPayload };

// ===== OUTBOUND MAIL WITH DKIM =====
const dns = require("dns").promises;

async function sendMailHandler(app, pool, sessionAuth, consumeTokens) {
  const dualAuth = async (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey) {
      if (!apiKey.startsWith("mtak_") || apiKey.length !== 41) {
        return res.status(401).json({ error: "Invalid X-API-Key format" });
      }
      try {
        const keyHash = hashToken(apiKey);
        const r = await pool.query("SELECT id, token_id FROM access_keys WHERE key_hash = $1 AND status = 'active'", [keyHash]);
        if (r.rows.length === 0) return res.status(401).json({ error: "Invalid API key" });
        req.tokenId = r.rows[0].token_id;
        req.accessKeyId = r.rows[0].id;
        pool.query("UPDATE access_keys SET last_used_at = NOW() WHERE id = $1", [r.rows[0].id]).catch(() => {});
        return next();
      } catch (err) {
        return res.status(500).json({ error: "Auth failed" });
      }
    }
    return sessionAuth(req, res, next);
  };

  app.post("/api/v1/mail/send",
    dualAuth,
    (req, res, next) => { req.tokenCost = 5; next(); },
    consumeTokens,
    async (req, res) => {
      const { emailId, to, subject, body, html } = req.body || {};
      if (!emailId || !to || !subject || !body) {
        return res.status(400).json({ error: "emailId, to, subject, body required" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return res.status(400).json({ error: "Invalid recipient email" });
      }
      try {
        const er = await pool.query(
          "SELECT full_address, subdomain FROM emails WHERE id = $1 AND token_id = $2 AND expires_at > NOW()",
          [emailId, req.tokenId]
        );
        if (er.rows.length === 0) return res.status(404).json({ error: "Sender email not found or expired" });
        
        const fromAddress = er.rows[0].full_address;
        const subdomain = er.rows[0].subdomain;
        const toDomain = to.split("@")[1];
        
        let mxHost;
        try {
          const mxs = await dns.resolveMx(toDomain);
          mxs.sort((a, b) => a.priority - b.priority);
          mxHost = mxs[0]?.exchange;
        } catch (e) { mxHost = null; }
        
        if (!mxHost) {
          await pool.query(
            "INSERT INTO sent_mails (email_id, token_id, from_address, to_address, subject, body_text, status, error) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
            [emailId, req.tokenId, fromAddress, to, subject, body, "failed", "No MX for " + toDomain]
          );
          return res.status(502).json({ error: "No MX record found for: " + toDomain });
        }

        const transporter = nodemailer.createTransport({
          host: mxHost,
          port: 25,
          secure: false,
          tls: { rejectUnauthorized: false },
          name: "mail." + subdomain + ".amitbrand.shop",
          dkim: DKIM_PRIVATE_KEY ? {
            domainName: "amitbrand.shop",
            keySelector: "default",
            privateKey: DKIM_PRIVATE_KEY
          } : undefined,
          connectionTimeout: 10000,
          greetingTimeout: 10000
        });

        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text: body,
          html: html || undefined,
          envelope: { from: fromAddress, to }
        });

        await pool.query(
          "INSERT INTO sent_mails (email_id, token_id, from_address, to_address, subject, body_text, status) VALUES ($1,$2,$3,$4,$5,$6,$7)",
          [emailId, req.tokenId, fromAddress, to, subject, body, "sent"]
        );

        res.json({
          success: true,
          message: "Email sent",
          messageId: info.messageId,
          from: fromAddress,
          to,
          tokens_consumed: 5
        });
      } catch (err) {
        console.error("Send mail error:", err.message);
        res.status(500).json({ error: "Failed to send: " + err.message });
      }
    }
  );
}

// Attach at bottom of mountApiV2
module.exports.sendMailHandler = sendMailHandler;

// ===== SEO =====
function mountSEO(app) {
  const DOMAIN = "https://temp.amitbrand.shop";
  const pages = ["/", "/login", "/signup", "/pricing", "/faq", "/privacy", "/terms", "/api-docs"];
  
  app.get("/sitemap.xml", (req, res) => {
    const urls = pages.map(p => `<url><loc>${DOMAIN}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`).join("");
    res.set("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  });

  app.get("/robots.txt", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Allow: /login
Allow: /signup
Allow: /faq
Allow: /privacy
Allow: /terms
Disallow: /inbox
Disallow: /emails
Disallow: /settings
Sitemap: ${DOMAIN}/sitemap.xml`);
  });
  
  console.log("SEO routes mounted");
}

module.exports.mountSEO = mountSEO;
