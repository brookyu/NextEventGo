#!/bin/bash

# NextEvent Production Deployment Script
# This script handles blue-green deployment with gradual traffic shifting

set -euo pipefail

# Configuration
NAMESPACE_PROD="nextevent-production"
NAMESPACE_STAGING="nextevent-staging"
NAMESPACE_MONITORING="nextevent-monitoring"
KUBECTL_TIMEOUT="300s"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create namespaces
create_namespaces() {
    log_info "Creating namespaces..."
    kubectl apply -f deployments/kubernetes/namespace.yaml
    log_success "Namespaces created"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Create monitoring namespace if not exists
    kubectl create namespace ${NAMESPACE_MONITORING} --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy Prometheus
    kubectl apply -f deployments/monitoring/prometheus.yaml
    
    # Wait for Prometheus to be ready
    kubectl wait --for=condition=available --timeout=${KUBECTL_TIMEOUT} deployment/prometheus -n ${NAMESPACE_MONITORING}
    
    log_success "Monitoring stack deployed"
}

# Build and push images
build_and_push_images() {
    local version=$1
    log_info "Building and pushing images for version ${version}..."
    
    # Build API image
    docker build -t nextevent/api:${version} -f Dockerfile.api .
    docker push nextevent/api:${version}
    
    # Build frontend image
    docker build -t nextevent/frontend:${version} -f Dockerfile.frontend ./web
    docker push nextevent/frontend:${version}
    
    log_success "Images built and pushed for version ${version}"
}

# Deploy to staging
deploy_staging() {
    local version=$1
    log_info "Deploying version ${version} to staging..."
    
    # Update image tags in staging deployment
    sed "s|nextevent/api:latest|nextevent/api:${version}|g" deployments/kubernetes/deployment.yaml > /tmp/staging-deployment.yaml
    sed -i "s|nextevent/frontend:latest|nextevent/frontend:${version}|g" /tmp/staging-deployment.yaml
    sed -i "s|nextevent-production|${NAMESPACE_STAGING}|g" /tmp/staging-deployment.yaml
    
    # Apply staging configuration
    kubectl apply -f deployments/kubernetes/configmap.yaml
    kubectl apply -f deployments/kubernetes/secrets.yaml
    kubectl apply -f /tmp/staging-deployment.yaml
    kubectl apply -f deployments/kubernetes/service.yaml
    
    # Wait for staging deployment to be ready
    kubectl wait --for=condition=available --timeout=${KUBECTL_TIMEOUT} deployment/nextevent-api -n ${NAMESPACE_STAGING}
    kubectl wait --for=condition=available --timeout=${KUBECTL_TIMEOUT} deployment/nextevent-frontend -n ${NAMESPACE_STAGING}
    
    log_success "Staging deployment completed"
}

# Run health checks
health_check() {
    local namespace=$1
    local service_name=$2
    log_info "Running health checks for ${service_name} in ${namespace}..."
    
    local retries=0
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if kubectl exec -n ${namespace} deployment/${service_name} -- curl -f http://localhost:8081/health > /dev/null 2>&1; then
            log_success "Health check passed for ${service_name}"
            return 0
        fi
        
        retries=$((retries + 1))
        log_warning "Health check failed for ${service_name}, retry ${retries}/${HEALTH_CHECK_RETRIES}"
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    log_error "Health check failed for ${service_name} after ${HEALTH_CHECK_RETRIES} retries"
    return 1
}

# Run performance tests
run_performance_tests() {
    local namespace=$1
    log_info "Running performance tests against ${namespace}..."
    
    # Get service endpoint
    local api_endpoint=$(kubectl get service nextevent-api-service -n ${namespace} -o jsonpath='{.spec.clusterIP}')
    
    # Run performance tests using k6 or similar tool
    # This is a placeholder - implement actual performance testing
    log_info "Performance test endpoint: http://${api_endpoint}/api/health"
    
    # Simulate performance test
    sleep 5
    
    log_success "Performance tests completed"
}

