import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, User, Building, MapPin, Phone, Mail, Image } from 'lucide-react'
import toast from 'react-hot-toast'

import type { WeChatUser, CreateWeChatUserRequest, UpdateWeChatUserRequest } from '@/types/users'

interface WeChatUserFormProps {
  user?: WeChatUser
  onSubmit: (data: CreateWeChatUserRequest | UpdateWeChatUserRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function WeChatUserForm({ user, onSubmit, onCancel, isLoading }: WeChatUserFormProps) {
  const [formData, setFormData] = useState({
    openId: user?.openId || '',
    unionId: user?.unionId || '',
    nickname: user?.nickname || '',
    realName: user?.realName || '',
    companyName: user?.companyName || '',
    position: user?.position || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    telephone: user?.telephone || '',
    workAddress: user?.workAddress || '',
    sex: user?.sex || 0,
    city: user?.city || '',
    province: user?.province || '',
    country: user?.country || '',
    language: user?.language || '',
    headImgUrl: user?.headImgUrl || '',
    subscribe: user?.subscribe ?? true,
    groupId: user?.groupId || undefined,
    remark: user?.remark || '',
    qrCodeValue: user?.qrCodeValue || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.openId.trim()) {
      newErrors.openId = 'OpenID is required'
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.mobile && !/^[\d\s\-\+\(\)]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number format'
    }

    if (formData.telephone && !/^[\d\s\-\+\(\)]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Invalid telephone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    try {
      const submitData = { ...formData }
      
      // Remove empty strings and convert to appropriate types
      Object.keys(submitData).forEach(key => {
        const value = submitData[key as keyof typeof submitData]
        if (value === '') {
          delete submitData[key as keyof typeof submitData]
        }
      })

      await onSubmit(submitData)
      toast.success(user ? 'WeChat user updated successfully' : 'WeChat user created successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save WeChat user')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-4xl mx-auto"
    >
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">
          {user ? 'Edit WeChat User' : 'Add WeChat User'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card-body space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OpenID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.openId}
                onChange={(e) => handleInputChange('openId', e.target.value)}
                disabled={!!user} // OpenID cannot be changed for existing users
                className={`input ${errors.openId ? 'border-red-500' : ''}`}
                placeholder="WeChat OpenID"
              />
              {errors.openId && <p className="text-red-500 text-sm mt-1">{errors.openId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UnionID
              </label>
              <input
                type="text"
                value={formData.unionId}
                onChange={(e) => handleInputChange('unionId', e.target.value)}
                className="input"
                placeholder="WeChat UnionID (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nickname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className={`input ${errors.nickname ? 'border-red-500' : ''}`}
                placeholder="Display name"
              />
              {errors.nickname && <p className="text-red-500 text-sm mt-1">{errors.nickname}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Real Name
              </label>
              <input
                type="text"
                value={formData.realName}
                onChange={(e) => handleInputChange('realName', e.target.value)}
                className="input"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', parseInt(e.target.value))}
                className="input"
              >
                <option value={0}>Unknown</option>
                <option value={1}>Male</option>
                <option value={2}>Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="input"
                placeholder="zh_CN, en, etc."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className={`input ${errors.mobile ? 'border-red-500' : ''}`}
                placeholder="Mobile phone number"
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telephone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                className={`input ${errors.telephone ? 'border-red-500' : ''}`}
                placeholder="Office phone number"
              />
              {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="input"
                placeholder="Company or organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="input"
                placeholder="Job title or role"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Address
              </label>
              <textarea
                value={formData.workAddress}
                onChange={(e) => handleInputChange('workAddress', e.target.value)}
                className="input"
                rows={2}
                placeholder="Office or work location"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="input"
                placeholder="Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province/State
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className="input"
                placeholder="Province or state"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="input"
                placeholder="City"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.headImgUrl}
                onChange={(e) => handleInputChange('headImgUrl', e.target.value)}
                className="input"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group ID
              </label>
              <input
                type="number"
                value={formData.groupId || ''}
                onChange={(e) => handleInputChange('groupId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input"
                placeholder="WeChat group ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Code Value
              </label>
              <input
                type="text"
                value={formData.qrCodeValue}
                onChange={(e) => handleInputChange('qrCodeValue', e.target.value)}
                className="input"
                placeholder="QR code data"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="subscribe"
                checked={formData.subscribe}
                onChange={(e) => handleInputChange('subscribe', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="subscribe" className="ml-2 block text-sm text-gray-900">
                Subscribed to WeChat account
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark
              </label>
              <textarea
                value={formData.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                className="input"
                rows={3}
                placeholder="Additional notes or remarks"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
