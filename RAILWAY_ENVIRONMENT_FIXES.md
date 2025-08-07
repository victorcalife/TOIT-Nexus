# TOIT Nexus Railway Environment Configuration Fixes

## Issues Identified

Based on your Railway environment variables output, I've identified several configuration issues that need to be addressed:

### 1. API_URL Configuration Issue
```
API_URL: api.nexus.com.br
```
**Problem**: This should be `api.toit.com.br` to match your domain-based routing configuration.

**Fix**: Update the API_URL environment variable in your Railway dashboard to `api.toit.com.br`.

### 2. SESSION_SECRET Security Issue
```
SESSION_SECRET: meu segredo
```
**Problem**: This is a weak default value that is not secure for production use.

**Fix**: Generate a strong random secret and update the SESSION_SECRET in your Railway dashboard.

### 3. Stripe Key Configuration Issue
```
STRIPE_PUBLISHABLE_KEY: minha chave
STRIPE_SECRET_KEY: minha chave
STRIPE_WEBHOOK_SECRET: minha chave
```
**Problem**: These are placeholder values that need to be replaced with actual Stripe API keys.

**Fix**: Configure your actual Stripe keys in the Railway dashboard.

## Required Actions

### Immediate Fixes Needed in Railway Dashboard:
1. Change `API_URL` from `api.nexus.com.br` to `api.toit.com.br`
2. Replace `SESSION_SECRET` value with a strong random secret
3. Configure actual Stripe API keys:
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### Domain Configuration:
You need to add your custom domains in the Railway dashboard:
1. Go to your Railway project → Settings → Domains
2. Add these domains:
   - `nexus.toit.com.br`
   - `supnexus.toit.com.br`
   - `api.toit.com.br`

### DNS Configuration:
Set up CNAME records for each domain pointing to your Railway service URL:
```
CNAME nexus.toit.com.br → YOUR_RAILWAY_SERVICE_URL
CNAME supnexus.toit.com.br → YOUR_RAILWAY_SERVICE_URL
CNAME api.toit.com.br → YOUR_RAILWAY_SERVICE_URL
```

## Verification Steps

After making these changes, verify that:

1. All domains are properly configured in Railway
2. DNS records are correctly set up
3. Environment variables are updated with proper values
4. Test the deployment with:
   - `https://nexus.toit.com.br` → Should show landing page
   - `https://supnexus.toit.com.br` → Should show React admin portal
   - `https://api.toit.com.br/api/health` → Should return health check JSON
   - `https://api.toit.com.br/api/auth/login` → Should handle authentication
   - `https://api.toit.com.br/api/tenants` → Should return tenants list

## Security Recommendations

1. Generate a strong SESSION_SECRET using a password generator or crypto library
2. Store Stripe keys securely and never commit them to version control
3. Consider using Railway's encrypted environment variables for sensitive data
4. Regularly rotate secrets and keys for security best practices

## Next Steps

1. Update environment variables in Railway dashboard
2. Configure custom domains in Railway
3. Set up DNS CNAME records with your domain provider
4. Redeploy the application with `railway up`
5. Run database migrations with `railway run npm run db:push`
6. Execute database setup with `railway run npm run db:setup`
7. Test all endpoints and domain routing

These fixes will ensure your TOIT Nexus platform works correctly with the domain-based routing we've implemented.