import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  User, 
  Eye, 
  Share2, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Archive,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { NewsListItem } from '../../types/news'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

interface NewsListViewProps {
  news: NewsListItem[]
  loading?: boolean
  selectedIds?: string[]
  onSelect?: (id: string) => void
  onSelectAll?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
  onArchive?: (id: string) => void
  onViewAnalytics?: (id: string) => void
}

export default function NewsListView({
  news,
  loading = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onUnpublish,
  onArchive,
  onViewAnalytics,
}: NewsListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breaking':
        return 'bg-red-100 text-red-800'
      case 'announcement':
        return 'bg-blue-100 text-blue-800'
      case 'update':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="ml-4 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Globe className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
        <p className="text-gray-500 mb-6">
          Get started by creating your first news publication
        </p>
        <Button onClick={() => onEdit?.('new')}>
          Create News
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      {onSelectAll && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedIds.length === news.length && news.length > 0}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Select all ({news.length} items)
            </span>
          </label>
          {selectedIds.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedIds.length} selected
            </span>
          )}
        </div>
      )}

      {/* News List */}
      {news.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
            selectedIds.includes(item.id) ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Selection Checkbox */}
                {onSelect && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onSelect(item.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                )}

                {/* Featured Image */}
                {item.featuredImageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={item.featuredImageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Title and Priority */}
                      <div className="flex items-center space-x-2 mb-2">
                        {getPriorityIcon(item.priority)}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.title}
                        </h3>
                      </div>

                      {/* Summary */}
                      {item.summary && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.summary}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        {item.categoryNames?.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {item.authorName && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{item.authorName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {item.publishedAt
                              ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })
                              : formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                            }
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.viewCount.toLocaleString()} views</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>{item.shareCount.toLocaleString()} shares</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.articleCount} articles</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(item.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewAnalytics?.(item.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate?.(item.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.status === 'draft' ? (
                          <DropdownMenuItem onClick={() => onPublish?.(item.id)}>
                            <Globe className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onUnpublish?.(item.id)}>
                            <Clock className="w-4 h-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onArchive?.(item.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
