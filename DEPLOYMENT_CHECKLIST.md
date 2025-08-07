# TOIT Nexus Deployment Checklist

## Pre-deployment Checks

### ✅ Package Dependencies
- [x] package.json and package-lock.json are in sync
- [x] All required dependencies are listed in package.json
- [x] drizzle-kit version matches between package.json and package-lock.json
- [x] ts-node and related dependencies are properly included

### ✅ Server Configuration
- [x] railway-frontend.js binds to '0.0.0.0' for Railway compatibility
- [x] Domain-based routing is implemented correctly
- [x] Static file serving is domain-specific
- [x] API endpoints are properly configured

### ✅ Build Process
- [x] Client frontend builds successfully (client/dist directory)
- [x] Backend server compiles correctly (server/dist directory)
- [x] deploy.js script automates both frontend and backend builds

## Railway Dashboard Configuration Required

### ⚠️ Environment Variables
- [ ] API_URL - Should be set to `api.toit.com.br`
- [ ] SESSION_SECRET - Should be a strong random secret
- [ ] STRIPE_SECRET_KEY - Should be configured with actual key
- [ ] STRIPE_PUBLISHABLE_KEY - Should be configured with actual key
- [ ] STRIPE_WEBHOOK_SECRET - Should be configured with actual key

### ⚠️ Custom Domains
- [ ] nexus.toit.com.br - Add in Railway project settings
- [ ] supnexus.toit.com.br - Add in Railway project settings
- [ ] api.toit.com.br - Add in Railway project settings

### ⚠️ DNS Configuration
- [ ] CNAME record for nexus.toit.com.br pointing to Railway service URL
- [ ] CNAME record for supnexus.toit.com.br pointing to Railway service URL
- [ ] CNAME record for api.toit.com.br pointing to Railway service URL

## Post-deployment Actions

### ⚠️ Database Setup
- [ ] Run database migrations with `railway run npm run db:push`
- [ ] Execute database setup with `railway run npm run db:setup`

### ⚠️ Testing Endpoints
- [ ] https://nexus.toit.com.br - Should show landing page
- [ ] https://supnexus.toit.com.br - Should show React admin portal
- [ ] https://api.toit.com.br - Should show API information JSON
- [ ] https://api.toit.com.br/api/health - Should return health check JSON
- [ ] https://api.toit.com.br/api/auth/login - Should handle authentication
- [ ] https://api.toit.com.br/api/tenants - Should return tenants list

## Security Recommendations

### ⚠️ To Implement
- [ ] Generate strong SESSION_SECRET using password generator or crypto library
- [ ] Store Stripe keys securely and never commit them to version control
- [ ] Use Railway's encrypted environment variables for sensitive data
- [ ] Regularly rotate secrets and keys for security best practices

## Troubleshooting

If deployment issues persist:
1. Check Railway logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure custom domains are properly configured in Railway dashboard
4. Confirm DNS CNAME records are correctly set up with domain provider
5. Test the application locally before deploying
6. Check that the PostgreSQL database service is properly linked

## Next Steps

1. Complete all unchecked items in Railway Dashboard Configuration
2. Redeploy the application with `railway up`
3. Run post-deployment actions
4. Test all endpoints
5. Monitor logs for any issues