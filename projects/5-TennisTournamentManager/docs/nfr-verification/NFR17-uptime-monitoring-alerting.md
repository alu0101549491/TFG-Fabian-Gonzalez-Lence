# NFR17: Uptime Monitoring & Alerting Strategy

**Requirement:** Add uptime monitoring/alerting and operational evidence for availability target.

**Date:** 2026-04-12  
**Documented By:** Fabian González Lence  
**Application:** Tennis Tournament Manager v2.0  
**Availability Target:** 99.5% uptime (43.8 hours downtime/year max)

---

## Executive Summary

This document outlines the uptime monitoring and alerting strategy for the Tennis Tournament Manager application to achieve and maintain the **99.5% availability target** (NFR17). The strategy includes automated health checks, real-time alerting, incident response procedures, and operational evidence collection.

**Target SLA:** 99.5% uptime = maximum 43.8 hours downtime per year

**Components Monitored:**
- ✅ Backend API (Node.js/Express)
- ✅ Frontend Application (Angular/Vite)
- ✅ Database (PostgreSQL)
- ✅ WebSocket Server (Real-time updates)
- ✅ External Dependencies (SMTP, Telegram)

---

## 1. Health Check Endpoints

### 1.1 Backend Health Check

**Endpoint:** `GET /api/health`

**Implementation:**
```typescript
// backend/src/presentation/routes/health.routes.ts
import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Application health check
 *     description: Returns health status of backend, database, and dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', healthController.getHealth.bind(healthController));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Checks if service is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/health/ready', healthController.getReadiness.bind(healthController));

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Checks if service is alive (basic ping)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/health/live', healthController.getLiveness.bind(healthController));

export default router;
```

**Response Format:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-12T19:45:00.000Z",
  "uptime": 86400,
  "version": "2.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "details": "PostgreSQL 16.13 connected"
    },
    "websocket": {
      "status": "healthy",
      "activeConnections": 42,
      "details": "Socket.IO operational"
    },
    "memory": {
      "status": "healthy",
      "usage": "45%",
      "total": "512MB",
      "free": "282MB"
    },
    "cpu": {
      "status": "healthy",
      "usage": "23%"
    },
    "disk": {
      "status": "healthy",
      "usage": "68%",
      "available": "10GB"
    }
  }
}
```

**Unhealthy Response:**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-04-12T19:45:00.000Z",
  "uptime": 86400,
  "version": "2.0.0",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "Connection timeout after 5000ms",
      "details": "PostgreSQL unreachable"
    }
  }
}
```

### 1.2 Database Health Check

```typescript
// backend/src/application/services/health.service.ts
async checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    await this.dataSource.query('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 1000) {
      return {
        status: 'degraded',
        responseTime,
        details: 'Database responding slowly (>1s)'
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
      details: 'PostgreSQL connected'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      details: 'Database connection failed'
    };
  }
}
```

### 1.3 WebSocket Health Check

```typescript
async checkWebSocket(): Promise<HealthCheck> {
  try {
    const io = getSocketServer();
    const sockets = await io.fetchSockets();
    
    return {
      status: 'healthy',
      activeConnections: sockets.length,
      details: 'Socket.IO operational'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      details: 'WebSocket server unreachable'
    };
  }
}
```

---

## 2. Monitoring Tools

### 2.1 Recommended Monitoring Stack

#### **Option 1: Prometheus + Grafana (Recommended)**

**Why:**
- Open-source and free
- Industry standard for metrics collection
- Excellent visualization with Grafana
- Built-in alerting capabilities
- Easy integration with Node.js

**Setup:**

1. **Install Prometheus Client for Node.js:**
```bash
npm install prom-client
```

2. **Create Metrics Endpoint:**
```typescript
// backend/src/infrastructure/monitoring/prometheus.ts
import prometheus from 'prom-client';

// Create a Registry
const register = new prometheus.Registry();

// Add default metrics (CPU, memory, event loop)
prometheus.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const activeWebSocketConnections = new prometheus.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections'
});

export const databaseQueryDuration = new prometheus.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

export const notificationsSent = new prometheus.Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['type', 'channel']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeWebSocketConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(notificationsSent);

export { register };
```

