# 🧠 TOIT NEXUS - Quantum ML Technical Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Frontend Components](#frontend-components)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[Hooks & Context]
        C[State Management]
    end
    
    subgraph "API Layer"
        D[Express Routes]
        E[Middleware]
        F[Authentication]
    end
    
    subgraph "Service Layer"
        G[ML Slots Service]
        H[Storage Management]
        I[Quantum Insights]
        J[Auto Predictions]
    end
    
    subgraph "Data Layer"
        K[PostgreSQL]
        L[File System]
        M[Cache Layer]
    end
    
    subgraph "External Services"
        N[ML Processing]
        O[Notifications]
        P[Monitoring]
    end
    
    A --> D
    D --> G
    G --> K
    I --> N
    J --> O
```

### Key Design Principles

1. **Microservices Architecture**: Each ML component is independently deployable
2. **Event-Driven**: Asynchronous processing for ML operations
3. **Scalable Storage**: Hierarchical storage management by category
4. **Resource Management**: Slot-based ML usage instead of credit system
5. **Real-time Monitoring**: Comprehensive logging and metrics

## 🔧 System Components

### Backend Services

#### 1. ML Slots Service (`services/ml/MLSlotsService.js`)

- **Purpose**: Manages ML slots allocation per tenant
- **Key Features**:
  - Slot creation, usage tracking, deactivation
  - Plan-based slot limits enforcement
  - Usage statistics and analytics
  - Migration from legacy credit system

```javascript
// Example Usage
const slotsInfo = await MLSlotsService.checkTenantSlots('tenant-id');
const newSlot = await MLSlotsService.createSlot(
  'tenant-id', 
  'dashboard_widget', 
  'Sales Prediction', 
  'dashboard_sales_1'
);
```

#### 2. Storage Management Service (`services/storage/StorageManagementService.js`)

- **Purpose**: Manages storage quotas and usage by category
- **Categories**: uploads, database, cache, logs, emails, calendar, chat
- **Key Features**:
  - Real-time usage calculation
  - Automatic cleanup routines
  - Storage optimization recommendations
  - Plan-based limit enforcement

```javascript
// Example Usage
const storageInfo = await StorageManagementService.checkTenantStorage('tenant-id');
const canUse = await StorageManagementService.canUseStorage('tenant-id', 1024*1024, 'uploads');
```

#### 3. Quantum Insights Service (`services/ml/QuantumInsightsService.js`)

- **Purpose**: Core ML processing engine
- **Capabilities**:
  - Predictive analytics
  - Anomaly detection
  - Data optimization
  - Pattern recognition
  - Recommendation generation

#### 4. Auto Predictions Service (`services/ml/AutoPredictionsService.js`)

- **Purpose**: Scheduled ML predictions
- **Features**:
  - Cron-based scheduling
  - Multiple frequency options
  - Automatic execution
  - Result notifications

### Frontend Components

#### 1. MLSlotsWidget (`client/src/components/ml/MLSlotsWidget.jsx`)

- **Purpose**: Main interface for slot management
- **Variants**: Full, Compact
- **Features**:
  - Slot creation modal
  - Usage visualization
  - Storage monitoring
  - Real-time updates

#### 2. useMLSlots Hook (`client/src/hooks/useMLSlots.js`)

- **Purpose**: State management for ML slots and storage
- **Features**:
  - Automatic data fetching
  - Error handling
  - Optimistic updates
  - Periodic refresh

## 🗄️ Database Schema

### Core Tables

#### ml_slots

```sql
CREATE TABLE ml_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  slot_type VARCHAR(100) NOT NULL,
  slot_name VARCHAR(255) NOT NULL,
  slot_location VARCHAR(500) NOT NULL,
  slot_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### tenant_subscriptions

```sql
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

#### storage_usage_log

```sql
CREATE TABLE storage_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  bytes_used BIGINT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Functions

#### calculate_tenant_storage_usage(tenant_id)

