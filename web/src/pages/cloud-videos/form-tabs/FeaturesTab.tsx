import React from 'react'
import { MessageCircle, Heart, Share2, TrendingUp, Download, Users, Eye, BarChart3 } from 'lucide-react'

interface FeaturesTabProps {
  formData: any
  onChange: (field: string, value: any) => void
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ formData, onChange }) => {
  const featureGroups = [
    {
      title: 'User Interaction Features',
      description: 'Enable various ways for users to interact with your content',
      features: [
        {
          id: 'enableComments',
          title: 'Comments',
          description: 'Allow users to leave comments and feedback',
          icon: MessageCircle,
          color: 'blue'
        },
        {
          id: 'enableLikes',
          title: 'Likes',
          description: 'Enable like/heart functionality',
          icon: Heart,
          color: 'red'
        },
        {
          id: 'enableSharing',
          title: 'Sharing',
          description: 'Allow users to share content on social media',
          icon: Share2,
          color: 'green'
        }
      ]
    },
    {
      title: 'Analytics & Insights',
      description: 'Track user engagement and content performance',
      features: [
        {
          id: 'enableAnalytics',
          title: 'Analytics Tracking',
          description: 'Collect detailed analytics and user behavior data',
          icon: TrendingUp,
          color: 'purple'
        }
      ]
    },
    {
      title: 'Content Access',
      description: 'Control how users can access and use your content',
      features: [
        {
          id: 'allowDownload',
          title: 'Download Permission',
          description: 'Allow users to download content files',
          icon: Download,
          color: 'orange'
        }
      ]
    }
  ]

  const getIconColor = (color: string, enabled: boolean) => {
    if (!enabled) return 'text-gray-400'
    
    const colors = {
      blue: 'text-blue-500',
      red: 'text-red-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500'
    }
    return colors[color as keyof typeof colors] || 'text-gray-500'
  }

  const getBgColor = (color: string, enabled: boolean) => {
    if (!enabled) return 'bg-gray-50'
    
    const colors = {
      blue: 'bg-blue-50',
      red: 'bg-red-50',
      green: 'bg-green-50',
      purple: 'bg-purple-50',
      orange: 'bg-orange-50'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-50'
  }

  const getBorderColor = (color: string, enabled: boolean) => {
    if (!enabled) return 'border-gray-200'
    
    const colors = {
      blue: 'border-blue-200',
      red: 'border-red-200',
      green: 'border-green-200',
      purple: 'border-purple-200',
      orange: 'border-orange-200'
    }
    return colors[color as keyof typeof colors] || 'border-gray-200'
  }

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-600">
        <p>Configure features and capabilities for your CloudVideo. These settings control how users can interact with and access your content.</p>
      </div>

      {featureGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{group.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.features.map((feature) => {
              const Icon = feature.icon
              const enabled = formData[feature.id]

              return (
                <div
                  key={feature.id}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    enabled 
                      ? `${getBgColor(feature.color, true)} ${getBorderColor(feature.color, true)}`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onChange(feature.id, !enabled)}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      enabled ? getBgColor(feature.color, true) : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${getIconColor(feature.color, enabled)}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {feature.title}
                        </h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => onChange(feature.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Feature Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Feature Configuration Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center">
                <MessageCircle className={`w-3 h-3 mr-1 ${formData.enableComments ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={formData.enableComments ? 'text-blue-700' : 'text-gray-500'}>
                  Comments {formData.enableComments ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center">
                <Heart className={`w-3 h-3 mr-1 ${formData.enableLikes ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={formData.enableLikes ? 'text-red-700' : 'text-gray-500'}>
                  Likes {formData.enableLikes ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center">
                <Share2 className={`w-3 h-3 mr-1 ${formData.enableSharing ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={formData.enableSharing ? 'text-green-700' : 'text-gray-500'}>
                  Sharing {formData.enableSharing ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center">
                <TrendingUp className={`w-3 h-3 mr-1 ${formData.enableAnalytics ? 'text-purple-500' : 'text-gray-400'}`} />
                <span className={formData.enableAnalytics ? 'text-purple-700' : 'text-gray-500'}>
                  Analytics {formData.enableAnalytics ? 'On' : 'Off'}
                </span>
              </div>
            </div>
            
            {formData.enableAnalytics && (
              <div className="mt-3 p-3 bg-white rounded border border-primary-200">
                <p className="text-xs text-gray-600">
                  <strong>Analytics Enabled:</strong> This CloudVideo will track user engagement, 
                  viewing patterns, interaction rates, and detailed session analytics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Eye className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Feature Recommendations
            </h3>
            <div className="text-sm text-yellow-700 mt-1 space-y-1">
              {!formData.enableAnalytics && (
                <p>• Consider enabling Analytics to track content performance</p>
              )}
              {!formData.enableComments && formData.supportInteraction && (
                <p>• Enable Comments to increase user engagement</p>
              )}
              {!formData.enableSharing && formData.isOpen && (
                <p>• Enable Sharing to increase content reach</p>
              )}
              {formData.enableComments || formData.enableLikes || formData.enableSharing ? null : (
                <p>• Enable interaction features to build community engagement</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesTab
