# TOIT Nexus Manual Deployment Guide

This guide provides step-by-step instructions for manually deploying the TOIT Nexus platform to Railway.

## Prerequisites

1. Railway CLI installed globally:
   ```bash
   npm install -g @railway/cli
   ```

2. Railway account and login:
   ```bash
   railway login
   ```

## Deployment Steps

### 1. Create Railway Project
```bash
railway init
```
- Choose "Empty Project"
- Name it "toit-nexus"

### 2. Add PostgreSQL Database
```bash
railway add
```
- Select "Database"
- Choose "PostgreSQL"

### 3. Set Environment Variables
```bash
railway variables set PORT=5000
railway variables set SESSION_SECRET=your-strong-session-secret-here
```

### 4. Deploy Application
```bash
railway up
```

### 5. Run Database Migrations
After deployment completes:
```bash
railway run npm run db:push
```

### 6. Run Database Setup
```bash
railway run npm run db:setup
```

## Verification

### Check Deployment Status
```bash
railway status
```

### View Logs
```bash
railway logs
```

### Get Project URL
```bash
railway url
```

## Custom Domain Configuration

1. In Railway dashboard, go to Settings → Domains
2. Add your custom domains:
   - `nexus.toit.com.br`
   - `supnexus.toit.com.br`
   - `api.toit.com.br`

3. Update your DNS provider to point CNAME records to your Railway service URL

## Environment Variables to Set in Railway Dashboard

- `SESSION_SECRET` - Replace with a strong random secret
- `STRIPE_SECRET_KEY` - Add your actual Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Add your actual Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Add your actual Stripe webhook secret

## Testing Endpoints

After deployment, test these endpoints:
- Landing page: https://nexus.toit.com.br
- Admin portal: https://supnexus.toit.com.br
- API root: https://api.toit.com.br
- API health: https://api.toit.com.br/api/health

## Troubleshooting

If you encounter dependency sync issues:
1. Run `npm install` locally to regenerate package-lock.json
2. Commit the updated package-lock.json
3. Redeploy with `railway up`