```sql
-- Calculates total storage usage across all categories
SELECT calculate_tenant_storage_usage('tenant-123');
```

#### can_use_storage(tenant_id, bytes, category)

```sql
-- Checks if tenant can use additional storage
SELECT can_use_storage('tenant-123', 1048576, 'uploads');
```

## 🌐 API Reference

### ML Slots Endpoints

#### GET /api/ml-slots

Get tenant's slot information

```bash
curl -H "X-Tenant-ID: tenant-123" \
     -H "Content-Type: application/json" \
     https://nexus.toit.com.br/api/ml-slots
```

#### POST /api/ml-slots

Create new ML slot

```bash
curl -X POST \
     -H "X-Tenant-ID: tenant-123" \
     -H "Content-Type: application/json" \
     -d '{
       "slotType": "dashboard_widget",
       "slotName": "Sales Prediction",
       "slotLocation": "dashboard_sales_1",
       "config": {"autoRefresh": true}
     }' \
     https://api.toit.com.br/api/ml-slots
```

#### POST /api/ml-slots/:location/use

Use an ML slot

```bash
curl -X POST \
     -H "X-Tenant-ID: tenant-123" \
     -H "Content-Type: application/json" \
     -d '{
       "insightType": "prediction",
       "dataPoints": 100
     }' \
     https://nexus.toit.com.br/api/ml-slots/dashboard_sales_1/use
```

### Storage Endpoints

#### GET /api/storage

Get storage usage information

```bash
curl -H "X-Tenant-ID: tenant-123" \
     https://nexus.toit.com.br/api/storage
```

#### POST /api/storage/check

Check storage availability

```bash
curl -X POST \
     -H "X-Tenant-ID: tenant-123" \
     -H "Content-Type: application/json" \
     -d '{
       "bytes": 1048576,
       "category": "uploads"
     }' \
     https://nexus.toit.com.br/api/storage/check
```

### Quantum Insights Endpoints

#### POST /api/quantum/insight

Execute ML insight

```bash
curl -X POST \
     -H "X-Tenant-ID: tenant-123" \
     -H "Content-Type: application/json" \
     -d '{
       "data": [
         {"date": "2024-01-01", "value": 100},
         {"date": "2024-01-02", "value": 110}
       ],
       "insightType": "prediction",
       "options": {"forecastDays": 7}
     }' \
     https://nexus.toit.com.br/api/quantum/insight
```

## ⚙️ Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@railway-host:5432/toit_nexus
TEST_DATABASE_URL=postgresql://user:pass@railway-host:5432/toit_nexus_test

# ML Configuration
ML_PROCESSING_TIMEOUT=30000
ML_MAX_DATA_POINTS=10000
ML_CACHE_TTL=3600

# Storage Configuration
STORAGE_BASE_PATH=/var/lib/toit-nexus/storage
STORAGE_CLEANUP_INTERVAL=86400000

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=300000
```

### Plan Configuration (`config/quantum-config.js`)

```javascript
const QUANTUM_CONFIG = {
  PLANS: {
    STANDARD: {
      mlSlots: 3,
      storage: { total: 1073741824 }, // 1GB
      limits: { workflows: 5, dashboards: 10 }
    },
    QUANTUM_PLUS: {
      mlSlots: 10,
      storage: { total: 10737418240 }, // 10GB
      limits: { workflows: 25, dashboards: 50 }
    },
    QUANTUM_PREMIUM: {
      mlSlots: 25,
      storage: { total: 53687091200 }, // 50GB
      limits: { workflows: 100, dashboards: 200 }
    }
  }
};
```

## 🚀 Deployment

### Prerequisites

1. **Node.js** 18+
2. **PostgreSQL** 13+
3. **Redis** (optional, for caching)
4. **PM2** (for production)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/toit-nexus.git
cd toit-nexus

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Setup database
node scripts/setup-quantum-ml.js

# 4. Build frontend
cd client && npm run build && cd ..

# 5. Start services
npm start
```

