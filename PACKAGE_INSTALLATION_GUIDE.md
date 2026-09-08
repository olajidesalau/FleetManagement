# Package Installation Guide

## Updated Dependencies

Added the following packages to `package.json`:

### Production Dependencies

#### 1. **bcrypt** (^5.1.1)
- **Purpose**: Password hashing and verification
- **Why**: The project currently uses placeholder password hashing. This package provides secure bcrypt hashing for production.
- **Usage**:
  ```javascript
  import bcrypt from 'bcrypt'
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Verify password
  const isValid = await bcrypt.compare(password, hashedPassword)
  ```
- **File to Update**: `src/index.tsx` (replace placeholder `hashPassword()` function)

#### 2. **jose** (^5.2.0)
- **Purpose**: JSON Web Token (JWT) handling and signing
- **Why**: The project currently uses base64 encoding instead of proper JWT signing. This package provides HMAC signing for secure tokens.
- **Usage**:
  ```javascript
  import { jwtVerify, SignJWT } from 'jose'
  
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  
  // Create token
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)
  
  // Verify token
  const verified = await jwtVerify(token, secret)
  ```
- **File to Update**: `src/index.tsx` (replace placeholder `encodeJWT()` and `decodeJWT()` functions)

## Installation Instructions

### Using npm (Recommended)

```bash
cd webapp
npm install
```

Or install individually:

```bash
npm install bcrypt jose
```

### Using yarn

```bash
yarn add bcrypt jose
```

### Using pnpm

```bash
pnpm add bcrypt jose
```

## Current Dependencies

**Full dependency list** (after installation):

```json
{
  "dependencies": {
    "hono": "^4.11.4",
    "bcrypt": "^5.1.1",
    "jose": "^5.2.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20260114.0",
    "@hono/vite-build": "^1.2.0",
    "@hono/vite-dev-server": "^0.18.2",
    "typescript": "^5.0.0",
    "vite": "^6.3.5",
    "wrangler": "^4.4.0"
  }
}
```

## Next Steps: Update Code

### Replace Password Hashing

In `src/index.tsx`, replace the placeholder `hashPassword()` function:

**Before (Placeholder):**
```typescript
function hashPassword(password: string): string {
  return `hashed_${password}_123`
}
```

**After (Using bcrypt):**
```typescript
import bcrypt from 'bcrypt'

async function hashPassword(password: string): string {
  return await bcrypt.hash(password, 10)
}

async function verifyPassword(password: string, hash: string): boolean {
  return await bcrypt.compare(password, hash)
}
```

### Replace JWT Handling

In `src/index.tsx`, replace the placeholder JWT functions:

**Before (Placeholder):**
```typescript
function encodeJWT(payload: any, secret: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = btoa(`${header}.${body}.${secret}`)
  return `${header}.${body}.${signature}`
}

function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}
```

**After (Using jose):**
```typescript
import { jwtVerify, SignJWT } from 'jose'

const getSecret = () => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  return new TextEncoder().encode(secret)
}

async function encodeJWT(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getSecret())
}

async function decodeJWT(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(token, getSecret())
    return verified.payload
  } catch {
    return null
  }
}
```

## Environment Variables

### Add to `.env` or Wrangler Secrets

```bash
JWT_SECRET=your-super-secret-key-change-this-in-production
BCRYPT_ROUNDS=10
```

For production (Cloudflare Pages):
```bash
npx wrangler pages secret put JWT_SECRET --project-name snow-fleet-management
```

## Verification

To verify packages are installed:

```bash
npm list bcrypt jose
```

Expected output:
```
snow-fleet-management@1.0.0
├── bcrypt@5.1.1
└── jose@5.2.0
```

## Performance Considerations

### Bcrypt
- **Hashing is CPU-intensive**: Use `bcrypt.hash()` carefully in production
- **Recommended rounds**: 10 (default) for production
- **Slower is better**: Protects against brute-force attacks

### Jose
- **Lightweight**: ~5KB gzipped
- **Edge-compatible**: Works on Cloudflare Workers
- **Fast**: Native crypto API

## Security Checklist

Before deploying to production:

- [ ] JWT_SECRET is set in environment variables
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Password hashing uses bcrypt (not placeholder)
- [ ] Bcrypt rounds set to 10+ (recommended)
- [ ] All API endpoints validate JWT tokens
- [ ] Role-based access control is enforced
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Secrets are not committed to git

## Migration Guide

### If upgrading from placeholder auth:

1. **Backup existing passwords**: Note any test accounts
2. **Update password column**: Optional - can run migration
3. **Update auth functions**: Replace placeholder functions
4. **Test auth flow**: Login, register, token refresh
5. **Deploy carefully**: Test in staging first

### Keeping placeholder passwords (temporary):

If you want to keep existing placeholder passwords temporarily:

```typescript
async function verifyPassword(password: string, storedHash: string): boolean {
  // Support both placeholder and bcrypt hashes
  if (storedHash.startsWith('hashed_')) {
    // Placeholder hash
    return storedHash === `hashed_${password}_123`
  }
  // Bcrypt hash
  return await bcrypt.compare(password, storedHash)
}
```

## Troubleshooting

### Bcrypt Installation Issues

If bcrypt fails to install:
```bash
npm install --build-from-source bcrypt
```

Or use a pre-built version:
```bash
npm install bcrypt-nodejs
```

### Jose Import Errors

Ensure TypeScript recognizes the imports:
```typescript
import { jwtVerify, SignJWT } from 'jose'
```

If issues persist, update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### Async/Await Issues

Remember that bcrypt and jose return Promises:

```typescript
// ❌ Wrong
const hash = bcrypt.hash(password, 10)

// ✅ Correct
const hash = await bcrypt.hash(password, 10)
```

## Additional Recommended Packages

For future enhancements, consider adding:

```json
{
  "dependencies": {
    "zod": "^3.22.0",        // Schema validation
    "dotenv": "^16.0.0",     // Environment variables
    "uuid": "^9.0.0",        // Generate unique IDs
    "axios": "^1.6.0"        // HTTP client (for frontend)
  },
  "devDependencies": {
    "vitest": "^1.0.0",      // Testing framework
    "@types/bcrypt": "^5.0.0" // TypeScript types
  }
}
```

## Documentation Files

For more information, see:
- `README.md` - Project overview
- `.github/copilot-instructions.md` - AI agent guide
- `PAGES_INTEGRATION_GUIDE.md` - Frontend integration
- `QUICK_REFERENCE.md` - Quick lookup

---

**Updated**: January 27, 2026
**Status**: Ready for implementation
**Next**: Update authentication code in `src/index.tsx`
