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
import type { WeChatUser, WeChatUserFilters } from '@/types/users'
import { useWebSocket } from '@/hooks/useWebSocket'
import { WeChatUserModal } from '@/components/users'

export default function UsersPage() {
  const [filters, setFilters] = useState<WeChatUserFilters>({
    search: '',
    subscribe: undefined,
    sex: undefined,
    city: '',
    province: '',
    country: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<WeChatUser | undefined>(undefined)
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
        subscribe: filters.subscribe,
        sex: filters.sex,
        city: filters.city || undefined,
        province: filters.province || undefined,
        country: filters.country || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        createdAtStart: filters.createdAtStart,
        createdAtEnd: filters.createdAtEnd,
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

  const handleFilterChange = (key: keyof WeChatUserFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSelectUser = (openId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(openId)
        ? prev.filter((id) => id !== openId)
        : [...prev, openId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.openId))
    }
  }

  const getSubscriptionStatus = (subscribe: boolean) => {
    return subscribe ? 'Subscribed' : 'Unsubscribed'
  }

  const getSubscriptionColor = (subscribe: boolean) => {
    return subscribe ? 'badge-success' : 'badge-gray'
  }

  const getSexDisplay = (sex: number) => {
    switch (sex) {
      case 1:
        return 'Male'
      case 2:
        return 'Female'
      default:
        return 'Unknown'
    }
  }

  const handleAddUser = () => {
    setEditingUser(undefined)
    setShowUserModal(true)
  }

  const handleEditUser = (user: WeChatUser) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleCloseModal = () => {
    setShowUserModal(false)
    setEditingUser(undefined)
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
          <h1 className="text-2xl font-bold text-gray-900">Wechat Users Management</h1>
          <p className="text-gray-600">
            Manage WeChat user accounts and subscriber information
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
          <button onClick={handleAddUser} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Wechat User
          </button>
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
                  <p className="text-sm font-medium text-gray-600">Total Wechat Users</p>
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
                  <p className="text-sm font-medium text-gray-600">Subscribed Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.subscribedUsers}</p>
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
                  <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unsubscribedUsers}</p>
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
              placeholder="Search wechat users..."
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
                      Subscription
                    </label>
                    <select
                      value={filters.subscribe === undefined ? 'all' : filters.subscribe.toString()}
                      onChange={(e) => {
                        const value = e.target.value === 'all' ? undefined : e.target.value === 'true'
                        handleFilterChange('subscribe', value)
                      }}
                      className="input"
                    >
                      <option value="all">All Users</option>
                      <option value="true">Subscribed</option>
                      <option value="false">Unsubscribed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={filters.sex === undefined ? 'all' : filters.sex.toString()}
                      onChange={(e) => {
                        const value = e.target.value === 'all' ? undefined : parseInt(e.target.value)
                        handleFilterChange('sex', value)
                      }}
                      className="input"
                    >
                      <option value="all">All Genders</option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                      <option value="0">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={filters.city || ''}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      placeholder="Filter by city"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <input
                      type="text"
                      value={filters.province || ''}
                      onChange={(e) => handleFilterChange('province', e.target.value)}
                      placeholder="Filter by province"
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={filters.country || ''}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      placeholder="Filter by country"
                      className="input"
                    />
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
                      <option value="nickname">Nickname</option>
                      <option value="realName">Real Name</option>
                      <option value="companyName">Company</option>
                      <option value="subscribeTime">Subscribe Time</option>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No wechat users found</h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.subscribe !== undefined || filters.sex !== undefined
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first wechat user'}
          </p>
          <button onClick={handleAddUser} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Wechat User
          </button>
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
                    {selectedUsers.length} of {users.length} wechat users selected
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
                    <th>Wechat User</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Subscription</th>
                    <th>Created</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.openId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.openId)}
                          onChange={() => handleSelectUser(user.openId)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            {user.headImgUrl ? (
                              <img
                                src={user.headImgUrl}
                                alt={user.nickname}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span className="text-primary-600 font-medium">
                                {user.nickname?.[0]?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium text-gray-900">{user.nickname}</p>
                              <span className="ml-2 text-xs text-gray-400">({getSexDisplay(user.sex)})</span>
                            </div>
                            {user.realName && (
                              <p className="text-sm text-gray-500">{user.realName}</p>
                            )}
                            {user.email && (
                              <p className="text-xs text-gray-400">{user.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {user.companyName && (
                            <p className="font-medium text-gray-900">{user.companyName}</p>
                          )}
                          {user.position && (
                            <p className="text-sm text-gray-500">{user.position}</p>
                          )}
                          {!user.companyName && !user.position && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          {user.city && user.province && (
                            <p className="text-sm text-gray-900">{user.city}, {user.province}</p>
                          )}
                          {user.country && (
                            <p className="text-xs text-gray-500">{user.country}</p>
                          )}
                          {!user.city && !user.province && !user.country && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getSubscriptionColor(user.subscribe)} flex items-center`}>
                          {user.subscribe ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                          <span className="ml-1">{getSubscriptionStatus(user.subscribe)}</span>
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm text-gray-900">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(user.createdAt))} ago
                          </p>
                          {user.subscribeTime && (
                            <p className="text-xs text-gray-400">
                              Subscribed: {format(new Date(user.subscribeTime), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Add delete functionality
                              toast.error('Delete functionality not implemented yet')
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
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
            {pagination.total} wechat users
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

      {/* WeChat User Modal */}
      <WeChatUserModal
        isOpen={showUserModal}
        onClose={handleCloseModal}
        user={editingUser}
      />
    </div>
  )
}
