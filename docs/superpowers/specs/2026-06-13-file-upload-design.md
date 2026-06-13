# File Upload & Permission Verification — Design Spec

**Date:** 2026-06-13
**Status:** approved

## Overview

Add a file upload tool backed by Cloudflare R2, protected by a hidden permission verification system. The site remains publicly accessible; only protected features require an access key stored in an environment variable. The verification system is extensible to future protected tools.

---

## Architecture

```
┌─ Browser ─────────────────────────────────────────────┐
│                                                        │
│  HiddenTrigger (footer © text, 5 clicks in 3s)         │
│       │                                                │
│       ▼                                                │
│  AuthModal (key input)                                 │
│       │  POST /api/verify { key }                      │
│       ▼                                                │
│  AuthContext (isAuthenticated state)                   │
│       │                                                │
│       ▼                                                │
│  UploadPage                                           │
│       │  locked state ──▶ shows AuthModal              │
│       │  unlocked state ─▶ drag-drop upload zone       │
│       │                                                │
│       │  POST /api/upload/presign { name, size, type } │
│       │  Authorization: Bearer <jwt>                   │
│       ▼                                                │
│       │  PUT file → R2 pre-signed URL (direct)         │
│       ▼                                                │
│       │  display publicUrl, copy button                │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Serverless (Vercel) ──────────────────────────────────┐
│                                                        │
│  pages/api/verify.js                                    │
│  ┌──────────────────────────────────────────┐          │
│  │  1. Receive { key }                      │          │
│  │  2. Compare with process.env.ACCESS_SECRET│          │
│  │  3. If match → sign JWT (24h expiry)     │          │
│  │  4. If no match → 401, delay 500ms       │          │
│  │  5. Return { token }                     │          │
│  └──────────────────────────────────────────┘          │
│                                                        │
│  pages/api/upload/presign.js                            │
│  ┌──────────────────────────────────────────┐          │
│  │  1. Validate JWT from Authorization header│         │
│  │  2. Receive { fileName, fileSize,         │          │
│  │     contentType }                         │          │
│  │  3. Validate size ≤ MAX (50MB)           │          │
│  │  4. Validate type against allowlist       │          │
│  │  5. Generate unique key: uuid_originalName│          │
│  │  6. Create S3 pre-signed PUT URL (5min)   │          │
│  │  7. Return { uploadUrl, publicUrl }       │          │
│  └──────────────────────────────────────────┘          │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ Cloudflare R2 ────────────────────────────────────────┐
│  Files stored in bucket, served via public URL          │
│  (r2.dev subdomain or custom domain)                    │
└────────────────────────────────────────────────────────┘
```

## Key Design Decision: Pre-signed URLs

Vercel serverless functions impose a ~4.5MB request body limit. Uploading files through an API route would cap file size at 4.5MB. Instead, the server generates a pre-signed S3 PUT URL and returns it to the client. The client uploads the file directly to R2, bypassing Vercel entirely.

Benefits:
- No file size limit from Vercel (R2 supports up to 5TB per object)
- Real upload progress via native XHR events
- Reduced serverless compute cost (handles only small JSON requests)
- Pre-signed URLs are time-limited (5 min), scoped to a single object key

## Environment Variables

| Variable | Purpose | Notes |
|----------|---------|-------|
| `ACCESS_SECRET` | Login verification key | ≥32 random chars; compared against user input |
| `JWT_SECRET` | JWT signing key | Independent from ACCESS_SECRET; ≥64 random chars |
| `R2_ACCOUNT_ID` | Cloudflare account ID | From Cloudflare dashboard |
| `R2_ACCESS_KEY_ID` | R2 API token ID | Created in R2 → Manage API Tokens |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret | Only shown once at token creation |
| `R2_BUCKET_NAME` | Target bucket name | e.g. `vibe-tools-uploads` |
| `R2_PUBLIC_URL` | Public base URL | e.g. `https://pub-xxx.r2.dev` or custom domain |

## File Naming & Constraints

### Naming
- Pattern: `{uuid}_{sanitized-original-name}`
- Sanitization: strip path separators, control chars, limit to 255 bytes
- UUID prevents collisions; original name preserved for readability

