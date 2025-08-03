import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Database,
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Activity,
  TrendingUp,
  Shield,
  Download,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ProgressBar } from 'recharts'
import toast from 'react-hot-toast'

import { migrationApi } from '@/api/migration'
import type { Migration, ValidationSuite, PerformanceMetrics, RollbackPlan } from '@/types/migration'

export default function MigrationDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'performance' | 'rollback'>('overview')
  const [selectedMigration, setSelectedMigration] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch migration status
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['migration-status'],
    queryFn: () => migrationApi.getMigrationStatus(),
    refetchInterval: 5000, // Refetch every 5 seconds
  })

  // Fetch migrations
  const { data: migrationsData, isLoading: migrationsLoading } = useQuery({
    queryKey: ['migrations'],
    queryFn: () => migrationApi.getMigrations(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const status = statusData?.data
  const migrations = migrationsData?.data.migrations || []

  // Start migration mutation
  const startMigrationMutation = useMutation({
    mutationFn: migrationApi.startMigration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migrations'] })
      queryClient.invalidateQueries({ queryKey: ['migration-status'] })
      toast.success('Migration started successfully!')
    },
    onError: () => {
      toast.error('Failed to start migration')
    },
  })

  // Validation mutation
  const validateDataMutation = useMutation({
    mutationFn: migrationApi.validateData,
    onSuccess: () => {
      toast.success('Data validation completed!')
    },
    onError: () => {
      toast.error('Data validation failed')
    },
  })

  // Performance test mutation
  const performanceTestMutation = useMutation({
    mutationFn: migrationApi.runPerformanceTest,
    onSuccess: () => {
      toast.success('Performance test completed!')
    },
    onError: () => {
      toast.error('Performance test failed')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-100'
      case 'running':
        return 'text-primary-600 bg-primary-100'
      case 'failed':
        return 'text-error-600 bg-error-100'
      case 'pending':
        return 'text-warning-600 bg-warning-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'running':
        return <Activity className="w-4 h-4" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const handleStartMigration = (migrationId: string) => {
    startMigrationMutation.mutate(migrationId)
  }

  const handleValidateData = (validationTypes: string[]) => {
    validateDataMutation.mutate({ validation_types: validationTypes })
  }

  const handlePerformanceTest = (testType: string, concurrentUsers: number, duration: number) => {
    performanceTestMutation.mutate({
      test_type: testType,
      concurrent_users: concurrentUsers,
      duration_seconds: duration,
    })
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Migration Dashboard</h1>
          <p className="text-gray-600">Monitor data migration progress and system validation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetchStatus()}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Status overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Migrations</p>
                  <p className="text-2xl font-bold text-gray-900">{status.total_migrations}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-100">
                  <Database className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{status.completed_migrations}</p>
                </div>
                <div className="p-3 rounded-lg bg-success-100">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-gray-900">{status.running_migrations}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning-100">
                  <Activity className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{status.completion_rate?.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-error-100">
                  <TrendingUp className="w-6 h-6 text-error-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Database },
            { id: 'validation', name: 'Validation', icon: Shield },
            { id: 'performance', name: 'Performance', icon: Zap },
            { id: 'rollback', name: 'Rollback', icon: RotateCcw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Migrations list */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Active Migrations</h3>
              </div>
              <div className="card-body p-0">
                {migrationsLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : migrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Migrations</h3>
                    <p className="text-gray-600">All migrations have been completed or no migrations are currently running.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {migrations.map((migration: Migration, index: number) => (
                      <motion.div
                        key={migration.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-6 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(migration.status)}`}>
                              {getStatusIcon(migration.status)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{migration.name}</h4>
                              <p className="text-sm text-gray-600">{migration.description}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">Version: {migration.version}</span>
                                {migration.started_at && (
                                  <span className="text-xs text-gray-500">
                                    Started: {formatDistanceToNow(new Date(migration.started_at))} ago
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`badge ${getStatusColor(migration.status)}`}>
                              {migration.status}
                            </span>
                            {migration.status === 'pending' && (
                              <button
                                onClick={() => handleStartMigration(migration.id)}
                                disabled={startMigrationMutation.isPending}
                                className="btn-primary btn-sm"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedMigration(migration.id)}
                              className="btn-secondary btn-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        {migration.status === 'running' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'validation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Data Validation</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleValidateData(['events'])}
                      disabled={validateDataMutation.isPending}
                      className="btn-secondary"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Validate Events
                    </button>
                    <button
                      onClick={() => handleValidateData(['wechat'])}
                      disabled={validateDataMutation.isPending}
                      className="btn-secondary"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Validate WeChat
                    </button>
                    <button
                      onClick={() => handleValidateData(['users'])}
                      disabled={validateDataMutation.isPending}
                      className="btn-secondary"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Validate Users
                    </button>
                  </div>
                  <button
                    onClick={() => handleValidateData(['events', 'wechat', 'users'])}
                    disabled={validateDataMutation.isPending}
                    className="btn-primary w-full"
                  >
                    {validateDataMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Validating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Validate All Data
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Performance Testing</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handlePerformanceTest('events', 50, 60)}
                      disabled={performanceTestMutation.isPending}
                      className="btn-secondary"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Test Events API
                    </button>
                    <button
                      onClick={() => handlePerformanceTest('wechat', 50, 60)}
                      disabled={performanceTestMutation.isPending}
                      className="btn-secondary"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Test WeChat API
                    </button>
                    <button
                      onClick={() => handlePerformanceTest('users', 50, 60)}
                      disabled={performanceTestMutation.isPending}
                      className="btn-secondary"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Test Users API
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Performance tests run with 50 concurrent users for 60 seconds
                    </p>
                    {performanceTestMutation.isPending && (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Running performance test...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rollback' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center py-12">
              <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rollback Management</h3>
              <p className="text-gray-600">Rollback plans and execution monitoring coming soon...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