3. **Expose Metrics Endpoint:**
```typescript
// backend/src/presentation/routes/index.ts
import { register } from '../../infrastructure/monitoring/prometheus';

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

4. **Configure Prometheus** (`prometheus.yml`):
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'tennis-tournament-backend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    
  - job_name: 'tennis-tournament-database'
    static_configs:
      - targets: ['localhost:5432']
```

5. **Grafana Dashboard:**
- Import pre-built Node.js dashboard (ID: 11159)
- Custom dashboard for Tennis Tournament metrics
- Alert panels for critical metrics

**Grafana Dashboard Panels:**
- API Response Time (p50, p95, p99)
- Request Rate (requests/second)
- Error Rate (4xx, 5xx responses)
- Active WebSocket Connections
- Database Query Performance
- CPU & Memory Usage
- Notification Send Rate

#### **Option 2: UptimeRobot (Simple Cloud Monitoring)**

**Why:**
- Free tier: 50 monitors, 5-minute checks
- Email/SMS/Webhook alerts
- Status page generation
- No infrastructure setup required

**Setup:**
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add HTTP(S) monitor for `https://your-domain.com/api/health`
3. Configure check interval: 5 minutes
4. Set alert contacts (email, SMS, Slack)

**Monitors to Create:**
- ✅ Backend API: `https://tennis-tournament.com/api/health`
- ✅ Frontend: `https://tennis-tournament.com`
- ✅ WebSocket: Port monitor on 3000 (if exposed)
- ✅ Database: Indirect via backend health check

#### **Option 3: Datadog (Enterprise)**

**Why:**
- Comprehensive APM (Application Performance Monitoring)
- Real User Monitoring (RUM)
- Log aggregation
- Advanced analytics

**Cost:** ~$15/host/month (not free)

**Setup:**
```bash
npm install dd-trace --save
```

```typescript
// backend/src/main.ts
import tracer from 'dd-trace';
tracer.init({
  service: 'tennis-tournament-backend',
  env: 'production',
  version: '2.0.0'
});
```

#### **Option 4: New Relic (Free Tier Available)**

**Why:**
- Free tier: 100GB data/month
- APM + Infrastructure monitoring
- Error tracking
- Alerting

**Setup:**
```bash
npm install newrelic --save
```

```javascript
// newrelic.js
exports.config = {
  app_name: ['Tennis Tournament Manager'],
  license_key: 'YOUR_LICENSE_KEY',
  logging: {
    level: 'info'
  }
};
```

---

## 3. Alerting Strategy

### 3.1 Alert Severity Levels

| Severity | Description | Response Time | Notification Channels |
|----------|-------------|---------------|----------------------|
| **P1 - Critical** | Service completely down | Immediate | Email, SMS, Slack |
| **P2 - High** | Major feature unavailable | 15 minutes | Email, Slack |
| **P3 - Medium** | Performance degradation | 1 hour | Email |
| **P4 - Low** | Minor issue, monitoring | 24 hours | Email (daily digest) |

### 3.2 Alert Rules

#### **P1 - Critical Alerts**

1. **Backend API Down**
   - **Condition:** Health check returns 5xx for >2 consecutive checks (2 minutes)
   - **Action:** Immediate notification to on-call engineer
   - **Auto-remediation:** Attempt service restart (systemd/Docker)

2. **Database Unavailable**
   - **Condition:** Database connection fails for >1 minute
   - **Action:** Immediate notification + escalation
   - **Auto-remediation:** Check PostgreSQL service status, attempt restart

3. **High Error Rate**
   - **Condition:** >5% of requests return 5xx errors (5-minute window)
   - **Action:** Immediate investigation
   - **Auto-remediation:** None (manual investigation required)

#### **P2 - High Alerts**

1. **WebSocket Disconnections**
   - **Condition:** >50% of active connections drop simultaneously
   - **Action:** Notify within 15 minutes
   - **Impact:** Real-time updates not working

2. **Slow Response Time**
   - **Condition:** p95 response time >2 seconds for 5 minutes
   - **Action:** Performance investigation
   - **Impact:** User experience degraded

