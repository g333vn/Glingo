# Deployment Guide

## Overview

The application is deployed on **Vercel** with automatic deployments from Git.

## Prerequisites

- Vercel account
- GitHub/GitLab repository
- Supabase project configured
- Environment variables ready

## Vercel Setup

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository

### 2. Configure Project

**Framework Preset:** Vite  
**Root Directory:** `./` (root)  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
VITE_ENABLE_ANALYTICS=true
```

**Environment Scope:**
- **Production**: Production deployments
- **Preview**: Preview deployments (PRs)
- **Development**: Local development (optional)

### 4. Deploy

Vercel will automatically:
1. Install dependencies
2. Run build command
3. Deploy to production

## Vercel Configuration

### `vercel.json`

The project includes `vercel.json` for custom configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
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
          "key": "Content-Security-Policy",
          "value": "..."
        }
      ]
    }
  ]
}
```

**Features:**
- **SPA Routing**: All routes redirect to `index.html`
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **CSP**: Configured for Supabase, Vercel Analytics, Google Translate

## Deployment Workflow

### Automatic Deployments

```
Push to main branch → Vercel builds → Production deployment
```

### Preview Deployments

```
Create PR → Vercel builds → Preview URL generated
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_ANALYTICS` | Enable Vercel Analytics | `true` |
| `VITE_ENABLE_SPEED_INSIGHTS` | Enable Speed Insights | `true` |

### Setting Variables

**Via Vercel Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Add variable
3. Select environment (Production/Preview/Development)
4. Save

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL
# Enter value when prompted
```

## Build Configuration

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/ folder
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── index-[hash].css     # Styles
│   └── [other assets]
└── ...
```

### Build Optimization

- **Code Splitting**: Automatic via Vite
- **Tree Shaking**: Unused code removed
- **Minification**: JS/CSS minified
- **Asset Optimization**: Images optimized

## Custom Domain

### Add Domain

1. Go to Project → Settings → Domains
2. Add your domain
3. Configure DNS records as shown

### DNS Configuration

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring

### Vercel Analytics

Enabled by default via `@vercel/analytics`:

```javascript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

**Metrics:**
- Page views
- Unique visitors
- Top pages
- Referrers

### Speed Insights

Enabled via `@vercel/speed-insights`:

```javascript
import { SpeedInsights } from '@vercel/speed-insights/react';

<SpeedInsights />
```

**Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)

## Rollback

### Rollback to Previous Deployment

1. Go to Project → Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
vercel rollback [deployment-url]
```

## Performance

### Caching

Vercel automatically caches:
- Static assets (JS, CSS, images)
- HTML pages (with revalidation)

### Edge Network

- **CDN**: Global edge network
- **Automatic**: No configuration needed
- **Regions**: Automatic selection

## Troubleshooting

### Build Failures

**Issue**: Build fails with dependency errors
- **Solution**: Check `package.json` versions
- **Fix**: Update dependencies or lock versions

**Issue**: Environment variables not found
- **Solution**: Verify variables in Vercel Dashboard
- **Check**: Ensure variables are set for correct environment

**Issue**: Build succeeds but app doesn't work
- **Solution**: Check browser console for errors
- **Verify**: Environment variables are correct

### Deployment Issues

**Issue**: Changes not reflected
- **Solution**: Clear browser cache
- **Check**: Verify deployment completed successfully

**Issue**: 404 errors on routes
- **Solution**: Verify `vercel.json` rewrites configuration
- **Check**: Ensure SPA routing is configured

## Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase project ready
- [ ] Database migrations run
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tests pass (if any)
- [ ] Security headers configured
- [ ] Analytics enabled (optional)
- [ ] Custom domain configured (if needed)

## Post-deployment

### Verify Deployment

1. Check deployment status in Vercel Dashboard
2. Visit production URL
3. Test critical features:
   - User authentication
   - Content loading
   - Admin panel access
   - API connections

### Monitor

- Check Vercel Analytics
- Monitor Speed Insights
- Review error logs
- Check Supabase logs

## Production Best Practices

1. **Environment Variables**: Never commit secrets
2. **Build Optimization**: Keep bundle size small
3. **Error Monitoring**: Set up error tracking
4. **Performance**: Monitor Core Web Vitals
5. **Security**: Keep dependencies updated
6. **Backups**: Regular database backups