### Production Deployment

```bash
# Using PM2
pm2 start ecosystem.config.js

# Using Docker
docker-compose up -d

# Using Kubernetes
kubectl apply -f k8s/
```

### Health Checks

```bash
# System health
node scripts/health-check-ml.js

# API health
curl https://nexus.toit.com.br/api/health

# ML services health
curl https://nexus.toit.com.br/api/quantum-ml/status
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── services/
│   └── utils/
├── integration/          # Integration tests
│   ├── api/
│   └── database/
├── e2e/                 # End-to-end tests
│   └── flows/
└── performance/         # Performance tests
    └── load/
```

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# With coverage
npm run test:coverage
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'routes/**/*.js',
    'client/src/**/*.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 📊 Monitoring

### Metrics Collection

```javascript
// Key metrics tracked
const metrics = {
  // Slots
  'ml.slots.created': 'counter',
  'ml.slots.used': 'counter',
  'ml.slots.utilization': 'gauge',
  
  // Storage
  'storage.usage.bytes': 'gauge',
  'storage.cleanup.freed': 'counter',
  
  // Performance
  'ml.processing.duration': 'histogram',
  'api.response.time': 'histogram'
};
```

### Logging

```javascript
// Structured logging format
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "ml-slots",
  "tenant_id": "tenant-123",
  "action": "slot_created",
  "slot_type": "dashboard_widget",
  "duration_ms": 150
}
```

### Alerts

```yaml
# Alert rules
alerts:
  - name: HighSlotUtilization
    condition: ml.slots.utilization > 0.9
    severity: warning
    
  - name: StorageNearLimit
    condition: storage.usage.percentage > 0.85
    severity: critical
    
  - name: MLProcessingTimeout
    condition: ml.processing.duration > 30000
    severity: error
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Slots Not Creating

```bash
# Check tenant subscription
SELECT * FROM tenant_subscriptions WHERE tenant_id = 'your-tenant';

# Check slot limits
SELECT sp.ml_slots FROM subscription_plans sp
JOIN tenant_subscriptions ts ON sp.id = ts.plan_id
WHERE ts.tenant_id = 'your-tenant';

# Check existing slots
SELECT COUNT(*) FROM ml_slots 
WHERE tenant_id = 'your-tenant' AND is_active = true;
```

#### 2. Storage Issues

```bash
# Check storage usage
SELECT calculate_tenant_storage_usage('your-tenant');

# Check storage limits
SELECT sp.storage_limits FROM subscription_plans sp
JOIN tenant_subscriptions ts ON sp.id = ts.plan_id
WHERE ts.tenant_id = 'your-tenant';

# Manual cleanup
node -e "
const StorageService = require('./services/storage/StorageManagementService');
StorageService.performCleanup('your-tenant').then(console.log);
"
```

#### 3. ML Processing Failures

```bash
# Check service status
curl https://api.toit.com.br/api/quantum-ml/status

# Check logs
tail -f logs/ml-processing.log | grep ERROR

# Restart ML services
pm2 restart ml-services
```

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_ml_slots_tenant_active 
ON ml_slots (tenant_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_storage_log_tenant_date 
ON storage_usage_log (tenant_id, created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM ml_slots WHERE tenant_id = 'tenant-123';
```

#### Caching Strategy