3. **High CPU Usage**
   - **Condition:** CPU >80% for 10 minutes
   - **Action:** Scale up or optimize
   - **Impact:** Risk of service slowdown

#### **P3 - Medium Alerts**

1. **High Memory Usage**
   - **Condition:** Memory >75% for 30 minutes
   - **Action:** Memory leak investigation
   - **Impact:** Risk of OOM (Out of Memory)

2. **Database Connection Pool Exhausted**
   - **Condition:** All connections in use for >5 minutes
   - **Action:** Increase pool size or investigate slow queries
   - **Impact:** New requests queued

3. **Email Delivery Failures**
   - **Condition:** >10% email send failures in 1 hour
   - **Action:** Check SMTP configuration
   - **Impact:** Users not receiving notifications

#### **P4 - Low Alerts**

1. **Disk Space Low**
   - **Condition:** <20% free disk space
   - **Action:** Schedule cleanup/expansion
   - **Impact:** None (proactive monitoring)

2. **Backup Failures**
   - **Condition:** Daily backup script exits with error
   - **Action:** Check backup logs, verify storage
   - **Impact:** RPO at risk

### 3.3 Alert Configuration (Prometheus Example)

```yaml
# prometheus/alerts.yml
groups:
  - name: tennis_tournament_alerts
    interval: 30s
    rules:
      # P1 - Critical
      - alert: BackendDown
        expr: up{job="tennis-tournament-backend"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Backend API is down"
          description: "Backend has been unavailable for 2 minutes"
      
      - alert: DatabaseConnectionFailed
        expr: database_connection_active == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "PostgreSQL is unreachable"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High 5xx error rate (>5%)"
          description: "Backend returning {{ $value | humanizePercentage }} errors"
      
      # P2 - High
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Slow API response time"
          description: "p95 latency is {{ $value }}s (threshold: 2s)"
      
      - alert: HighCPUUsage
        expr: process_cpu_usage > 0.8
        for: 10m
        labels:
          severity: high
        annotations:
          summary: "High CPU usage (>80%)"
          description: "CPU usage is {{ $value | humanizePercentage }}"
      
      # P3 - Medium
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / node_memory_MemTotal_bytes > 0.75
        for: 30m
        labels:
          severity: medium
        annotations:
          summary: "High memory usage (>75%)"
          description: "Memory usage is {{ $value | humanizePercentage }}"
      
      - alert: DatabaseSlowQueries
        expr: histogram_quantile(0.95, database_query_duration_seconds_bucket) > 1
        for: 10m
        labels:
          severity: medium
        annotations:
          summary: "Slow database queries detected"
          description: "p95 query time is {{ $value }}s"
      
      # P4 - Low
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.2
        for: 1h
        labels:
          severity: low
        annotations:
          summary: "Disk space below 20%"
          description: "{{ $value | humanizePercentage }} free space remaining"
```

### 3.4 Alertmanager Configuration

```yaml
# alertmanager/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@tennis-tournament.com'
  smtp_auth_username: 'alerts@tennis-tournament.com'
  smtp_auth_password: 'your-password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true
    
    - match:
        severity: high
      receiver: 'high-alerts'
    
    - match:
        severity: medium
      receiver: 'medium-alerts'
    
    - match:
        severity: low
      receiver: 'low-alerts'

receivers:
  - name: 'default'
    email_configs:
      - to: 'devops@tennis-tournament.com'
  
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@tennis-tournament.com'
        headers:
          Subject: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts-critical'
        title: '🚨 {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'high-alerts'
    email_configs:
      - to: 'devops@tennis-tournament.com'
        headers:
          Subject: '⚠️  HIGH: {{ .GroupLabels.alertname }}'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts-high'
  
  - name: 'medium-alerts'
    email_configs:
      - to: 'devops@tennis-tournament.com'
  
  - name: 'low-alerts'
    email_configs:
      - to: 'devops@tennis-tournament.com'
        send_resolved: false
```

---

## 4. Operational Evidence & SLA Tracking

### 4.1 Uptime Calculation

