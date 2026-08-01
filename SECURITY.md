# Security Implementation Guide

## Overview
Your portfolio admin dashboard now has comprehensive security protections:

### 🔐 Authentication & Authorization
- **JWT Token-Based Authentication**: Admin access requires a password, which generates a 24-hour JWT token stored in browser's localStorage
- **Password Validation**: Server-side password verification with bcryptjs hashing
- **Token Verification**: All protected API endpoints verify the JWT token before processing requests

### 🛡️ API Protection
All admin-only endpoints (POST, PUT, DELETE) require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. Input validation using Zod schemas
3. Rate limiting (30 requests per minute per IP)
4. Error handling that doesn't leak sensitive information

### 📝 Input Validation (Zod)
All inputs are validated before database operations:

**Projects:**
- Title: 1-255 characters, required
- Summary: 10-1000 characters, required
- Link: Valid URL format, required
- Stack: Array of 1-20 technologies (max 100 chars each)

**Availability:**
- Status: Only accepts specific enum values (Open to Commissions, Limited Availability, Closed for Commissions)

**Admin Login:**
- Password: Required, non-empty

### ⏱️ Rate Limiting
- 30 requests per minute per IP address
- Applies to all API endpoints (both public and private)
- Returns HTTP 429 (Too Many Requests) when exceeded
- Rate limit records auto-cleanup every hour

### 🔒 Password Security
1. **Environment Variable**: Store `ADMIN_PASSWORD` in `.env.local` (never commit to git)
2. **Default**: `admin123` (CHANGE THIS IN PRODUCTION!)
3. **Hashing Ready**: Code supports bcryptjs hashing for production

### 🚀 Setup Instructions

#### 1. Create `.env.local` (CRITICAL - Never commit this file!)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=portfolio

ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-super-secret-key-min-32-chars
```

#### 2. Update `.gitignore`
Ensure `.env.local` is already in your `.gitignore`:
```
.env.local
.env*.local
```

#### 3. Generate Strong Secrets
For production, use strong random keys:
```bash
# Generate random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

### 🔑 Using the Admin Dashboard

1. **Access**: Navigate to `/admin`
2. **Login**: Enter your `ADMIN_PASSWORD`
3. **Token**: JWT token is stored in browser localStorage (24-hour expiration)
4. **Logout**: Click logout to clear the token

### 📊 What's Protected

**Protected Endpoints (Require JWT):**
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `PUT /api/availability` - Update availability status

**Public Endpoints (Rate Limited):**
- `GET /api/projects` - List projects
- `GET /api/availability` - Get availability status
- `POST /api/auth/login` - Login (rate limited to prevent brute force)

### 🔍 Security Features by Component

#### `src/lib/auth.ts`
- Password hashing with bcryptjs
- JWT token generation and verification
- Password validation logic

#### `src/lib/validation.ts`
- Zod schemas for input validation
- Type-safe validation results
- Clear error messages for invalid inputs

#### `src/lib/rateLimit.ts`
- In-memory rate limit tracking
- Per-IP, per-route tracking
- Auto-cleanup of expired entries

#### `src/lib/apiMiddleware.ts`
- JWT verification utility
- Standard error responses
- Authorization checks

#### API Routes
- Authentication checks on all mutations
- Input validation before database operations
- Detailed error logging (server-side only)
- Prepared statements (using mysql2/promise) prevent SQL injection

### 🚨 Security Best Practices

#### Do's ✅
- ✅ Use strong, unique passwords
- ✅ Store secrets in `.env.local` (never in code)
- ✅ Change default `ADMIN_PASSWORD` immediately
- ✅ Use HTTPS in production
- ✅ Regularly update dependencies: `npm audit fix`
- ✅ Keep JWT_SECRET secure and change it if compromised
- ✅ Monitor rate limiting logs for brute force attempts

#### Don'ts ❌
- ❌ Don't commit `.env.local` to git
- ❌ Don't expose secrets in error messages
- ❌ Don't use default passwords in production
- ❌ Don't share JWT tokens via unsecured channels
- ❌ Don't skip input validation
- ❌ Don't disable CORS security in production

### 📱 Production Deployment Checklist

- [ ] Change `ADMIN_PASSWORD` to a strong, unique password
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set up `.env.local` on production server
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Test login with production credentials
- [ ] Monitor API logs for suspicious activity
- [ ] Set up automated security updates
- [ ] Consider adding 2FA for admin access
- [ ] Use environment variable management service (AWS Secrets Manager, etc.)
- [ ] Enable database user authentication
- [ ] Set up database backups
- [ ] Consider adding API request signing

### 🔧 Advanced Security (Optional)

#### Add 2-Factor Authentication
Add TOTP (Time-based One-Time Password) with a library like `speakeasy`:
```bash
npm install speakeasy qrcode
```

#### Use Environment Variable Service
For production, use AWS Secrets Manager, Google Secret Manager, or Vault instead of `.env` files.

#### Implement Request Signing
Add HMAC-based request signing for additional API security.

#### Add Logging
Implement proper logging with a service like Sentry or LogRocket for monitoring security events.

#### Content Security Policy
The Next.js config already includes CSP headers. Review and strengthen as needed.

### 🧪 Testing Security

#### Test Rate Limiting
```bash
# Make multiple rapid requests
for i in {1..35}; do curl -X GET http://localhost:3000/api/projects; done
```

#### Test Authentication
```bash
# Should fail without token
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","summary":"Test summary","stack":["React"],"link":"https://example.com"}'

# Should fail with invalid token
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer invalid" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","summary":"Test summary","stack":["React"],"link":"https://example.com"}'
```

#### Test Input Validation
```bash
# Should fail with invalid URL
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","summary":"Test summary","stack":["React"],"link":"not-a-url"}'
```

### 📚 Resources
- JWT: https://jwt.io/
- Zod Validation: https://zod.dev/
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- OWASP: https://owasp.org/www-project-top-ten/
