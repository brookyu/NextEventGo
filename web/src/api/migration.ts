import { api } from './client'
import type { 
  Migration, 
  MigrationStep, 
  MigrationLog, 
  ValidationSuite, 
  PerformanceMetrics, 
  RollbackPlan 
} from '@/types/migration'

export const migrationApi = {
  // Migration status and overview
  getMigrationStatus: () => {
    return api.get<{
      total_migrations: number
      completed_migrations: number
      running_migrations: number
      failed_migrations: number
      completion_rate: number
      migrations: Migration[]
    }>('/migration/status')
  },

  // Migration management
  getMigrations: () => {
    return api.get<{
      migrations: Migration[]
    }>('/migration/migrations')
  },

  getMigration: (id: string) => {
    return api.get<{
      migration: Migration
      steps: MigrationStep[]
      logs: MigrationLog[]
    }>(`/migration/migrations/${id}`)
  },

  createMigration: (data: {
    name: string
    description?: string
    version: string
  }) => {
    return api.post<{
      migration: Migration
    }>('/migration/migrations', data)
  },

  startMigration: (id: string) => {
    return api.post(`/migration/migrations/${id}/start`)
  },

  // Data validation
  validateData: (data: {
    validation_types: string[]
  }) => {
    return api.post<{
      validation_results: Record<string, ValidationSuite>
    }>('/migration/validate', data)
  },

  // Performance testing
  runPerformanceTest: (data: {
    test_type: string
    concurrent_users: number
    duration_seconds: number
  }) => {
    return api.post<{
      metrics: PerformanceMetrics
      performance_issues: string[]
      meets_targets: boolean
    }>('/migration/performance-test', data)
  },

  // Rollback management
  createRollbackPlan: (data: {
    migration_id: string
    name: string
    description?: string
  }) => {
    return api.post<{
      rollback_plan: RollbackPlan
    }>('/migration/rollback-plans', data)
  },

  getRollbackPlan: (id: string) => {
    return api.get<{
      rollback_plan: RollbackPlan
    }>(`/migration/rollback-plans/${id}`)
  },

  executeRollback: (id: string) => {
    return api.post(`/migration/rollback-plans/${id}/execute`)
  },
}
