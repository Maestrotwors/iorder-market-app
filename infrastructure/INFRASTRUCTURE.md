# iOrder Market — Infrastructure Guide

## Architecture Overview

```
                         ┌─────────────────────────────────────────────────────┐
                         │                   Kubernetes Cluster                │
                         │                                                     │
   Internet ───▶ [ Ingress (nginx) ]                                          │
                         │                                                     │
                         ▼                                                     │
                ┌─────────────────┐                                           │
                │   API Gateway   │  ◄── 1 replica (single entry point)       │
                │   (port 3000)   │                                           │
                └────┬───────┬────┘                                           │
                     │       │                                                │
          ┌──────────┘       └──────────┐                                     │
          ▼                             ▼                                     │
  ┌───────────────┐           ┌─────────────────┐                            │
  │   Products    │           │      Auth        │                            │
  │   Service     │           │    Service       │                            │
  │  (port 3001)  │           │   (port 3002)    │                            │
  │  x3 replicas  │           │   x3 replicas    │                            │
  └───────┬───────┘           └────────┬─────────┘                            │
          │                            │                                      │
          └──────────┬─────────────────┘                                      │
                     ▼                                                        │
            ┌─────────────────┐    ┌──────────────────┐                      │
            │   PostgreSQL    │    │     RedPanda      │                      │
            │  (port 5432)    │    │  (Kafka-compat)   │                      │
            │  PVC: 10-20Gi   │    │  port 19092       │                      │
            └─────────────────┘    └──────────────────┘                      │
                         └─────────────────────────────────────────────────────┘
```

## Directory Structure

```
infrastructure/
├── docker/
│   ├── Dockerfile.microservice    # Multi-stage build for all services
│   ├── Dockerfile.debug           # Debug image for troubleshooting
│   └── docker-compose.yml         # Local dev (Postgres + RedPanda)
├── helm/
│   └── iorder/
│       ├── Chart.yaml
│       ├── values.yaml            # Default (production) values
│       ├── values-dev.yaml        # Minikube / local K8s
│       ├── values-staging.yaml    # Staging environment
│       ├── values-prod.yaml       # Production overrides
│       └── templates/
│           ├── _helpers.tpl
│           ├── configmap.yaml
│           ├── secrets.yaml
│           ├── ingress.yaml
│           ├── network-policies.yaml
│           ├── pdb.yaml
│           ├── db-migrate-job.yaml
│           ├── api-gateway/
│           │   ├── deployment.yaml
│           │   ├── service.yaml
│           │   └── hpa.yaml
│           ├── products-service/
│           │   ├── deployment.yaml
│           │   ├── service.yaml
│           │   └── hpa.yaml
│           ├── auth-service/
│           │   ├── deployment.yaml
│           │   ├── service.yaml
│           │   └── hpa.yaml
│           ├── postgresql/
│           │   ├── deployment.yaml
│           │   ├── service.yaml
│           │   └── pvc.yaml
│           └── redpanda/
│               ├── deployment.yaml
│               └── service.yaml
├── ci-cd/
│   └── .github/workflows/ci.yml
└── redpanda/
    └── create-topics.sh
```

## Replicas & Load Balancing

| Service            | Dev | Staging | Prod  | HPA         |
|--------------------|-----|---------|-------|-------------|
| API Gateway        | 1   | 1       | 1     | Prod: 1-3   |
| Products Service   | 3   | 2       | 3     | Yes: 3-10   |
| Auth Service       | 3   | 2       | 3     | Yes: 3-10   |
| PostgreSQL         | 1   | 1       | 1     | No          |
| RedPanda           | 1   | 1       | 1     | No          |

**Load balancing:** Kubernetes Service (ClusterIP) uses round-robin by default.
API Gateway sends requests to `iorder-products-service:3001` — K8s distributes them
across all 3 pods evenly.

## Health Checks

