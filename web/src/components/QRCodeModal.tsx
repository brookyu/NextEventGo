import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, Copy, QrCode, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  eventId?: string
  attendeeId?: string
  title: string
}

export default function QRCodeModal({ isOpen, onClose, eventId, attendeeId, title }: QRCodeModalProps) {
  const [qrCodeData, setQrCodeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expireHours, setExpireHours] = useState(24)

  // Mock QR code data - in real app this would come from API
  const mockQRCode = {
    code: eventId ? `EVT_${eventId}_${Date.now()}` : `ATT_${attendeeId}_${Date.now()}`,
    qrCodeUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="black">QR Code</text>
      </svg>
    `)}`,
    expiresAt: new Date(Date.now() + expireHours * 60 * 60 * 1000).toISOString(),
    scanCount: 0,
  }

  const generateQRCode = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setQrCodeData(mockQRCode)
      toast.success('QR code generated successfully!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeData?.qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeData.qrCodeUrl
    link.download = `qr-code-${eventId || attendeeId}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  const shareQRCode = async () => {
    if (navigator.share && qrCodeData) {
      try {
        await navigator.share({
          title: `QR Code - ${title}`,
          text: `QR Code for ${title}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copy URL
        copyToClipboard(window.location.href)
      }
    } else {
      copyToClipboard(window.location.href)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <QrCode className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                    <p className="text-sm text-gray-600">{title}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!qrCodeData ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Generate QR Code</h4>
                    <p className="text-sm text-gray-600 mb-6">
                      Create a QR code for {eventId ? 'event registration' : 'attendee check-in'}
                    </p>

                    {eventId && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiration (hours)
                        </label>
                        <select
                          value={expireHours}
                          onChange={(e) => setExpireHours(Number(e.target.value))}
                          className="input"
                        >
                          <option value={1}>1 hour</option>
                          <option value={6}>6 hours</option>
                          <option value={24}>24 hours</option>
                          <option value={168}>1 week</option>
                          <option value={0}>Never expires</option>
                        </select>
                      </div>
                    )}

                    <button
                      onClick={generateQRCode}
                      disabled={isLoading}
                      className="btn-primary w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="spinner w-4 h-4 mr-2"></div>
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    {/* QR Code Display */}
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 inline-block">
                      <img
                        src={qrCodeData.qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>

                    {/* QR Code Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Code:</span>
                        <div className="flex items-center">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                            {qrCodeData.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(qrCodeData.code)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      {qrCodeData.expiresAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Expires:</span>
                          <span className="text-gray-900">
                            {new Date(qrCodeData.expiresAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Scans:</span>
                        <span className="text-gray-900">{qrCodeData.scanCount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={downloadQRCode}
                        className="btn-secondary btn-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={shareQRCode}
                        className="btn-secondary btn-sm"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </button>
                      <button
                        onClick={generateQRCode}
                        className="btn-secondary btn-sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
