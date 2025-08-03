import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Clock,
  Mail,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { usersApi } from '@/api/users'
import type { User, UserFilters } from '@/types/users'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // WebSocket for real-time updates
  const { subscribe } = useWebSocket()

  // Fetch users with filters
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', filters, currentPage],
    queryFn: () =>
      usersApi.getUsers({
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: filters.search || undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch user statistics
  const { data: statsData } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => usersApi.getUserStatistics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const users = usersData?.data.users || []
  const pagination = usersData?.data.pagination
  const stats = statsData?.data

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.id))
    }
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'badge-success'
      case 'inactive':
        return 'badge-gray'
      case 'suspended':
        return 'badge-error'
      default:
        return 'badge-gray'
    }
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'badge-error'
      case 'manager':
        return 'badge-warning'
      case 'user':
        return 'badge-primary'
      default:
        return 'badge-gray'
    }
  }

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <UserCheck className="w-3 h-3" />
      case 'inactive':
        return <Clock className="w-3 h-3" />
      case 'suspended':
        return <UserX className="w-3 h-3" />
      default:
        return <Users className="w-3 h-3" />
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600 mb-4">Failed to load users</p>
        <button onClick={() => refetch()} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
            {pagination && (
              <span className="ml-2 text-sm">
                ({pagination.total} total users)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} selected
              </span>
              <button className="btn-secondary btn-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button className="btn-error btn-sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          )}
          <Link to="/users/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </div>
      </div>

      {/* Statistics cards */}
      {stats && (
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
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-100">
                  <Users className="w-6 h-6 text-primary-600" />
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
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
                <div className="p-3 rounded-lg bg-success-100">
                  <UserCheck className="w-6 h-6 text-success-600" />
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
                  <p className="text-sm font-medium text-gray-600">New This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisWeek}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning-100">
                  <Plus className="w-6 h-6 text-warning-600" />
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
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
                </div>
                <div className="p-3 rounded-lg bg-error-100">
                  <AlertTriangle className="w-6 h-6 text-error-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-50 text-primary-700' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card"
            >
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={filters.role}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="input"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input"
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="username">Username</option>
                      <option value="email">Email</option>
                      <option value="lastLoginAt">Last Login</option>
                      <option value="loginCount">Login Count</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="input"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="card">
          <div className="card-body">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.role !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first user'}
          </p>
          <Link to="/users/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          <div className="card-body p-0">
            {/* Bulk actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-primary-50 border-b border-primary-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-primary-900">
                    {selectedUsers.length} of {users.length} users selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary btn-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export Selected
                  </button>
                  <button className="btn-error btn-sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Created</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span className="text-primary-600 font-medium">
                                {user.firstName?.[0] || user.username[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium text-gray-900">{user.username}</p>
                              {!user.isEmailVerified && (
                                <Mail className="w-4 h-4 text-warning-500 ml-2" title="Email not verified" />
                              )}
                              {user.isTwoFactorEnabled && (
                                <Shield className="w-4 h-4 text-success-500 ml-1" title="2FA enabled" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.firstName && user.lastName && (
                              <p className="text-xs text-gray-400">{user.firstName} {user.lastName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusColor(user.status)} flex items-center`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1">{user.status}</span>
                        </span>
                      </td>
                      <td>
                        {user.lastLoginAt ? (
                          <div>
                            <p className="text-sm text-gray-900">
                              {formatDistanceToNow(new Date(user.lastLoginAt))} ago
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Never</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <p className="text-sm text-gray-900">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(user.createdAt))} ago
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="relative">
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {pagination.offset + 1} to{' '}
            {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(pagination.total / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(pagination.total / pageSize)}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
