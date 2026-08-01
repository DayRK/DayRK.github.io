# Security Notes

This portfolio has a simple admin layer, so I kept the security setup practical rather than overcomplicated.

## What is protected
- The admin dashboard needs a password to log in
- Protected API routes require a JWT token
- Project and availability updates are validated before they go through
- Basic rate limiting is in place for the auth and data routes

## What is checked
- Project title, summary, link, and stack are validated
- Availability status only accepts the expected values
- Admin login requires a non-empty password

## Small but useful protections
- JWT-based auth for admin actions
- Rate limiting to slow down repeated requests
- Validation to prevent malformed input
- No sensitive values are exposed in the API responses

## Environment variables
Keep these in `.env.local` and never commit them:

```env
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-secret-key
```

If you use this for production, change the defaults and use a strong secret.

### 🚀 Setup

1. Create `.env.local` in the project root
2. Add your admin password and JWT secret there
3. Keep the file out of source control

Example:
```env
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-secret-key
```

### 🔑 Using the admin area

1. Go to `/admin`
2. Enter the admin password
3. The app will issue a short-lived token for the session
4. Logout when you are done

### 📊 Protected routes

Protected routes require a valid token:
- `POST /api/projects`
- `PUT /api/projects/[id]`
- `DELETE /api/projects/[id]`
- `PUT /api/availability`

Public routes are still rate limited:
- `GET /api/projects`
- `GET /api/availability`
- `POST /api/auth/login`

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
