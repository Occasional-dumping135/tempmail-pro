# Temp Amit Brands - Handoff Report
Generated: 2026-05-15

## 1. Architecture Overview

### Services Running
| Service | Port | Instances | Status |
|---------|------|-----------|--------|
| mailtemp-api | 3001 | 4 (cluster) | ✅ Online |
| mailtemp-smtp | 2525 | 1 | ✅ Online |

### Infrastructure
- **VPS**: Ubuntu @ 13.62.57.154 (eu-north-1)
- **Web Server**: Nginx reverse proxy
- **Database**: PostgreSQL (mailtemp_db)
- **Cache**: Redis
- **Process Manager**: PM2

## 2. URLs & DNS

### Active Domains
| Subdomain | Purpose | Status |
|-----------|---------|--------|
| https://temp.amitbrand.shop | Main UI | ✅ Live |
| https://soul.amitbrand.shop | UI Mirror | ✅ Live |
| https://crack.amitbrand.shop | UI Mirror | ✅ Live |
| https://api.amitbrand.shop | Dedicated API | ✅ Live (SSL via Certbot) |

### DNS Records (Cloudflare)
- A record: api.amitbrand.shop → 13.62.57.154 (Proxied)
- MX records: mail.temp/soul/crack.amitbrand.shop → 13.62.57.154 (DNS only)

## 3. API Endpoints

### Authentication (No token cost)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/signup | Generate 40-char user token |
| POST | /api/v1/auth/login | Login with token, returns JWT |

### Email Management
| Method | Endpoint | Tokens | Description |
|--------|----------|--------|-------------|
| POST | /api/v1/email/create | 5 | Create temp email |
| GET | /api/v1/email/list | 0 | List emails |
| DELETE | /api/v1/email/:id | 2 | Delete email |
| GET | /api/v1/email/:id/messages | 3 | Get inbox messages |
| GET | /api/v1/email/:id/messages/:msgId | 1 | Get full message |
| PATCH | /api/v1/email/:id/messages/:msgId/read | 0 | Mark read/unread |
| PATCH | /api/v1/email/:id/messages/:msgId/star | 0 | Star/unstar |
| GET | /api/v1/email/:id/messages/search | 1 | Full-text search |
| POST | /api/v1/email/:id/messages/bulk | 1 | Bulk actions |

### Outbound Mail
| Method | Endpoint | Tokens | Description |
|--------|----------|--------|-------------|
| POST | /api/v1/mail/send | 5 | Send DKIM-signed email |

### API Keys (Session only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/keys | List keys |
| POST | /api/v1/keys/create | Create key (returns mtak_...) |
| DELETE | /api/v1/keys/:id | Delete key |
| POST | /api/v1/keys/:id/rotate | Rotate key |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/webhooks | List webhooks |
| POST | /api/v1/webhooks | Create webhook |
| DELETE | /api/v1/webhooks/:id | Delete webhook |
| POST | /api/v1/webhooks/:id/test | Test delivery |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/analytics/usage | Usage stats |
| GET | /api/v1/analytics/endpoints | Endpoint breakdown |
| GET | /api/v1/analytics/errors | Error breakdown |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/sessions | List sessions |
| DELETE | /api/v1/sessions/:id | Revoke session |

### Documentation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/docs/endpoints | Endpoint catalog |
| GET | /api/v1/docs/openapi.json | OpenAPI 3.0 spec |

## 4. Authentication Methods

### 1. Session (JWT Bearer)
```bash
curl -X POST https://api.amitbrand.shop/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d {token:<40-char-token>}
# Returns: { session_token: "jwt..." }

curl https://api.amitbrand.shop/api/v1/email/list \
  -H "Authorization: Bearer <jwt>"
```

### 2. X-API-Key Header
```bash
curl https://api.amitbrand.shop/api/v1/email/list \
  -H "X-API-Key: mtak_<36-char-secret>"
```

## 5. Database Schema

### Tables
- `tokens` - User accounts
- `emails` - Temp email addresses
- `messages` - Received emails
- `attachments` - Email attachments
- `access_keys` - API keys (multi-key support)
- `webhooks` - Webhook configurations
- `webhook_deliveries` - Delivery history
- `api_logs` - Request logging
- `token_usage` - Daily usage tracking
- `sessions` - Active sessions
- `sent_mails` - Outbound email history
- `forwards` - Email forwarding rules
- `auto_replies` - Auto-reply configs
- `audit_log` - Security events

### Connection
```
Host: localhost
Port: 5432
Database: mailtemp_db
User: mailtemp
Password: MailTemp2024Secure!
```

## 6. Environment Variables

### Backend (/home/ubuntu/mail_temp/backend/.env)
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- REDIS_HOST, REDIS_PORT
- JWT_SECRET
- DOMAIN=amitbrand.shop
- SUBDOMAINS=temp,soul,crack
- DAILY_TOKEN_LIMIT=200000

### Frontend (/home/ubuntu/mail_temp/frontend/.env)
- VITE_API_URL=https://api.amitbrand.shop/api

## 7. DKIM Configuration

