import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Image,
  QrCode,
} from 'lucide-react'

import type { WeChatUser } from '@/types/users'

interface WeChatUserDetailsProps {
  user: WeChatUser
}

export default function WeChatUserDetails({ user }: WeChatUserDetailsProps) {
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

  const getSubscriptionStatus = (subscribe: boolean) => {
    return subscribe ? 'Subscribed' : 'Unsubscribed'
  }

  const getSubscriptionColor = (subscribe: boolean) => {
    return subscribe ? 'text-success-600 bg-success-100' : 'text-gray-600 bg-gray-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-4xl mx-auto"
    >
      <div className="card-header">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            {user.headImgUrl ? (
              <img
                src={user.headImgUrl}
                alt={user.nickname}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-medium text-xl">
                {user.nickname?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.nickname}</h2>
            {user.realName && (
              <p className="text-lg text-gray-600">{user.realName}</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscribe)}`}>
                {user.subscribe ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                {getSubscriptionStatus(user.subscribe)}
              </span>
              <span className="text-sm text-gray-500">
                {getSexDisplay(user.sex)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">OpenID</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                {user.openId}
              </p>
            </div>
            {user.unionId && (
              <div>
                <label className="block text-sm font-medium text-gray-500">UnionID</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {user.unionId}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500">Gender</label>
              <p className="text-sm text-gray-900">{getSexDisplay(user.sex)}</p>
            </div>
            {user.language && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Language</label>
                <p className="text-sm text-gray-900">{user.language}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {(user.email || user.mobile || user.telephone) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${user.email}`} className="text-primary-600 hover:text-primary-700">
                      {user.email}
                    </a>
                  </p>
                </div>
              )}
              {user.mobile && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${user.mobile}`} className="text-primary-600 hover:text-primary-700">
                      {user.mobile}
                    </a>
                  </p>
                </div>
              )}
              {user.telephone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Telephone</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${user.telephone}`} className="text-primary-600 hover:text-primary-700">
                      {user.telephone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Information */}
        {(user.companyName || user.position || user.workAddress) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.companyName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <p className="text-sm text-gray-900">{user.companyName}</p>
                </div>
              )}
              {user.position && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Position</label>
                  <p className="text-sm text-gray-900">{user.position}</p>
                </div>
              )}
              {user.workAddress && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Work Address</label>
                  <p className="text-sm text-gray-900">{user.workAddress}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Information */}
        {(user.country || user.province || user.city) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.country && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Country</label>
                  <p className="text-sm text-gray-900">{user.country}</p>
                </div>
              )}
              {user.province && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Province/State</label>
                  <p className="text-sm text-gray-900">{user.province}</p>
                </div>
              )}
              {user.city && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">City</label>
                  <p className="text-sm text-gray-900">{user.city}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {(user.groupId || user.qrCodeValue || user.remark) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.groupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Group ID</label>
                  <p className="text-sm text-gray-900">{user.groupId}</p>
                </div>
              )}
              {user.qrCodeValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">QR Code Value</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <QrCode className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-mono bg-gray-50 px-2 py-1 rounded">
                      {user.qrCodeValue}
                    </span>
                  </p>
                </div>
              )}
              {user.remark && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Remark</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {user.remark}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm text-gray-900">
                {format(new Date(user.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm text-gray-900">
                {format(new Date(user.updatedAt), 'PPP p')}
              </p>
            </div>
            {user.subscribeTime && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Subscribe Time</label>
                <p className="text-sm text-gray-900">
                  {format(new Date(user.subscribeTime), 'PPP p')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
