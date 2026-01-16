# Security Guide

## Overview

This document outlines security best practices and measures implemented in the application.

## Authentication & Authorization

### Supabase Auth

- **PKCE Flow**: Used for OAuth (recommended for web apps)
- **Session Management**: Stored securely in localStorage
- **Token Refresh**: Automatic token refresh before expiry
- **Email Verification**: Required for new accounts (configurable)

### Role-Based Access Control (RBAC)

**Roles:**
- `admin`: Full system access
- `editor`: Content editing only
- `user`: Standard user access

**Implementation:**
```javascript
// Check role in frontend
const { profile } = useAuth();
if (profile?.role === 'admin') {
  // Admin-only code
}

// Enforced in backend via RLS
```

### Row Level Security (RLS)

All database tables have RLS enabled with policies:

```sql
-- Example: Only admins can update books
CREATE POLICY "Admins can manage books" ON books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Data Protection

### Password Security

- **Hashing**: Handled by Supabase Auth (bcrypt)
- **Minimum Length**: 6 characters (enforced)
- **No Plain Text**: Passwords never stored in plain text
- **Reset Flow**: Secure password reset via email

### Sensitive Data

**Never store in client:**
- Service role keys
- Database passwords
- API secrets
- User passwords (even hashed)

**Safe to store:**
- Anon keys (public)
- User session tokens (encrypted by Supabase)
- Public configuration

### Input Validation

```javascript
// ✅ Good - Validate input
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Good - Sanitize user input
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}

// ❌ Bad - No validation
function saveData(userInput) {
  // Directly use userInput - vulnerable to injection
}
```

## Security Headers

### Vercel Configuration

Configured in `vercel.json`:

```json
{
  "headers": [
    {
      "key": "Strict-Transport-Security",
      "value": "max-age=31536000; includeSubDomains; preload"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; ..."
    }
  ]
}
```

### Headers Explained

| Header | Purpose |
|--------|---------|
| **HSTS** | Force HTTPS connections |
| **X-Frame-Options** | Prevent clickjacking |
| **X-Content-Type-Options** | Prevent MIME sniffing |
| **CSP** | Restrict resource loading |
| **Referrer-Policy** | Control referrer information |

### Content Security Policy (CSP)

**Allowed Sources:**
- `'self'`: Same origin
- `https://*.supabase.co`: Supabase APIs
- `https://*.vercel-analytics.com`: Analytics
- `https://translate.googleapis.com`: Google Translate

**Blocked:**
- Inline scripts (except necessary)
- `eval()` usage
- Unsafe inline styles (limited)

## API Security

### Supabase Client

```javascript
// ✅ Good - Use anon key (public, safe)
const supabase = createClient(url, anonKey);

// ❌ Bad - Never use service role key in client
const supabase = createClient(url, serviceRoleKey);
```

### Service Role Key

**⚠️ CRITICAL:**
- **Never** use in client-side code
- **Only** use in server-side functions (Edge Functions, backend APIs)
- **Never** commit to Git
- **Rotate** if exposed

### API Endpoints

All API calls go through Supabase:
- RLS policies enforce access control
- No direct database access from client
- All queries validated by Supabase

## Storage Security

### LocalStorage

**Safe to store:**
- User preferences
- Cached data (non-sensitive)
- Session tokens (encrypted by Supabase)

**Never store:**
- Passwords
- API keys
- Personal sensitive data

### IndexedDB

- Same security considerations as localStorage
- Used for larger data caching
- No sensitive data stored

### Supabase Storage

- Files uploaded to Supabase Storage
- Access controlled via RLS policies
- Public buckets for public assets only

## XSS Prevention

### React's Built-in Protection

React automatically escapes content:

```jsx
// ✅ Safe - React escapes automatically
<div>{userInput}</div>

// ⚠️ Dangerous - Only if you trust the content
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Rich Text Content

For rich text (lessons, descriptions):
- Use sanitized HTML
- Validate on server side
- Consider using a library like DOMPurify

### URL Validation

```javascript
// ✅ Good - Validate URLs
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

## CSRF Protection

### Supabase Protection

- Supabase handles CSRF protection
- Tokens validated on each request
- Session-based authentication

### Additional Measures

- SameSite cookies (handled by Supabase)
- Origin validation
- Referrer checking

## SQL Injection Prevention

### Parameterized Queries

Supabase client uses parameterized queries:

```javascript
// ✅ Good - Parameterized (safe)
const { data } = await supabase
  .from('books')
  .select('*')
  .eq('id', bookId);  // bookId is parameterized

// ❌ Bad - String concatenation (dangerous)
const query = `SELECT * FROM books WHERE id = '${bookId}'`;
```

### RLS Policies

RLS policies also prevent SQL injection:
- Policies use parameterized queries
- User input never directly in SQL

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Dependency Review

- Review new dependencies before adding
- Check for known vulnerabilities
- Prefer well-maintained packages
- Keep dependencies updated

## Environment Variables

### Client-Side Variables

**Safe (public):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENABLE_ANALYTICS`

**Never expose:**
- Service role keys
- Database passwords
- API secrets

### Server-Side Variables

Use Supabase Edge Functions or backend APIs for:
- Service role keys
- Third-party API keys
- Database credentials

## Security Checklist

### Development

- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] RLS policies tested
- [ ] Input validation implemented
- [ ] Error messages don't leak info
- [ ] Dependencies updated

### Deployment

- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Service role key secured
- [ ] Database backups enabled
- [ ] Monitoring enabled

### Regular Maintenance

- [ ] Review security logs
- [ ] Update dependencies
- [ ] Rotate keys if needed
- [ ] Review RLS policies
- [ ] Audit user access
- [ ] Test security measures

## Incident Response

### If Security Breach Suspected

1. **Immediate Actions:**
   - Rotate all API keys
   - Review access logs
   - Check for unauthorized access
   - Notify affected users

2. **Investigation:**
   - Review Supabase logs
   - Check Vercel logs
   - Review Git history
   - Identify breach vector

3. **Remediation:**
   - Fix vulnerability
   - Update security measures
   - Deploy fix
   - Monitor for recurrence

## Security Best Practices

1. **Principle of Least Privilege**
   - Users only get minimum required access
   - Admins only when necessary

2. **Defense in Depth**
   - Multiple security layers
   - Frontend + Backend + Database

3. **Regular Audits**
   - Review code for vulnerabilities
   - Test security measures
   - Update dependencies

4. **Stay Informed**
   - Follow security news
   - Update when vulnerabilities found
   - Use security tools

5. **User Education**
   - Strong password requirements
   - Security awareness
   - Report suspicious activity

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [React Security](https://react.dev/learn/escape-hatches)
- [Vercel Security](https://vercel.com/docs/security)