### Constraints
| Parameter | Value |
|-----------|-------|
| Max file size | 50 MB |
| Allowed types | image/*, application/pdf, application/zip, application/gzip, application/x-7z-compressed, application/x-rar-compressed, text/plain, text/csv, application/json, application/vnd.openxmlformats-officedocument.*, application/vnd.ms-* |
| Pre-signed URL TTL | 5 minutes |
| Concurrency | 3 parallel uploads max (client-side) |

## Components

### HiddenTrigger
- Wraps a plain text element (footer copyright year `© 2026`)
- No visual indication of interactivity
- Tracks clicks; 5 clicks within 3 seconds fires `onActivated` callback
- Timeout resets counter; no UI feedback during counting
- CSS: `user-select: none` to prevent text selection highlighting
- Exposes no identifying class names or data attributes

### AuthModal
- Shown when `HiddenTrigger` activates OR a protected page loads without valid session
- Single text input for access key (type=password)
- "Unlock" button + Enter key support
- Error state: "密钥不正确" with shake animation
- Loading state during verification request
- No "forgot password" or hints — by design for personal use
- Closes on success; AuthContext updates

### UploadPage (pages/tools/upload/index.js)
- **Locked state**: Shows AuthModal only (or a lock placeholder with "输入密钥解锁" button that opens AuthModal)
- **Unlocked state**:
  - Drag-and-drop zone with dashed border, file icon
  - Click to open file picker
  - File list with: name, size, progress bar, status icon
  - Per-file: copy URL button (on success), remove button
  - Multi-file support (3 concurrent, queued)
  - Empty state messaging when no files

## API Routes

### POST /api/verify
```
Request:  { key: string }
Response: { token: string }  // JWT, 24h expiry
Errors:   400 missing key, 401 wrong key
Headers:  Content-Type: application/json
```

Behavior: 500ms artificial delay before responding to slow brute-force attempts. JWT payload: `{ iat, exp }`. No user identity stored — single-user personal tool.

### POST /api/upload/presign
```
Request:  { fileName: string, fileSize: number, contentType: string }
Headers:  Authorization: Bearer <jwt>
Response: { uploadUrl: string, publicUrl: string, key: string }
Errors:   401 invalid/expired JWT, 400 invalid params, 413 file too large, 415 unsupported type
```

Validation:
1. JWT signature and expiry check
2. fileName: non-empty, ≤255 chars after sanitization
3. fileSize: >0, ≤52428800
4. contentType: matches allowlist

Upload URL TTL: 300 seconds (5 min). After expiry, client must request a new presigned URL.

## Auth Flow

```
User opens site
  │
  ▼
Site loads normally (public)
  │
  ▼
User navigates to /tools/upload or clicks hidden trigger
  │
  ▼
AuthContext.isAuthenticated?
  ├─ true → render tool normally
  └─ false → show AuthModal
               │
               ▼
             User enters key → POST /api/verify
               │
               ├─ 200 → store JWT in sessionStorage
               │        set isAuthenticated = true
               │        render tool
               │
               └─ 401 → show error, increment attempt counter (client-side)
                         5 client-side failures → 60s local cooldown
```

Session lifecycle:
- Created on successful verification (24h JWT)
- Survives page refreshes (sessionStorage)
- Destroyed on tab close (sessionStorage scope)
- No "logout" button in v1 — close tab to end session

## Testing

### Unit Tests (Jest + React Testing Library)
| Area | Test |
|------|------|
| `utils/auth.js` | `signToken()` returns valid JWT |
| `utils/auth.js` | `verifyToken()` accepts valid token |
| `utils/auth.js` | `verifyToken()` rejects expired token |
| `utils/auth.js` | `verifyToken()` rejects tampered token |
| `utils/auth.js` | `verifyToken()` rejects token with wrong secret |
| `utils/r2.js` | `validateFile()` accepts valid input |
| `utils/r2.js` | `validateFile()` rejects oversized file |
| `utils/r2.js` | `validateFile()` rejects disallowed type |
| `utils/r2.js` | `validateFile()` rejects empty filename |
| `utils/r2.js` | `generateFileKey()` produces expected format |
| `utils/r2.js` | `sanitizeFileName()` strips dangerous chars |
| `pages/api/verify.js` | Returns 400 when key missing |
| `pages/api/verify.js` | Returns 401 for wrong key |
| `pages/api/verify.js` | Returns 200 + JWT for correct key |
| `pages/api/verify.js` | Response delayed ≥500ms |
| `pages/api/upload/presign.js` | Returns 401 without valid JWT |
| `pages/api/upload/presign.js` | Returns 401 with expired JWT |
| `pages/api/upload/presign.js` | Returns 413 for oversized file |
| `pages/api/upload/presign.js` | Returns 415 for disallowed type |
| `pages/api/upload/presign.js` | Returns pre-signed URL on valid request |
| `components/HiddenTrigger` | Fires onActivated after 5 clicks within 3s |
| `components/HiddenTrigger` | Resets count when clicks exceed 3s interval |
| `components/HiddenTrigger` | Does NOT fire after 4 clicks |
| `components/AuthModal` | Renders input and button |
| `components/AuthModal` | Calls onVerify with entered key |
| `components/AuthModal` | Shows error message on failure |
| `components/AuthModal` | Shows loading state during verification |
| `contexts/AuthContext` | Default isAuthenticated is false |
| `contexts/AuthContext` | Sets isAuthenticated after successful verify |
| `contexts/AuthContext` | Clears auth on clearAuth() |

### Integration Tests
| Area | Test |
|------|------|
| Upload page | Locked state renders AuthModal trigger |
| Upload page | Unlocked state shows drop zone |
| Upload page | File selection opens file picker |
| Full flow | Verify → get JWT → request presign URL |

## Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/s3-request-presigner": "^3.x",
  "jsonwebtoken": "^9.x"
}
```

## Error Messages (User-Facing)

| Context | Chinese |
|---------|---------|
| Wrong key | 密钥不正确 |
| Missing key | 请输入密钥 |
| Session expired | 会话已过期，请重新验证 |
| File too large | 文件超过 50MB 限制 |
| Unsupported type | 不支持的文件类型 |
| Upload failed | 上传失败，请重试 |
| Network error | 网络连接中断 |
| Verification failed | 验证服务暂时不可用，请稍后再试 |

## Future Extensibility

To protect a new tool, add its route to a config array and wrap its page component with the AuthContext check:

```js
// Example: protecting a future tool
const PROTECTED_TOOLS = ['upload', 'admin'];
```

The HiddenTrigger reveals a list of protected tools when activated (beyond just the upload tool), allowing the user to navigate to any protected tool from a single unlock.

---

## Self-Review

- [x] No TBD/TODO placeholders
- [x] Architecture matches feature descriptions
- [x] Scope: single upload tool + reusable auth system — appropriately sized
- [x] Pre-signed URL approach resolves Vercel body limit issue
- [x] Environment variable names are consistent
- [x] Error handling covers all known failure modes
- [x] Testing plan covers both auth and upload paths