Every microservice exposes `GET /health` returning:
```json
{ "status": "ok", "service": "<name>", "timestamp": "..." }
```

Kubernetes probes configured on all microservice deployments:

| Probe          | Path      | Period | Failure Threshold | Action            |
|----------------|-----------|--------|-------------------|-------------------|
| startupProbe   | `/health` | 5s     | 30                | Wait for startup  |
| readinessProbe | `/health` | 10s    | 3                 | Remove from Service endpoints |
| livenessProbe  | `/health` | 20s    | **3**             | **Restart pod**   |

**3 failed liveness checks = pod restart.** With 20s period, a pod is restarted
after ~60s of unresponsiveness.

## Network Isolation (NetworkPolicy)

All microservices are **closed from external access**. Only API Gateway accepts
external traffic via Ingress.

```
Internet ──▶ Ingress ──▶ API Gateway ──▶ Products Service ──▶ PostgreSQL
                                     ──▶ Auth Service     ──▶ PostgreSQL
                                                          ──▶ RedPanda
```

| Target           | Allowed Ingress From                     |
|------------------|------------------------------------------|
| API Gateway      | Any (entry point)                        |
| Products Service | API Gateway only                         |
| Auth Service     | API Gateway only                         |
| PostgreSQL       | Products Service, Auth Service only       |
| RedPanda         | API Gateway, Products, Auth only          |

Toggle: `networkPolicies.enabled: true/false` in values.

## Database

### Persistent Volume
PostgreSQL uses a PersistentVolumeClaim (`ReadWriteOnce`):
- Dev: 1Gi (`standard` storageClass)
- Staging: 5Gi
- Prod: 20Gi

Data survives pod restarts and redeployments. PGDATA: `/var/lib/postgresql/data/pgdata`.

### Migrations & Seed (Helm Hook)

`db-migrate-job.yaml` runs as a **pre-install/pre-upgrade** Helm hook:

1. `bunx prisma migrate deploy` — applies all pending migrations
2. `bun database/scripts/seed.ts` — seeds default data (idempotent via upsert)

Job is deleted after successful completion (`hook-delete-policy: hook-succeeded`).

### Default Users (created by seed)

| Email                    | Role     | Password     |
|--------------------------|----------|--------------|
| admin@iorder.market      | admin    | password123  |
| supplier@iorder.market   | supplier | password123  |
| customer@iorder.market   | customer | password123  |

Passwords are hashed with bcrypt. **Change in production!**

### Default Products (created by seed)

| Name                | Price    | Stock |
|---------------------|----------|-------|
| Wireless Headphones | $149.99  | 50    |
| USB-C Cable         | $12.99   | 200   |

## Docker

### Building Images

All microservices share one Dockerfile (`Dockerfile.microservice`), differentiated by `SERVICE` build arg:

```bash
# Build from monorepo root
docker build \
  -f infrastructure/docker/Dockerfile.microservice \
  --build-arg SERVICE=api-gateway \
  -t iorder/api-gateway:latest .

docker build \
  -f infrastructure/docker/Dockerfile.microservice \
  --build-arg SERVICE=products-service \
  -t iorder/products-service:latest .

docker build \
  -f infrastructure/docker/Dockerfile.microservice \
  --build-arg SERVICE=auth-service \
  -t iorder/auth-service:latest .
```

### Image Structure (multi-stage)

1. **Build stage:** Installs dependencies, generates Prisma client
2. **Release stage:** Copies only what's needed, runs as non-root `bun` user
3. **Built-in HEALTHCHECK** in Docker image (wget to `/health`)

## Helm Commands

### Local Development (Minikube)

