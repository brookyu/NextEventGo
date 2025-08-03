export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'

export interface Migration {
  id: string
  name: string
  description?: string
  version: string
  status: MigrationStatus
  started_at?: string
  completed_at?: string
  error_msg?: string
  checksum?: string
  created_at: string
  updated_at: string
}

export interface MigrationStep {
  id: string
  migration_id: string
  name: string
  description?: string
  step_order: number
  status: MigrationStatus
  started_at?: string
  completed_at?: string
  error_msg?: string
  records_total: number
  records_done: number
  created_at: string
  updated_at: string
}

export interface MigrationLog {
  id: string
  migration_id: string
  step_id?: string
  level: 'info' | 'warn' | 'error'
  message: string
  details?: string
  created_at: string
}

export interface ValidationResult {
  table_name: string
  check_type: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  record_count: number
  error_count: number
  details: string[]
  executed_at: string
  duration_ms: number
}

export interface ValidationSuite {
  id: string
  name: string
  description: string
  results: ValidationResult[]
  status: 'running' | 'completed' | 'failed' | 'completed_with_warnings'
  started_at: string
  completed_at?: string
  duration_ms: number
}

export interface PerformanceMetrics {
  test_name: string
  total_requests: number
  successful_requests: number
  failed_requests: number
  average_latency_ms: number
  p50_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  min_latency_ms: number
  max_latency_ms: number
  requests_per_second: number
  error_rate_percent: number
  test_duration_ms: number
  concurrent_users: number
  start_time: string
  end_time: string
}

export interface RollbackStep {
  id: string
  rollback_plan_id: string
  name: string
  description?: string
  step_order: number
  step_type: 'sql' | 'api_call' | 'file_operation'
  command: string
  parameters?: string
  status: MigrationStatus
  executed_at?: string
  completed_at?: string
  error_msg?: string
  created_at: string
  updated_at: string
}

export interface RollbackPlan {
  id: string
  migration_id: string
  name: string
  description?: string
  steps: RollbackStep[]
  status: MigrationStatus
  created_at: string
  updated_at: string
  executed_at?: string
  completed_at?: string
}

export interface RollbackTrigger {
  id: string
  migration_id: string
  trigger_type: 'error_rate' | 'latency' | 'validation_failure'
  threshold: number
  time_window_minutes: number
  is_active: boolean
  last_triggered?: string
  created_at: string
  updated_at: string
}

export interface MigrationProgress {
  migration_id: string
  total_steps: number
  completed_steps: number
  current_step?: string
  progress_percentage: number
  estimated_completion?: string
  records_processed: number
  records_total: number
}

export interface SystemValidation {
  validation_type: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details: string[]
  executed_at: string
  duration_ms: number
}

export interface MigrationReport {
  migration_id: string
  migration_name: string
  start_time: string
  end_time?: string
  duration_ms?: number
  status: MigrationStatus
  validation_results: ValidationSuite[]
  performance_metrics: PerformanceMetrics[]
  rollback_plans: RollbackPlan[]
  issues: {
    type: 'error' | 'warning' | 'info'
    message: string
    details?: string
    timestamp: string
  }[]
  recommendations: string[]
}
