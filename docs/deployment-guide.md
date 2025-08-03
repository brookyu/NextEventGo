# Deployment Guide

This guide provides comprehensive instructions for deploying the NextEvent Go API v2.0 in various environments.

## 🎯 Deployment Overview

The NextEvent Go API v2.0 supports multiple deployment strategies:

- **Development**: Docker Compose for local development
- **Staging**: Kubernetes cluster with staging configurations
- **Production**: Kubernetes cluster with production-grade configurations
- **Cloud Providers**: AWS, GCP, Azure with managed services

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 20GB+ disk space

### Local Development Setup

1. **Clone and prepare the repository**
   ```bash
   git clone https://github.com/zenteam/nextevent-go.git
   cd nextevent-go
   ```

2. **Configure environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit configuration
   vim .env
   ```

3. **Start the development environment**
   ```bash
   cd deployments/docker
   docker-compose up -d
   ```

4. **Verify deployment**
   ```bash
   # Check service health
   curl http://localhost:8080/health
   
   # Check API documentation
   open http://localhost:8080/swagger/
   ```

### Production Docker Setup

1. **Build production image**
   ```bash
   # Build optimized production image
   docker build -f deployments/docker/Dockerfile -t nextevent-api:2.0.0 .
   
   # Tag for registry
   docker tag nextevent-api:2.0.0 your-registry.com/nextevent-api:2.0.0
   
   # Push to registry
   docker push your-registry.com/nextevent-api:2.0.0
   ```

2. **Production Docker Compose**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   
   services:
     nextevent-api:
       image: your-registry.com/nextevent-api:2.0.0
       ports:
         - "8080:8080"
       environment:
         - ENV=production
         - DB_HOST=your-postgres-host
         - DB_PASSWORD=${DB_PASSWORD}
         - REDIS_HOST=your-redis-host
       deploy:
         replicas: 3
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
           reservations:
             memory: 256M
             cpus: '0.25'
       healthcheck:
         test: ["CMD", "wget", "--spider", "http://localhost:8080/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes 1.24+
- kubectl configured
- Helm 3.0+ (optional)
- Ingress controller (nginx, traefik, etc.)
- Cert-manager for SSL certificates

### Staging Deployment

1. **Prepare namespace and secrets**
   ```bash
   # Create namespace
   kubectl apply -f deployments/k8s/namespace.yaml
   
   # Create secrets (update values first)
   kubectl apply -f deployments/k8s/configmap.yaml
   ```

2. **Deploy database and cache**
   ```bash
   # Deploy PostgreSQL
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm install postgres bitnami/postgresql \
     --namespace nextevent \
     --set auth.postgresPassword=your-password \
     --set auth.database=nextevent \
     --set primary.persistence.size=50Gi
   
   # Deploy Redis
   helm install redis bitnami/redis \
     --namespace nextevent \
     --set auth.enabled=false \
     --set master.persistence.size=10Gi
   ```

3. **Deploy the application**
   ```bash
   # Apply all manifests
   kubectl apply -f deployments/k8s/deployment.yaml
   kubectl apply -f deployments/k8s/service.yaml
   
   # Check deployment status
   kubectl get pods -n nextevent
   kubectl logs -f deployment/nextevent-api -n nextevent
   ```

4. **Configure ingress**
   ```bash
   # Apply ingress configuration
   kubectl apply -f deployments/k8s/ingress.yaml
   
   # Check ingress status
   kubectl get ingress -n nextevent
   ```

### Production Deployment

1. **Production-grade database setup**
   ```bash
   # Use managed database service or deploy with high availability
   helm install postgres bitnami/postgresql \
     --namespace nextevent \
     --set architecture=replication \
     --set auth.postgresPassword=${DB_PASSWORD} \
     --set auth.database=nextevent \
     --set primary.persistence.size=200Gi \
     --set primary.resources.requests.memory=2Gi \
     --set primary.resources.requests.cpu=1000m \
     --set readReplicas.replicaCount=2 \
     --set readReplicas.persistence.size=200Gi
   ```

2. **Production Redis cluster**
   ```bash
   # Deploy Redis cluster
   helm install redis bitnami/redis-cluster \
     --namespace nextevent \
     --set cluster.nodes=6 \
     --set cluster.replicas=1 \
     --set persistence.size=20Gi \
     --set resources.requests.memory=1Gi \
     --set resources.requests.cpu=500m
   ```

3. **Deploy with production settings**
   ```bash
   # Update deployment with production image and resources
   sed -i 's|replicas: 3|replicas: 5|g' deployments/k8s/deployment.yaml
   sed -i 's|memory: "512Mi"|memory: "1Gi"|g' deployments/k8s/deployment.yaml
   sed -i 's|cpu: "500m"|cpu: "1000m"|g' deployments/k8s/deployment.yaml
   
   kubectl apply -f deployments/k8s/deployment.yaml
   ```

4. **Configure horizontal pod autoscaling**
   ```yaml
   # hpa.yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: nextevent-api-hpa
     namespace: nextevent
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: nextevent-api
     minReplicas: 3
     maxReplicas: 20
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

