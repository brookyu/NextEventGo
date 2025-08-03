import { useState } from 'react'
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb or page title could go here */}
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                {user?.username}
              </span>
            </button>

            {/* User dropdown menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  onBlur={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
