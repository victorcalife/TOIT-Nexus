# TOIT Nexus Domain Configuration

## Current Domain Setup

The TOIT Nexus platform uses domain-based routing to serve different content:

1. **nexus.toit.com.br** - Main landing page for clients
2. **supnexus.toit.com.br** - React admin portal for TOIT team
3. **api.toit.com.br** - Backend APIs for all services

## Required Railway Domain Configuration

To properly route these domains, you need to configure them in your Railway project:

1. Go to your Railway project dashboard
2. Navigate to Settings → Domains
3. Add each domain as a custom domain:
   - nexus.toit.com.br
   - supnexus.toit.com.br
   - api.toit.com.br

## DNS Configuration

For each domain, you need to set up a CNAME record pointing to your Railway service:

```
CNAME nexus.toit.com.br → toit-nexus.up.railway.app
CNAME supnexus.toit.com.br → toit-nexus.up.railway.app
CNAME api.toit.com.br → toit-nexus.up.railway.app
```

## Environment Variables

Ensure these environment variables are set in your Railway project:

- PORT (automatically set by Railway)
- SESSION_SECRET (set in Railway dashboard)
- DATABASE_URL (set by Railway PostgreSQL service)
- STRIPE_SECRET_KEY (set in Railway dashboard)

## Testing Endpoints

After domain configuration, these endpoints should be accessible:

- https://nexus.toit.com.br → Landing page
- https://supnexus.toit.com.br → React admin portal
- https://api.toit.com.br/api/health → Health check
- https://api.toit.com.br/api/auth/login → Authentication
- https://api.toit.com.br/api/tenants → Tenants list

## Server Configuration

The integrated server (`railway-frontend.js`) handles domain-based routing:
1. It binds to `0.0.0.0` for Railway compatibility
2. It uses `x-forwarded-host` header to determine the actual domain
3. It serves different content based on the domain:
   - nexus.toit.com.br → `nexus-quantum-landing.html`
   - supnexus.toit.com.br → React app from `client/dist/`
   - api.toit.com.br → Backend API endpoints

The server is configured to work with all three domains simultaneously.