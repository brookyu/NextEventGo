import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  UserCog,
  MessageSquare,
  Database,
  Settings,
  X,
  FileText,
  Image,
  Video,
  FileQuestion,
  Newspaper,
  PlayCircle,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/events', icon: CalendarDays },
  { name: 'Attendees', href: '/attendees', icon: Users },
  { name: 'Articles', href: '/articles', icon: FileText },
  { name: 'Images', href: '/images', icon: Image },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Cloud Videos', href: '/cloud-videos', icon: PlayCircle },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Surveys', href: '/surveys', icon: FileQuestion },
  { name: 'Users', href: '/users', icon: UserCog },
  { name: 'WeChat', href: '/wechat', icon: MessageSquare },
  { name: 'Migration', href: '/migration', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">NextEvent</h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200">
          {/* Mobile header */}
          <div className="flex h-16 flex-shrink-0 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">NextEvent</h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  )
}