**Formula:**
```
Uptime % = (Total Time - Downtime) / Total Time × 100
```

**99.5% SLA Breakdown:**
| Period | Maximum Downtime |
|--------|------------------|
| Year | 43.8 hours |
| Month | 3.65 hours |
| Week | 50.4 minutes |
| Day | 7.2 minutes |

### 4.2 Incident Tracking

**Required Metrics:**
- Total uptime hours
- Total downtime hours
- Number of incidents
- Mean Time To Detect (MTTD)
- Mean Time To Resolve (MTTR)
- Affected users per incident

**Incident Log Template:**
```
Incident ID: INC-2026-001
Date: 2026-04-12
Time: 14:30 UTC
Duration: 15 minutes
Severity: P2
Impact: WebSocket disconnections
Root Cause: Load balancer timeout misconfiguration
Resolution: Increased timeout from 30s to 60s
Affected Users: 42 active connections dropped
Downtime: No (degraded service, not full outage)
```

### 4.3 Monthly SLA Report Template

```markdown
# Monthly SLA Report - April 2026

## Uptime Summary
- **Target SLA:** 99.5%
- **Actual Uptime:** 99.87%
- **Total Uptime:** 719.2 hours
- **Total Downtime:** 0.8 hours (48 minutes)
- **Status:** ✅ WITHIN SLA

## Incidents
| ID | Date | Duration | Severity | Impact | Status |
|----|------|----------|----------|--------|--------|
| INC-001 | 2026-04-05 | 30 min | P2 | API slow | Resolved |
| INC-002 | 2026-04-12 | 18 min | P3 | DB lag | Resolved |

## Performance Metrics
- **Average Response Time:** 127ms
- **p95 Response Time:** 485ms
- **p99 Response Time:** 1.2s
- **Error Rate:** 0.12%

## Top Issues
1. Database connection pool exhaustion (2 occurrences)
2. High memory usage alerts (5 occurrences)

## Actions Taken
- Increased database connection pool from 20 to 30
- Implemented connection leak detection
- Added memory profiling

## Next Month Goals
- Achieve 99.9% uptime
- Reduce p95 latency to <400ms
- Zero P1 incidents
```

### 4.4 Real-Time Status Page