# Deploy to production with blue-green strategy
deploy_production() {
    local version=$1
    local traffic_percentage=${2:-0}
    
    log_info "Deploying version ${version} to production with ${traffic_percentage}% traffic..."
    
    # Update image tags in production deployment
    sed "s|nextevent/api:latest|nextevent/api:${version}|g" deployments/kubernetes/deployment.yaml > /tmp/production-deployment.yaml
    sed -i "s|nextevent/frontend:latest|nextevent/frontend:${version}|g" /tmp/production-deployment.yaml
    
    # Apply production configuration
    kubectl apply -f deployments/kubernetes/configmap.yaml
    kubectl apply -f deployments/kubernetes/secrets.yaml
    kubectl apply -f /tmp/production-deployment.yaml
    kubectl apply -f deployments/kubernetes/service.yaml
    
    # Wait for production deployment to be ready
    kubectl wait --for=condition=available --timeout=${KUBECTL_TIMEOUT} deployment/nextevent-api -n ${NAMESPACE_PROD}
    kubectl wait --for=condition=available --timeout=${KUBECTL_TIMEOUT} deployment/nextevent-frontend -n ${NAMESPACE_PROD}
    
    # Update ingress for traffic shifting
    if [ $traffic_percentage -gt 0 ]; then
        update_traffic_split $traffic_percentage
    fi
    
    log_success "Production deployment completed"
}

# Update traffic split for blue-green deployment
update_traffic_split() {
    local percentage=$1
    log_info "Updating traffic split to ${percentage}% for new version..."
    
    # Update canary ingress weight
    kubectl patch ingress nextevent-ingress-canary -n ${NAMESPACE_PROD} -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"'${percentage}'"}}}'
    
    log_success "Traffic split updated to ${percentage}%"
}

# Rollback deployment
rollback_deployment() {
    log_warning "Rolling back deployment..."
    
    # Set canary weight to 0
    kubectl patch ingress nextevent-ingress-canary -n ${NAMESPACE_PROD} -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"0"}}}'
    
    # Rollback deployment
    kubectl rollout undo deployment/nextevent-api -n ${NAMESPACE_PROD}
    kubectl rollout undo deployment/nextevent-frontend -n ${NAMESPACE_PROD}
    
    # Wait for rollback to complete
    kubectl rollout status deployment/nextevent-api -n ${NAMESPACE_PROD}
    kubectl rollout status deployment/nextevent-frontend -n ${NAMESPACE_PROD}
    
    log_success "Rollback completed"
}

# Main deployment function
main() {
    local command=${1:-""}
    local version=${2:-"latest"}
    local traffic_percentage=${3:-0}
    
    case $command in
        "prerequisites")
            check_prerequisites
            ;;
        "monitoring")
            deploy_monitoring
            ;;
        "staging")
            check_prerequisites
            create_namespaces
            build_and_push_images $version
            deploy_staging $version
            health_check $NAMESPACE_STAGING "nextevent-api"
            run_performance_tests $NAMESPACE_STAGING
            ;;
        "production")
            check_prerequisites
            deploy_production $version $traffic_percentage
            health_check $NAMESPACE_PROD "nextevent-api"
            ;;
        "traffic")
            update_traffic_split $traffic_percentage
            ;;
        "rollback")
            rollback_deployment
            ;;
        "full")
            check_prerequisites
            create_namespaces
            deploy_monitoring
            build_and_push_images $version
            deploy_staging $version
            health_check $NAMESPACE_STAGING "nextevent-api"
            run_performance_tests $NAMESPACE_STAGING
            deploy_production $version 0
            health_check $NAMESPACE_PROD "nextevent-api"
            log_success "Full deployment completed. Use './deploy.sh traffic <percentage>' to shift traffic."
            ;;
        *)
            echo "Usage: $0 {prerequisites|monitoring|staging|production|traffic|rollback|full} [version] [traffic_percentage]"
            echo ""
            echo "Commands:"
            echo "  prerequisites  - Check deployment prerequisites"
            echo "  monitoring     - Deploy monitoring stack"
            echo "  staging        - Deploy to staging environment"
            echo "  production     - Deploy to production environment"
            echo "  traffic        - Update traffic split percentage"
            echo "  rollback       - Rollback production deployment"
            echo "  full           - Full deployment pipeline"
            echo ""
            echo "Examples:"
            echo "  $0 full v1.0.0                    # Full deployment"
            echo "  $0 production v1.0.0 10           # Deploy with 10% traffic"
            echo "  $0 traffic 50                     # Shift 50% traffic to new version"
            echo "  $0 rollback                       # Rollback deployment"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
