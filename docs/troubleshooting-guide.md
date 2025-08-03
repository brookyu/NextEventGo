# Troubleshooting Guide

This guide provides comprehensive troubleshooting procedures for common issues with the NextEvent Go API v2.0.

## 🔍 General Troubleshooting Approach

### 1. Check System Health
```bash
# Check overall system health
curl http://localhost:8080/health

# Check readiness
curl http://localhost:8080/ready

# Check liveness
curl http://localhost:8080/live

# Check metrics
curl http://localhost:8080/metrics
```

### 2. Review Logs
```bash
# Application logs
kubectl logs -f deployment/nextevent-api -n nextevent

# Previous container logs
kubectl logs deployment/nextevent-api -n nextevent --previous

# All pods logs
kubectl logs -l app.kubernetes.io/name=nextevent-api -n nextevent --tail=100
```

### 3. Check Resource Usage
```bash
# Pod resource usage
kubectl top pods -n nextevent

# Node resource usage
kubectl top nodes

# Describe pod for events
kubectl describe pod <pod-name> -n nextevent
```

## 🚨 Common Issues and Solutions

### Database Connection Issues

#### Issue: "connection refused" or "timeout"
**Symptoms:**
- API returns 500 errors
- Health check fails
- Logs show database connection errors

**Diagnosis:**
```bash
# Check database pod status
kubectl get pods -l app=postgresql -n nextevent

# Check database logs
kubectl logs -l app=postgresql -n nextevent

# Test database connectivity from API pod
kubectl exec -it deployment/nextevent-api -n nextevent -- sh
# Inside pod:
nc -zv postgres-service 5432
```

**Solutions:**
1. **Database pod not running:**
   ```bash
   # Restart database
   kubectl rollout restart deployment/postgresql -n nextevent
   
   # Check persistent volume
   kubectl get pv,pvc -n nextevent
   ```

2. **Connection pool exhausted:**
   ```bash
   # Check connection pool metrics
   curl http://localhost:8080/metrics | grep db_connections
   
   # Increase pool size in configuration
   kubectl edit configmap nextevent-config -n nextevent
   # Update DB_MAX_OPEN_CONNS value
   ```

3. **Network policy blocking connections:**
   ```bash
   # Check network policies
   kubectl get networkpolicy -n nextevent
   
   # Temporarily disable to test
   kubectl delete networkpolicy nextevent-api-netpol -n nextevent
   ```

#### Issue: "too many connections"
**Symptoms:**
- Database rejects new connections
- Application cannot establish new connections

**Solutions:**
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection limits
SHOW max_connections;

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < now() - interval '5 minutes';
```

### Cache Connection Issues

#### Issue: Redis connection failures
**Symptoms:**
- Cache operations fail
- Increased database load
- Slower response times

**Diagnosis:**
```bash
# Check Redis pod status
kubectl get pods -l app=redis -n nextevent

# Test Redis connectivity
kubectl exec -it deployment/nextevent-api -n nextevent -- sh
# Inside pod:
redis-cli -h redis-service ping
```

**Solutions:**
1. **Redis pod not responding:**
   ```bash
   # Restart Redis
   kubectl rollout restart deployment/redis -n nextevent
   
   # Check Redis logs
   kubectl logs -l app=redis -n nextevent
   ```

2. **Memory issues:**
   ```bash
   # Check Redis memory usage
   kubectl exec -it deployment/redis -n nextevent -- redis-cli info memory
   
   # Clear cache if needed
   kubectl exec -it deployment/redis -n nextevent -- redis-cli flushall
   ```

### Performance Issues

#### Issue: High response times
**Symptoms:**
- API responses > 1 second
- Timeout errors
- Poor user experience

**Diagnosis:**
```bash
# Check response time metrics
curl http://localhost:8080/metrics | grep http_request_duration

# Check database query performance
kubectl exec -it deployment/postgresql -n nextevent -- psql -U nextevent -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;"