## ☁️ Cloud Provider Deployments

### AWS Deployment

1. **EKS Cluster Setup**
   ```bash
   # Create EKS cluster
   eksctl create cluster \
     --name nextevent-prod \
     --region us-west-2 \
     --nodegroup-name standard-workers \
     --node-type m5.large \
     --nodes 3 \
     --nodes-min 1 \
     --nodes-max 10 \
     --managed
   ```

2. **RDS PostgreSQL Setup**
   ```bash
   # Create RDS instance
   aws rds create-db-instance \
     --db-instance-identifier nextevent-prod \
     --db-instance-class db.r5.large \
     --engine postgres \
     --engine-version 15.4 \
     --master-username nextevent \
     --master-user-password ${DB_PASSWORD} \
     --allocated-storage 100 \
     --storage-type gp2 \
     --vpc-security-group-ids sg-xxxxxxxxx \
     --db-subnet-group-name nextevent-subnet-group \
     --backup-retention-period 7 \
     --multi-az \
     --storage-encrypted
   ```

3. **ElastiCache Redis Setup**
   ```bash
   # Create Redis cluster
   aws elasticache create-replication-group \
     --replication-group-id nextevent-redis \
     --description "NextEvent Redis Cluster" \
     --num-cache-clusters 3 \
     --cache-node-type cache.r5.large \
     --engine redis \
     --engine-version 7.0 \
     --cache-subnet-group-name nextevent-cache-subnet \
     --security-group-ids sg-xxxxxxxxx \
     --at-rest-encryption-enabled \
     --transit-encryption-enabled
   ```

### GCP Deployment

1. **GKE Cluster Setup**
   ```bash
   # Create GKE cluster
   gcloud container clusters create nextevent-prod \
     --zone us-central1-a \
     --machine-type n1-standard-2 \
     --num-nodes 3 \
     --enable-autoscaling \
     --min-nodes 1 \
     --max-nodes 10 \
     --enable-autorepair \
     --enable-autoupgrade
   ```

2. **Cloud SQL PostgreSQL**
   ```bash
   # Create Cloud SQL instance
   gcloud sql instances create nextevent-prod \
     --database-version POSTGRES_15 \
     --tier db-custom-2-4096 \
     --region us-central1 \
     --storage-size 100GB \
     --storage-type SSD \
     --backup-start-time 03:00 \
     --enable-bin-log \
     --maintenance-window-day SUN \
     --maintenance-window-hour 04
   ```

3. **Memorystore Redis**
   ```bash
   # Create Redis instance
   gcloud redis instances create nextevent-redis \
     --size 5 \
     --region us-central1 \
     --redis-version redis_7_0 \
     --tier standard
   ```

## 🔧 Configuration Management

### Environment-Specific Configurations

#### Development
```yaml
# config/development.yaml
server:
  port: 8080
  debug: true
  
database:
  host: localhost
  port: 5432
  name: nextevent_dev
  ssl_mode: disable
  max_open_conns: 10
  
cache:
  host: localhost
  port: 6379
  default_ttl: 10m
  
logging:
  level: debug
  format: text
```

#### Staging
```yaml
# config/staging.yaml
server:
  port: 8080
  debug: false
  
database:
  host: postgres-staging
  port: 5432
  name: nextevent_staging
  ssl_mode: require
  max_open_conns: 20
  
cache:
  host: redis-staging
  port: 6379
  default_ttl: 30m
  
logging:
  level: info
  format: json
```

#### Production
```yaml
# config/production.yaml
server:
  port: 8080
  debug: false
  read_timeout: 30s
  write_timeout: 30s
  
database:
  host: postgres-prod.internal
  port: 5432
  name: nextevent_prod
  ssl_mode: require
  max_open_conns: 25
  max_idle_conns: 10
  conn_max_lifetime: 1h
  
cache:
  host: redis-cluster.internal
  port: 6379
  pool_size: 20
  default_ttl: 1h
  
security:
  rate_limit: 100
  rate_burst: 200
  cors_origins: ["https://nextevent.com"]
  
logging:
  level: info
  format: json
```