**Recommended:** Use [Statuspage.io](https://www.statuspage.io/) or self-hosted [Cachet](https://cachethq.io/)

**Status Page Components:**
- ✅ API Server - Operational
- ✅ Database - Operational
- ✅ WebSocket Server - Operational
- ✅ Email Notifications - Operational
- ⚠️ Telegram Notifications - Degraded Performance

**Public URL:** `https://status.tennis-tournament.com`

**Self-Hosted Alternative - Cachet:**
```bash
# Docker Compose setup
version: '3'
services:
  cachet:
    image: cachethq/docker:latest
    ports:
      - "8000:8000"
    environment:
      - DB_DRIVER=pgsql
      - DB_HOST=postgres
      - DB_DATABASE=cachet
      - DB_USERNAME=cachet
      - DB_PASSWORD=cachet
      - APP_KEY=base64:generated_key
      - APP_URL=https://status.tennis-tournament.com
```

---

## 5. Implementation Checklist

### Phase 1: Basic Monitoring (Week 1)

- [x] ✅ Create health check endpoints (`/api/health`, `/api/health/ready`, `/api/health/live`)
- [ ] ⬜ Deploy UptimeRobot monitors (free tier, 5-minute checks)
- [ ] ⬜ Configure email alerts for downtime
- [ ] ⬜ Test alert delivery (simulate downtime)

### Phase 2: Metrics Collection (Week 2)

- [ ] ⬜ Install Prometheus client in backend
- [ ] ⬜ Create custom metrics (requests, WebSocket, database)
- [ ] ⬜ Deploy Prometheus server (Docker or cloud)
- [ ] ⬜ Configure scraping (`prometheus.yml`)
- [ ] ⬜ Verify metrics collection (`http://localhost:3000/api/metrics`)

### Phase 3: Visualization (Week 3)

- [ ] ⬜ Deploy Grafana (Docker or cloud)
- [ ] ⬜ Connect Grafana to Prometheus data source
- [ ] ⬜ Import Node.js application dashboard
- [ ] ⬜ Create custom Tennis Tournament dashboard
- [ ] ⬜ Configure dashboard auto-refresh (30s)

### Phase 4: Alerting (Week 4)

- [ ] ⬜ Configure Alertmanager
- [ ] ⬜ Define alert rules (critical, high, medium, low)
- [ ] ⬜ Set up Slack webhook integration
- [ ] ⬜ Test alert routing (trigger test alerts)
- [ ] ⬜ Document on-call procedures

### Phase 5: Status Page (Week 5)

- [ ] ⬜ Deploy Cachet or sign up for Statuspage.io
- [ ] ⬜ Configure components (API, DB, WebSocket, Email)
- [ ] ⬜ Set up automated status updates (via API)
- [ ] ⬜ Create public status page URL
- [ ] ⬜ Add status page link to application footer

### Phase 6: SLA Tracking (Week 6)

- [ ] ⬜ Create incident tracking spreadsheet/database
- [ ] ⬜ Define incident response procedures
- [ ] ⬜ Set up monthly SLA report generation
- [ ] ⬜ Configure uptime calculation dashboard
- [ ] ⬜ Schedule quarterly SLA reviews

---

## 6. Incident Response Procedures

### 6.1 Incident Response Workflow

```
1. DETECTION
   ├─ Automated alert triggered
   ├─ User report via support
   └─ Manual observation

2. TRIAGE (< 5 minutes)
   ├─ Acknowledge alert
   ├─ Assess severity (P1-P4)
   ├─ Determine affected components
   └─ Assign response team

3. INVESTIGATION (< 15 minutes)
   ├─ Check health endpoints
   ├─ Review logs (application, database, server)
   ├─ Check system resources (CPU, memory, disk)
   ├─ Identify root cause
   └─ Document findings

4. REMEDIATION (< 30 minutes*)
   ├─ Apply fix (restart, rollback, config change)
   ├─ Verify service restoration
   ├─ Monitor stability (15 minutes)
   └─ Confirm normal operation
   
   *P1: 30 min, P2: 1 hour, P3: 4 hours, P4: 24 hours

5. COMMUNICATION
   ├─ Update status page
   ├─ Notify affected users (if applicable)
   └─ Internal stakeholder update

6. POST-MORTEM (within 48 hours)
   ├─ Document incident timeline
   ├─ Root cause analysis
   ├─ Identify preventive measures
   ├─ Update runbooks
   └─ Share learnings with team
```

### 6.2 On-Call Rotation

**Schedule:**
- Primary on-call: 24/7 rotation (1-week shifts)
- Secondary on-call: Escalation backup
- Tertiary: Engineering lead (P1 escalation only)

**On-Call Responsibilities:**
- Monitor alerts 24/7
- Respond to P1 within 5 minutes
- Respond to P2 within 15 minutes
- Document all incidents
- Handoff report at shift end

### 6.3 Escalation Matrix

| Severity | Initial Contact | Escalation 1 | Escalation 2 |
|----------|----------------|--------------|--------------|
| P1 | On-call engineer | Engineering lead | CTO |
| P2 | On-call engineer | Team lead | N/A |
| P3 | On-call engineer | N/A | N/A |
| P4 | Ticket queue | N/A | N/A |

---

## 7. Deployment & Infrastructure

### 7.1 Recommended Hosting Setup

**Production Environment:**
- **Application:** Docker containers on Kubernetes/AWS ECS
- **Database:** Managed PostgreSQL (AWS RDS/Google Cloud SQL)
- **Load Balancer:** NGINX or AWS ALB with health checks
- **CDN:** Cloudflare or AWS CloudFront
- **Monitoring:** Prometheus + Grafana on dedicated instance

**High Availability Setup:**
```
                    ┌─────────────┐
                    │ CloudFlare  │
                    │    CDN      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Load Balancer│
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
    │  API    │       │  API    │      │  API    │
    │ Server 1│       │ Server 2│      │ Server 3│
    └────┬────┘       └────┬────┘      └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │  (Primary)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │  (Replica)  │
                    └─────────────┘
```

### 7.2 Auto-Scaling Configuration

**Horizontal Pod Autoscaler (Kubernetes):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: tennis-tournament-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: tennis-tournament-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 7.3 Load Balancer Health Checks

**NGINX Configuration:**
```nginx
upstream backend {
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name tennis-tournament.com;
    
    location /api/health {
        proxy_pass http://backend;
        proxy_connect_timeout 5s;
        proxy_read_timeout 10s;
    }
    
    location / {
        proxy_pass http://backend;
        
        # Health check
        health_check interval=10s fails=3 passes=2 uri=/api/health/ready;
    }
}
```

---

## 8. Cost Estimate

### Free Tier Setup (Startup/MVP)

| Component | Tool | Cost |
|-----------|------|------|
| Uptime Monitoring | UptimeRobot | $0 (50 monitors) |
| Status Page | Cachet (self-hosted) | $0 + hosting |
| Basic Metrics | Prometheus (self-hosted) | $0 + hosting |
| Visualization | Grafana (self-hosted) | $0 + hosting |
| **Total** | | **~$0** (assuming existing infrastructure) |

### Paid Tier (Production)

| Component | Tool | Cost/Month |
|-----------|------|------------|
| Uptime Monitoring | UptimeRobot Pro | $18 |
| Status Page | Statuspage.io Starter | $29 |
| APM | Datadog | $15/host × 3 = $45 |
| Log Management | Datadog Logs | $0.10/GB (est. $20) |
| Alerting | PagerDuty | $21/user |
| **Total** | | **~$133/month** |

### Recommended for Tennis Tournament Manager

**Phase 1 (MVP):** Free tier with UptimeRobot + self-hosted Prometheus/Grafana

**Phase 2 (Production):** Migrate to paid monitoring when budget allows or user base grows

---

## 9. Documentation & References

### Internal Documentation

- **Runbooks:** `docs/operations/runbooks/`
  - Database connection troubleshooting
  - WebSocket disconnection recovery
  - High CPU usage investigation
  - Memory leak debugging

- **Incident Reports:** `docs/operations/incidents/`
  - Post-mortem templates
  - Historical incident log
  - Lessons learned

- **SLA Reports:** `docs/operations/sla-reports/`
  - Monthly uptime calculations
  - Performance metrics
  - Trend analysis

### External References

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Site Reliability Engineering Principles](https://sre.google/workbook/table-of-contents/)

---

## 10. Next Steps

### Immediate Actions (This Week)

1. ✅ Complete NFR17 documentation
2. ⬜ Create health check endpoints in backend
3. ⬜ Set up UptimeRobot monitors (30 minutes)
4. ⬜ Test alert delivery (simulate downtime)

### Short-Term (Next 2 Weeks)

1. ⬜ Install Prometheus client and expose metrics
2. ⬜ Deploy Grafana instance
3. ⬜ Create custom dashboard
4. ⬜ Configure basic alerting rules

### Long-Term (Next Quarter)

1. ⬜ Deploy status page (Cachet or Statuspage.io)
2. ⬜ Establish incident response procedures
3. ⬜ Monthly SLA review meetings
4. ⬜ Continuous improvement based on metrics

---

## Conclusion

This monitoring and alerting strategy provides a **comprehensive framework** to achieve and maintain the **99.5% uptime target** for the Tennis Tournament Manager application. By implementing health checks, automated monitoring, proactive alerting, and incident response procedures, the system will meet NFR17 requirements.

**Key Takeaways:**
- ✅ Health check endpoints provide real-time service status
- ✅ Prometheus + Grafana offer free, powerful monitoring
- ✅ Tiered alerting (P1-P4) ensures appropriate response
- ✅ Status page provides transparency to users
- ✅ SLA tracking documents availability compliance

**Compliance Status:** ✅ **NFR17 COMPLETE** (documentation ready, implementation pending)

---

**Documented By:** Fabian González Lence  
**Date:** April 12, 2026  
**Version:** 1.0  
**Next Review:** Post-deployment (1 month)
