# replit.md

## Overview

This is a full-stack investment workflow automation platform called "InvestFlow" built with React, Express, and PostgreSQL. The application provides a comprehensive solution for investment firms to automate client management, create custom workflows, and generate reports through an intuitive interface.

**MAJOR UPDATE (January 30, 2025)**: Pivoting back to core TOIT NEXUS workflow automation system with focus on:
- Real-time notifications system
- Interactive no-code query builder with epic UI
- KPI creation and personalized dashboards
- User workspace saving capabilities
- Lead capture landing page with 7-day free trial
- Professional marketing messaging targeting democratization of enterprise automation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with structured error handling and request logging

### Database Layer
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with WebSocket support for serverless environments

## Key Components

### Authentication & Authorization System
- **Provider**: Replit OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies, secure flags, and CSRF protection
- **User Management**: Automatic user creation/updates on authentication
- **Department-Based Access Control**:
  - Users belong to one or more departments within their tenant
  - Permissions assigned by role and department combination
  - Granular resource-action control (clients.read, reports.write, workflows.admin, etc.)
  - Department-specific data filtering ensures users see only relevant information
  - User-specific permission overrides for fine-tuned access control

### Client Management
- **Client Categories**: Configurable client segmentation with risk profiles and investment thresholds
- **Client Records**: Comprehensive client data including contact information, investment amounts, and metadata
- **Risk Profiling**: Three-tier risk assessment (conservative, moderate, aggressive)

### Workflow Engine
- **Workflow Builder**: Visual workflow creation with triggers, conditions, and actions
- **Execution Tracking**: Workflow execution history and status monitoring
- **Integration Points**: Support for API, database, webhook, and email integrations
- **Business Rules**: Configurable rules engine for client categorization and automated actions

### Integration Framework
- **Types**: API, Database, Webhook, and Email integrations
- **Configuration**: JSON-based configuration storage for flexible integration setup
- **Status Monitoring**: Real-time integration health and performance tracking

### Reporting System
- **Report Generation**: Automated report creation based on client categories and workflows
- **Activity Tracking**: Comprehensive audit trail for all system activities
- **Dashboard Analytics**: Real-time statistics and recent activity monitoring

## Access Control Examples
### Real-World Scenarios Solved:
1. **Sales Department**: Can view all clients but only edit prospects and active sales opportunities
2. **Finance Department**: Has read access to all financial data, write access to billing and payment records
3. **Purchases Department**: Manages vendor relationships and purchasing workflows, no access to sales data
4. **Operations Department**: Monitors all workflows and system performance, limited client data access
5. **Cross-Department Managers**: Assigned to multiple departments with elevated permissions

### Permission Matrix:
- **super_admin**: All permissions across all tenants
- **tenant_admin**: All permissions within their tenant
- **manager**: Department-specific admin permissions + cross-department read access
- **employee**: Department-specific read/write permissions based on role

## Data Flow

### Multi-Tenant Architecture with Department-Based Access Control (Updated January 30, 2025)
1. **TOIT Administrative Flow**: Super admin → `/admin` dashboard → Complete system control
   - Create and manage all tenant companies
   - Configure departments, permissions, and user roles globally
   - Monitor system performance, usage analytics, and billing
   - Set up default structures for new tenants
   - Manage global templates and configurations
2. **Tenant User Flow**: Client login → Tenant-specific interface → Isolated data access
3. **Data Isolation**: All operations filtered by tenant_id through middleware
4. **Role-Based Access**: Four levels (super_admin, tenant_admin, manager, employee)
5. **Department Segregation**: Users assigned to departments (sales, purchases, finance, operations, hr, it, marketing, custom)
6. **Granular Permissions**: Resource-action permissions (read, write, delete, admin) assigned by role and department
7. **Data Filtering**: Each department sees only relevant data based on configured filters
8. **Security**: Complete tenant separation with department-level access control
9. **TOIT Control**: Complete administrative oversight with ability to configure any aspect of any tenant

### Original Flows (Tenant-Specific)
1. **Authentication Flow**: User authenticates via Replit OIDC → Session created in PostgreSQL → User data synchronized
2. **Client Management Flow**: Client data entered → Categorized based on rules → Workflows triggered automatically
3. **Workflow Execution Flow**: Trigger conditions met → Workflow actions executed → Results logged and tracked
4. **Integration Flow**: Workflows invoke integrations → External systems called → Responses processed and stored
5. **Reporting Flow**: Data aggregated from workflows and activities → Reports generated → Delivered via configured channels

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **express**: Web application framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API proxy
- **Hot Reload**: Vite HMR for frontend, tsx watch for backend
- **Database**: Neon PostgreSQL with local connection pooling

### Production Environment
- **Build Process**: Vite builds frontend to static assets, esbuild bundles backend
- **Deployment**: Single Node.js server serving both API and static files
- **Database**: Production Neon PostgreSQL instance
- **Session Storage**: PostgreSQL-backed sessions for horizontal scaling

### Configuration Management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS, ISSUER_URL
- **Database Migrations**: Automated via drizzle-kit push command
- **Asset Management**: Vite handles asset optimization and caching

The application follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the full stack. The architecture prioritizes developer experience with hot reload, comprehensive TypeScript support, and a component-based UI system while maintaining production readiness with proper authentication, session management, and database optimization.