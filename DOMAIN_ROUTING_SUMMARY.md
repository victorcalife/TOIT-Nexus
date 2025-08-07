# TOIT Nexus Domain-Based Routing Implementation

## Overview
The TOIT Nexus platform now implements domain-based routing to serve different content based on the incoming domain. This allows us to use a single server deployment for multiple purposes.

## Domain Routing Logic

### 1. nexus.toit.com.br
- **Purpose**: Main landing page for clients
- **Content**: Serves `nexus-quantum-landing.html`
- **Routing**: Handled in root route (`/`) and fallback route (`*`)

### 2. supnexus.toit.com.br
- **Purpose**: React admin portal for TOIT team
- **Content**: Serves React application from `client/dist/`
- **Routing**: Handled in root route (`/`) and SPA fallback route (`*`)

### 3. api.toit.com.br
- **Purpose**: Backend APIs for all services
- **Content**: 
  - Root route (`/`) returns API information JSON
  - API endpoints (`/api/*`) return appropriate JSON responses
- **Routing**: Handled in root route (`/`) and fallback route (`*`)

## Implementation Details

### Server Binding
The server binds to `0.0.0.0` to ensure compatibility with Railway deployment:

```javascript
app.listen(port, '0.0.0.0', () => {
  // Server startup logic
});
```

### Host Detection
The server uses both `host` and `x-forwarded-host` headers to determine the actual domain:

```javascript
const host = req.get('host');
const xForwardedHost = req.get('x-forwarded-host');
const realHost = xForwardedHost || host;
```

### CORS Configuration
CORS is configured to allow requests from all expected origins:

```javascript
const allowedOrigins = [
  'https://nexus.toit.com.br',
  'https://supnexus.toit.com.br',
  'https://api.toit.com.br',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];
```

## API Endpoints

All API endpoints are available under the `/api` path and can be accessed through `api.toit.com.br`:

- `https://api.toit.com.br/api/health` - Health check
- `https://api.toit.com.br/api/auth/login` - Authentication
- `https://api.toit.com.br/api/tenants` - Tenants list
- And many more backend service endpoints

## Deployment Configuration

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables
Ensure these environment variables are set in your Railway project:
- PORT (automatically set by Railway)
- SESSION_SECRET (set in Railway dashboard)
- DATABASE_URL (set by Railway PostgreSQL service)
- STRIPE_SECRET_KEY (set in Railway dashboard)

## Next Steps

1. Configure custom domains in Railway dashboard:
   - nexus.toit.com.br
   - supnexus.toit.com.br
   - api.toit.com.br

2. Set up DNS CNAME records pointing to your Railway service URL

3. Configure all required environment variables in Railway dashboard

4. Run database migrations with `railway run npm run db:push`

5. Execute database setup with `railway run npm run db:setup`

The domain-based routing is now fully implemented and ready for deployment.