# Check cache hit ratio
curl http://localhost:8080/metrics | grep cache_hits
```

**Solutions:**
1. **Database performance:**
   ```sql
   -- Add missing indexes
   CREATE INDEX CONCURRENTLY idx_site_images_status_created 
   ON site_images(status, created_at);
   
   -- Analyze query plans
   EXPLAIN ANALYZE SELECT * FROM site_images WHERE status = 'active';
   
   -- Update table statistics
   ANALYZE;
   ```

2. **Cache optimization:**
   ```bash
   # Increase cache TTL
   kubectl edit configmap nextevent-config -n nextevent
   # Update CACHE_DEFAULT_TTL
   
   # Warm up cache
   curl -X POST http://localhost:8080/admin/cache/warmup
   ```

3. **Resource scaling:**
   ```bash
   # Scale up pods
   kubectl scale deployment nextevent-api --replicas=5 -n nextevent
   
   # Increase resource limits
   kubectl patch deployment nextevent-api -n nextevent -p '
   {
     "spec": {
       "template": {
         "spec": {
           "containers": [{
             "name": "nextevent-api",
             "resources": {
               "limits": {"memory": "1Gi", "cpu": "1000m"},
               "requests": {"memory": "512Mi", "cpu": "500m"}
             }
           }]
         }
       }
     }
   }'
   ```

#### Issue: High memory usage
**Symptoms:**
- Pods being OOMKilled
- Memory usage > 80%
- Frequent garbage collection

**Diagnosis:**
```bash
# Check memory metrics
kubectl top pods -n nextevent

# Get memory profile
curl http://localhost:8080/debug/pprof/heap > heap.prof
go tool pprof heap.prof

# Check for memory leaks
curl http://localhost:8080/debug/pprof/goroutine?debug=1
```

**Solutions:**
1. **Increase memory limits:**
   ```bash
   kubectl patch deployment nextevent-api -n nextevent -p '
   {
     "spec": {
       "template": {
         "spec": {
           "containers": [{
             "name": "nextevent-api",
             "resources": {
               "limits": {"memory": "2Gi"}
             }
           }]
         }
       }
     }
   }'
   ```

2. **Optimize application:**
   ```go
   // Implement object pooling
   var responsePool = sync.Pool{
       New: func() interface{} {
           return &Response{}
       },
   }
   
   // Use streaming for large responses
   func (h *handler) streamLargeData(c *gin.Context) {
       c.Stream(func(w io.Writer) bool {
           // Stream data chunk by chunk
           return true
       })
   }
   ```

### Authentication and Authorization Issues

#### Issue: "401 Unauthorized" errors
**Symptoms:**
- Valid API keys rejected
- JWT tokens not accepted
- Authentication middleware failures

**Diagnosis:**
```bash
# Check API key configuration
kubectl get secret nextevent-secrets -n nextevent -o yaml

# Test authentication
curl -H "X-API-Key: your-api-key" http://localhost:8080/api/v2/images

# Check JWT token
curl -H "Authorization: Bearer your-jwt-token" http://localhost:8080/api/v2/images
```

**Solutions:**
1. **API key issues:**
   ```bash
   # Update API keys
   kubectl patch secret nextevent-secrets -n nextevent -p '
   {
     "stringData": {
       "API_KEY_ADMIN": "new-admin-key"
     }
   }'
   
   # Restart pods to pick up new secrets
   kubectl rollout restart deployment/nextevent-api -n nextevent
   ```

2. **JWT token issues:**
   ```bash
   # Check JWT secret
   kubectl get secret nextevent-secrets -n nextevent -o jsonpath='{.data.JWT_SECRET}' | base64 -d
   
   # Verify token manually
   echo "your-jwt-token" | jwt decode -
   ```

### File Upload Issues

#### Issue: File uploads failing
**Symptoms:**
- 413 Request Entity Too Large
- Upload timeouts
- Corrupted files

**Diagnosis:**
```bash
# Check upload limits
curl -I -X POST -H "Content-Type: multipart/form-data" \
  -F "file=@large-file.jpg" \
  http://localhost:8080/api/v2/images

# Check disk space
kubectl exec -it deployment/nextevent-api -n nextevent -- df -h

