# Temp Amit Brands - Temporary Email Service

A privacy-first, token-based temporary email service that provides disposable email addresses without requiring any personal information.

## Live Sites

- **Main Site:** https://temp.amitbrand.shop
- **Subdomains:** soul.amitbrand.shop, crack.amitbrand.shop

## Features

- **Token-Based Authentication**: No usernames or passwords - just a 40-character token
- **Multiple Domains**: Create emails on temp, soul, or crack subdomains
- **API Access**: Full programmatic access with 200,000 daily API calls
- **Real-Time Updates**: WebSocket support for instant email notifications
- **24-Hour Expiry**: Emails auto-delete after 24 hours
- **Scalable Architecture**: Designed for 400K+ concurrent users

## API Documentation

### Base URL
```
https://temp.amitbrand.shop/api
```

### Authentication

All authenticated endpoints require the Authorization header:
```
Authorization: Bearer <session_token>
```

### Endpoints

| Method | Endpoint | Token Cost | Description |
|--------|----------|------------|-------------|
| POST | /v1/auth/signup | 0 | Generate new token |
| POST | /v1/auth/login | 0 | Login with token |
| POST | /v1/email/create | 5 | Create email address |
| GET | /v1/email/list | 2 | List all emails |
| GET | /v1/email/:id/messages | 3 | Get messages |
| GET | /v1/email/:id/messages/:msgId | 1 | Get single message |
| DELETE | /v1/email/:id | 2 | Delete email |
| GET | /v1/token/usage | 1 | Get usage stats |

## Quick Start

### 1. Get a Token
```bash
curl -X POST https://temp.amitbrand.shop/api/v1/auth/signup
```

### 2. Login
```bash
curl -X POST https://temp.amitbrand.shop/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token": "your_40_char_token"}'
```

### 3. Create Email
```bash
curl -X POST https://temp.amitbrand.shop/api/v1/email/create \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "random", "subdomain": "temp"}'
```

## Architecture

- **Backend**: Node.js + Express + PostgreSQL + Redis
- **Frontend**: React (Vite)
- **Mobile**: React Native
- **Process Manager**: PM2 (clustered)
- **Reverse Proxy**: Nginx
- **SSL**: Cloudflare