```javascript
// Redis caching for frequently accessed data
const cacheKey = `slots:${tenantId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await fetchFromDatabase();
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5min TTL
```

### Monitoring Commands

```bash
# System resources
htop
iostat -x 1
df -h

# Database performance
psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
psql -c "SELECT * FROM pg_stat_user_tables ORDER BY seq_tup_read DESC;"

# Application metrics
curl https://nexus.toit.com.br/metrics
pm2 monit
```

---

## 📞 Support

For technical support:

- 📧 **Email**: <tech-support@toit.com.br>
- 📱 **Slack**: #quantum-ml-support
- 🌐 **Documentation**: <https://docs.toit.com.br/quantum-ml>
- 🐛 **Issues**: <https://github.com/your-org/toit-nexus/issues>

## 📚 Additional Resources

### Code Examples

#### React Component Integration

```jsx
import { useMLSlots } from '../hooks/useMLSlots';
import { MLSlotsWidget } from '../components/ml/MLSlotsWidget';

function Dashboard() {
  const { slots, createSlot, canCreateSlot } = useMLSlots();

  const handleCreateSlot = async () => {
    if (!canCreateSlot()) {
      alert('Slot limit reached');
      return;
    }

    try {
      await createSlot(
        'dashboard_widget',
        'My Prediction Widget',
        'dashboard_main_prediction'
      );
    } catch (error) {
      console.error('Failed to create slot:', error);
    }
  };

  return (
    <div>
      <MLSlotsWidget variant="full" />
      <button onClick={handleCreateSlot}>
        Create New Slot
      </button>
    </div>
  );
}
```

#### Backend Service Integration

```javascript
const express = require('express');
const MLSlotsService = require('../services/ml/MLSlotsService');
const StorageManagementService = require('../services/storage/StorageManagementService');

const router = express.Router();

router.post('/create-ml-component', async (req, res) => {
  const { tenantId } = req.headers['x-tenant-id'];
  const { componentType, name, location } = req.body;

  try {
    // Check storage availability
    const storageCheck = await StorageManagementService.canUseStorage(
      tenantId,
      1024 * 1024, // 1MB
      'database'
    );

    if (!storageCheck.allowed) {
      return res.status(400).json({
        error: 'Insufficient storage space',
        reason: storageCheck.reason
      });
    }

    // Create ML slot
    const slot = await MLSlotsService.createSlot(
      tenantId,
      componentType,
      name,
      location
    );

    // Record storage usage
    await StorageManagementService.recordStorageUsage(
      tenantId,
      1024 * 1024,
      'database',
      `ML component: ${name}`
    );

    res.json({ success: true, slot });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Migration Guide

#### From Credits to Slots System

```javascript
// Migration script
const migrateTenantToSlots = async (tenantId) => {
  // 1. Get historical credit usage
  const creditHistory = await db.query(`
    SELECT usage_type, COUNT(*) as usage_count
    FROM ml_usage_history
    WHERE tenant_id = $1
    GROUP BY usage_type
  `, [tenantId]);

  // 2. Create equivalent slots
  for (const usage of creditHistory.rows) {
    const slotType = mapUsageTypeToSlotType(usage.usage_type);
    await MLSlotsService.createSlot(
      tenantId,
      slotType,
      `Migrated ${usage.usage_type}`,
      `migrated_${usage.usage_type}_${Date.now()}`,
      { migrated: true, originalUsage: usage.usage_count }
    );
  }

  // 3. Mark migration complete
  await db.query(`
    UPDATE tenant_subscriptions
    SET migration_completed = true
    WHERE tenant_id = $1
  `, [tenantId]);
};
```

### Security Considerations

#### Authentication & Authorization

```javascript
// Middleware for tenant isolation
const tenantIsolation = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }

  // Validate tenant access
  if (!validateTenantAccess(req.user, tenantId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  req.tenantId = tenantId;
  next();
};

// Rate limiting per tenant
const tenantRateLimit = rateLimit({
  keyGenerator: (req) => req.tenantId,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each tenant to 100 requests per windowMs
});
```

#### Data Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateSlotCreation = [
  body('slotType').isIn(['dashboard_widget', 'report_column', 'workflow_step']),
  body('slotName').isLength({ min: 1, max: 255 }).trim(),
  body('slotLocation').matches(/^[a-zA-Z0-9_-]+$/),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

---

**Last Updated**: January 15, 2024
**Version**: 2.0.0
**Maintainer**: TOIT Development Team
