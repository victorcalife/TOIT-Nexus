# TOIT Nexus Deployment Guide

This guide provides step-by-step instructions for deploying the TOIT Nexus application to Railway.

## Prerequisites

1. Railway CLI installed and logged in
2. PostgreSQL database provisioned on Railway
3. Environment variables configured in Railway dashboard:
   - `DATABASE_URL` (provided by Railway PostgreSQL)
   - `SESSION_SECRET` (secure random string)
   - `STRIPE_SECRET_KEY` (if using Stripe payments)
   - `STRIPE_PUBLISHABLE_KEY` (if using Stripe payments)
   - `STRIPE_WEBHOOK_SECRET` (if using Stripe webhooks)

## Deployment Steps

### 1. Verify Project Structure
Ensure all required directories and files exist:
- `client/` (React frontend)
- `server/` (Node.js backend)
- `shared/` (Database schema)
- `drizzle/` (Migration files)
- `scripts/` (Setup scripts)
- `package.json` (Root package file)
- `railway.json` (Railway configuration)
- `drizzle.config.ts` (Drizzle configuration)
- `railway-frontend.js` (Main server file)

### 2. Build Client Application
```bash
npm run client:build
```

This will create the production build in `client/dist/` directory.

### 3. Deploy to Railway
```bash
railway up
```

This command will:
- Build the application using NIXPACKS
- Deploy both frontend and backend components
- Use the configuration from `railway.json`

### 4. Set Environment Variables
After deployment, configure the required environment variables in the Railway dashboard:
1. Go to your Railway project
2. Click on the service
3. Go to the Variables tab
4. Add the required variables

### 5. Run Database Setup
Once deployed, run the database setup script:
```bash
railway run npm run db:setup
```

This will:
- Create all database tables based on your schema
- Apply any pending migrations

### 6. Verify Deployment
Check the deployed application:
```bash
railway url
```

This will show your application URL. You can also check:
- Health endpoint: `/api/health`
- Debug endpoint: `/api/debug-integrated`

## Troubleshooting

### Database Connection Issues
1. Verify `DATABASE_URL` is correctly set in Railway environment variables
2. Check if the PostgreSQL service is properly provisioned
3. Ensure the database user has proper permissions

### Frontend Issues
1. Verify `client/dist/index.html` exists after build
2. Check if all client dependencies are properly installed

### Backend Issues
1. Verify all server dependencies are in `package.json`
2. Check Railway logs for any runtime errors:
   ```bash
   railway logs
   ```

## Custom Domains

To set up custom domains:
1. Configure your domains in Railway dashboard
2. Update DNS records to point to your Railway service URL
3. The domain routing is already implemented in `railway-frontend.js`:
   - `nexus.toit.com.br` → Landing page
   - `supnexus.toit.com.br` → Admin portal (React app)
   - `api.toit.com.br` → API endpoints

## Quantum Monetization System

The quantum monetization system includes:
- Quantum packages (Lite and Unstoppable)
- Algorithm pricing based on credit consumption
- Transaction history tracking
- Usage analytics

All these components will be automatically created when you run the database setup.

## Maintenance Commands

### Generate New Migrations
When you update the schema:
```bash
npx drizzle-kit generate --config=drizzle.config.ts
```

### Apply Migrations
```bash
railway run npm run db:push
```

### Check Migration Status
```bash
npx drizzle-kit check --config=drizzle.config.ts
```