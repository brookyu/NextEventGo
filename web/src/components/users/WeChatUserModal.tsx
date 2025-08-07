import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { usersApi } from '@/api/users'
import type { WeChatUser, CreateWeChatUserRequest, UpdateWeChatUserRequest } from '@/types/users'
import WeChatUserForm from './WeChatUserForm'

interface WeChatUserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: WeChatUser
}

export default function WeChatUserModal({ isOpen, onClose, user }: WeChatUserModalProps) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateWeChatUserRequest) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      onClose()
      toast.success('WeChat user created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create WeChat user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ openId, data }: { openId: string; data: UpdateWeChatUserRequest }) =>
      usersApi.updateUser(openId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      onClose()
      toast.success('WeChat user updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update WeChat user')
    },
  })

  const handleSubmit = async (data: CreateWeChatUserRequest | UpdateWeChatUserRequest) => {
    if (user) {
      // Update existing user
      await updateMutation.mutateAsync({
        openId: user.openId,
        data: data as UpdateWeChatUserRequest,
      })
    } else {
      // Create new user
      await createMutation.mutateAsync(data as CreateWeChatUserRequest)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user ? 'Edit WeChat User' : 'Add WeChat User'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <WeChatUserForm
                  user={user}
                  onSubmit={handleSubmit}
                  onCancel={onClose}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