# Check upload directory permissions
kubectl exec -it deployment/nextevent-api -n nextevent -- ls -la /app/uploads
```

**Solutions:**
1. **Increase upload limits:**
   ```bash
   # Update nginx ingress
   kubectl patch ingress nextevent-api-ingress -n nextevent -p '
   {
     "metadata": {
       "annotations": {
         "nginx.ingress.kubernetes.io/proxy-body-size": "100m"
       }
     }
   }'
   
   # Update application config
   kubectl edit configmap nextevent-config -n nextevent
   # Update UPLOAD_MAX_SIZE
   ```

2. **Fix storage issues:**
   ```bash
   # Increase PVC size
   kubectl patch pvc nextevent-uploads-pvc -n nextevent -p '
   {
     "spec": {
       "resources": {
         "requests": {
           "storage": "100Gi"
         }
       }
     }
   }'
   ```

### Monitoring and Alerting Issues

#### Issue: Metrics not being collected
**Symptoms:**
- Empty Grafana dashboards
- No Prometheus targets
- Missing alerts

**Diagnosis:**
```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring
# Open http://localhost:9090/targets

# Check service monitor
kubectl get servicemonitor -n nextevent

# Test metrics endpoint
curl http://localhost:8080/metrics
```

**Solutions:**
1. **Fix service monitor:**
   ```yaml
   # Ensure correct labels
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: nextevent-api
     namespace: nextevent
     labels:
       release: prometheus  # Important for discovery
   spec:
     selector:
       matchLabels:
         app.kubernetes.io/name: nextevent-api
   ```

2. **Check network policies:**
   ```bash
   # Allow Prometheus to scrape metrics
   kubectl apply -f - <<EOF
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: allow-prometheus
     namespace: nextevent
   spec:
     podSelector:
       matchLabels:
         app.kubernetes.io/name: nextevent-api
     policyTypes:
     - Ingress
     ingress:
     - from:
       - namespaceSelector:
           matchLabels:
             name: monitoring
   EOF
   ```

## 🔧 Debugging Tools and Commands

### Application Debugging
```bash
# Get application version
curl http://localhost:8080/version

# Check configuration
kubectl exec -it deployment/nextevent-api -n nextevent -- env | grep -E "(DB_|REDIS_|CACHE_)"

# Get goroutine dump
curl http://localhost:8080/debug/pprof/goroutine?debug=1

# Get CPU profile
curl http://localhost:8080/debug/pprof/profile?seconds=30 > cpu.prof
go tool pprof cpu.prof
```

### Database Debugging
```sql
-- Check active connections
SELECT pid, usename, application_name, client_addr, state, query_start, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Check slow queries
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- queries taking > 1 second
ORDER BY mean_exec_time DESC;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Cache Debugging
```bash
# Redis info
kubectl exec -it deployment/redis -n nextevent -- redis-cli info

# Check memory usage
kubectl exec -it deployment/redis -n nextevent -- redis-cli info memory

# Monitor commands
kubectl exec -it deployment/redis -n nextevent -- redis-cli monitor

# Check key patterns
kubectl exec -it deployment/redis -n nextevent -- redis-cli --scan --pattern "nextevent:*"
```

## 📞 Escalation Procedures

### Severity Levels

**Critical (P0):**
- Service completely down
- Data loss or corruption
- Security breach

**High (P1):**
- Significant performance degradation
- Feature not working
- High error rates

**Medium (P2):**
- Minor performance issues
- Non-critical feature issues
- Monitoring alerts

**Low (P3):**
- Documentation issues
- Enhancement requests
- Minor bugs

### Contact Information
- **On-call Engineer**: +1-xxx-xxx-xxxx
- **DevOps Team**: devops@nextevent.com
- **Security Team**: security@nextevent.com
- **Slack Channel**: #nextevent-alerts

### Emergency Procedures
1. **Immediate Response** (< 5 minutes)
   - Acknowledge the incident
   - Assess severity level
   - Notify stakeholders

2. **Investigation** (< 15 minutes)
   - Gather logs and metrics
   - Identify root cause
   - Implement temporary fix if possible

3. **Resolution** (< 1 hour for P0, < 4 hours for P1)
   - Deploy permanent fix
   - Verify resolution
   - Update stakeholders

4. **Post-Incident** (< 24 hours)
   - Conduct post-mortem
   - Document lessons learned
   - Implement preventive measures

This troubleshooting guide provides comprehensive procedures for diagnosing and resolving common issues with the NextEvent Go API v2.0, ensuring minimal downtime and optimal performance.