## 📊 Monitoring and Observability

### Prometheus and Grafana Setup

1. **Deploy monitoring stack**
   ```bash
   # Add Prometheus Helm repository
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   
   # Install Prometheus
   helm install prometheus prometheus-community/kube-prometheus-stack \
     --namespace monitoring \
     --create-namespace \
     --set grafana.adminPassword=admin123 \
     --set prometheus.prometheusSpec.retention=30d \
     --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi
   ```

2. **Configure service monitoring**
   ```yaml
   # servicemonitor.yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: nextevent-api
     namespace: nextevent
   spec:
     selector:
       matchLabels:
         app.kubernetes.io/name: nextevent-api
     endpoints:
     - port: http
       path: /metrics
       interval: 30s
   ```

### Logging with ELK Stack

1. **Deploy Elasticsearch and Kibana**
   ```bash
   # Add Elastic Helm repository
   helm repo add elastic https://helm.elastic.co
   
   # Install Elasticsearch
   helm install elasticsearch elastic/elasticsearch \
     --namespace logging \
     --create-namespace \
     --set replicas=3 \
     --set volumeClaimTemplate.resources.requests.storage=30Gi
   
   # Install Kibana
   helm install kibana elastic/kibana \
     --namespace logging \
     --set service.type=LoadBalancer
   ```

2. **Configure log shipping**
   ```yaml
   # filebeat-config.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: filebeat-config
     namespace: logging
   data:
     filebeat.yml: |
       filebeat.inputs:
       - type: container
         paths:
           - /var/log/containers/nextevent-api-*.log
         processors:
         - add_kubernetes_metadata:
             host: ${NODE_NAME}
             matchers:
             - logs_path:
                 logs_path: "/var/log/containers/"
       
       output.elasticsearch:
         hosts: ["elasticsearch:9200"]
         index: "nextevent-api-%{+yyyy.MM.dd}"
   ```

## 🚀 Deployment Automation

### CI/CD Pipeline Integration

1. **GitHub Actions Deployment**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Production
   
   on:
     push:
       tags: ['v*']
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v4
       
       - name: Configure kubectl
         uses: azure/k8s-set-context@v3
         with:
           method: kubeconfig
           kubeconfig: ${{ secrets.KUBE_CONFIG }}
       
       - name: Deploy to Kubernetes
         run: |
           # Update image tag
           sed -i "s|image: nextevent/api:.*|image: nextevent/api:${GITHUB_REF#refs/tags/}|g" deployments/k8s/deployment.yaml
           
           # Apply manifests
           kubectl apply -f deployments/k8s/
           
           # Wait for rollout
           kubectl rollout status deployment/nextevent-api -n nextevent
   ```

2. **Helm Chart Deployment**
   ```bash
   # Create Helm chart
   helm create nextevent-api
   
   # Package and deploy
   helm package nextevent-api
   helm install nextevent-api ./nextevent-api-0.1.0.tgz \
     --namespace nextevent \
     --set image.tag=2.0.0 \
     --set replicaCount=3 \
     --set resources.requests.memory=512Mi
   ```

## 🔒 Security Considerations

### Network Security
- Use network policies to restrict pod-to-pod communication
- Configure ingress with SSL termination
- Implement WAF rules for additional protection

### Secret Management
- Use Kubernetes secrets or external secret management (Vault, AWS Secrets Manager)
- Rotate secrets regularly
- Never commit secrets to version control

### Image Security
- Scan container images for vulnerabilities
- Use minimal base images (Alpine, Distroless)
- Run containers as non-root users

## 📋 Post-Deployment Checklist

- [ ] Health checks are passing
- [ ] Metrics are being collected
- [ ] Logs are being shipped and indexed
- [ ] SSL certificates are valid
- [ ] Database connections are working
- [ ] Cache is operational
- [ ] Load balancer is distributing traffic
- [ ] Autoscaling is configured
- [ ] Backup procedures are in place
- [ ] Monitoring alerts are configured
- [ ] Documentation is updated

This deployment guide provides comprehensive instructions for deploying the NextEvent Go API v2.0 across different environments and cloud providers, ensuring a robust and scalable production deployment.