- **Selector**: default
- **Key Location**: /home/ubuntu/mail_temp/dkim/private.key
- **Algorithm**: RSA 2048-bit
- Outbound emails are DKIM signed automatically via nodemailer

## 8. Nginx Configuration

- `/etc/nginx/sites-enabled/mailtemp` - Frontend + API proxy
- `/etc/nginx/sites-enabled/api.amitbrand.shop` - Dedicated API with CORS

## 9. SSL/TLS

- api.amitbrand.shop: Let's Encrypt certificate via Certbot
- UI domains: Cloudflare Flexible SSL (snake oil certs on server)

## 10. Key Commands

```bash
# PM2 Management
pm2 reload mailtemp-api   # Zero-downtime reload
pm2 logs mailtemp-api     # View logs
pm2 list                   # Status

# Nginx
sudo nginx -t && sudo nginx -s reload

# Database Backup
pg_dump -U mailtemp mailtemp_db > /home/ubuntu/mail_temp/backups/$(date +%Y%m%d).sql

# Frontend Build
cd /home/ubuntu/mail_temp/frontend && yarn build
```

## 11. Frontend Pages

- `/` - Landing page
- `/login` - Token login
- `/signup` - Token generation
- `/inbox` - Message viewer
- `/emails` - Email management
- `/send` - Compose & send
- `/keys` - API key management
- `/webhooks` - Webhook configuration
- `/analytics` - Usage analytics
- `/docs` - API documentation
- `/token` - Token info
- `/settings` - User settings

## 12. SEO

- **sitemap.xml**: https://temp.amitbrand.shop/sitemap.xml
- **robots.txt**: https://temp.amitbrand.shop/robots.txt
- Routes exposed to backend for proper XML/txt content-type

## 13. What's Complete ✅

1. API subdomain setup (api.amitbrand.shop)
2. All required API endpoints working
3. Multi-key API support with scopes
4. X-API-Key authentication
5. Session JWT authentication
6. DKIM signed outbound mail
7. SMTP receive working
8. Webhooks with HMAC signatures
9. Analytics endpoints
10. Frontend connected to API subdomain
11. SEO (sitemap.xml, robots.txt)
12. CORS configured for all UI domains

## 14. Remaining/Future Work

- [ ] Webhook event delivery on message.received
- [ ] 2FA (TOTP) implementation
- [ ] Full-text search index (tsvector)
- [ ] Attachment storage & serving
- [ ] Email forwarding
- [ ] Auto-reply feature
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Browser extensions
- [ ] Additional SEO pages (/faq, /pricing, /blog)
- [ ] Framer Motion animations
- [ ] Light/dark theme toggle
- [ ] Command palette (Cmd+K)

## 15. Rollback Steps

```bash
# Backend rollback
cd /home/ubuntu/mail_temp/backend
cp server.js.bak server.js
pm2 reload mailtemp-api

# Frontend rollback
cd /home/ubuntu/mail_temp/frontend/src
cp App.jsx.bak App.jsx
yarn build

# Nginx rollback
sudo cp /etc/nginx/sites-available/mailtemp.bak /etc/nginx/sites-available/mailtemp
sudo nginx -s reload
```

---
Report generated by E1 Agent

## Session Update - 2026-05-16

### Changes Made

#### 1. Analytics Dashboard Redesign
- **Stats Cards**: Added 4 improved metric cards:
  - Total Requests with trend indicator
  - Tokens Consumed
  - Success Rate (percentage)
  - Total Errors
- **Usage Over Time Chart**: Enhanced with:
  - Y-axis scale labels
  - Grid lines
  - Dual bars (Requests and Tokens)
  - Hover tooltips
  - Legend
- **Bottom Section**: Added Top Endpoints list and Error Breakdown panels

#### 2. Email Sending Error Handling
- Improved error messages for email delivery failures
- Added helpful suggestions when email is rejected:
  - IP reputation issues
  - Spam filter explanations
  - Recommendation to use professional SMTP relay (SendGrid, Mailgun, Amazon SES)
- Note: Direct SMTP sending from VPS IPs is often rejected by major email providers. This is a fundamental email deliverability issue, not a bug.

### Known Limitations

1. **Outbound Email Delivery**: 
   - VPS IP addresses typically have poor email reputation
   - Major providers (Gmail, Outlook, etc.) reject emails from untrusted IPs
   - **Solution**: Use a professional SMTP relay service for reliable delivery

2. **Current Status**:
   - All API endpoints functional
   - Receiving emails: WORKING
   - Sending emails: Works but may be rejected by recipient servers
   - Analytics: WORKING with improved UI
   - CORS: Fixed, all UI domains can access API

### Files Modified
- /home/ubuntu/mail_temp/backend/api-v2.js - Improved send mail error handling
- /home/ubuntu/mail_temp/frontend/src/AnalyticsPage.jsx - New improved analytics UI
- /home/ubuntu/mail_temp/frontend/src/App.jsx - Import new analytics component
- /home/ubuntu/mail_temp/frontend/src/App.css - Added analytics styling