```bash
# Start Minikube
minikube start

# Build images inside Minikube
eval $(minikube docker-env)
docker build -f infrastructure/docker/Dockerfile.microservice --build-arg SERVICE=api-gateway -t iorder/api-gateway:latest .
docker build -f infrastructure/docker/Dockerfile.microservice --build-arg SERVICE=products-service -t iorder/products-service:latest .
docker build -f infrastructure/docker/Dockerfile.microservice --build-arg SERVICE=auth-service -t iorder/auth-service:latest .

# Deploy
helm install iorder infrastructure/helm/iorder/ -f infrastructure/helm/iorder/values-dev.yaml

# Verify pods
kubectl get pods -w

# Access API Gateway
minikube service iorder-api-gateway --url
```

### Staging

```bash
helm upgrade --install iorder infrastructure/helm/iorder/ \
  -f infrastructure/helm/iorder/values-staging.yaml \
  --set secrets.jwtSecret="<real-secret>" \
  --set secrets.databasePassword="<real-password>"
```

### Production

```bash
helm upgrade --install iorder infrastructure/helm/iorder/ \
  -f infrastructure/helm/iorder/values-prod.yaml \
  --set secrets.jwtSecret="<real-secret>" \
  --set secrets.databasePassword="<real-password>" \
  --set ingress.host="api.iorder.market"
```

### Useful Commands

```bash
# Check deployment status
kubectl get deployments
kubectl get pods -o wide

# Verify load balancing (run multiple times, observe different pod IPs)
kubectl run curl --image=curlimages/curl --rm -it -- \
  curl http://iorder-products-service:3001/health

# View logs from specific service
kubectl logs -l app.kubernetes.io/name=products-service --tail=50 -f

# Scale manually
kubectl scale deployment iorder-products-service --replicas=5

# Check network policies
kubectl get networkpolicies
kubectl describe networkpolicy iorder-products-service

# Check PVC
kubectl get pvc

# Re-run DB migration
kubectl delete job iorder-db-migrate 2>/dev/null
helm upgrade iorder infrastructure/helm/iorder/ -f infrastructure/helm/iorder/values-dev.yaml
```

## Environment Variables

All services receive config via ConfigMap + Secret:

| Variable               | Description                          | Default                   |
|------------------------|--------------------------------------|---------------------------|
| API_GATEWAY_PORT       | API Gateway listen port              | 3000                      |
| API_GATEWAY_HOST       | API Gateway bind address             | 0.0.0.0                   |
| PRODUCTS_SERVICE_PORT  | Products Service port                | 3001                      |
| PRODUCTS_SERVICE_HOST  | Products Service K8s DNS name        | iorder-products-service   |
| AUTH_SERVICE_PORT      | Auth Service port                    | 3002                      |
| AUTH_SERVICE_HOST      | Auth Service K8s DNS name            | iorder-auth-service       |
| DATABASE_URL           | PostgreSQL connection string         | (constructed from values)  |
| REDPANDA_BROKERS       | Kafka broker addresses               | iorder-redpanda:19092     |
| JWT_SECRET             | JWT signing secret (from Secret)     | change-me-in-production   |
| JWT_EXPIRATION         | Token TTL in seconds                 | 3600                      |
| NODE_ENV               | Environment name                     | production                |

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`):

1. **Lint** — `bunx nx run-many --target=lint --all`
2. **Test** — runs with PostgreSQL service container
3. **Build** — `bunx nx run-many --target=build --all`

Triggers: push to `main`/`develop`, PR to `main`.

## Troubleshooting

### Pod keeps restarting
```bash
kubectl describe pod <pod-name>    # Check events
kubectl logs <pod-name> --previous # Logs from crashed container
```

### DB migration job fails
```bash
kubectl logs job/iorder-db-migrate
kubectl delete job iorder-db-migrate  # Then re-deploy
```

### NetworkPolicy blocks traffic
```bash
kubectl describe networkpolicy <name>
# Temporarily disable for debugging:
helm upgrade iorder ... --set networkPolicies.enabled=false
```

### PostgreSQL data lost
Check PVC is bound: `kubectl get pvc iorder-postgresql`.
If status is `Pending`, check `storageClass` matches your cluster.
