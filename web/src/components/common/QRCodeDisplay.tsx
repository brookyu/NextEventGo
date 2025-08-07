import React, { useState } from 'react'
import { QrCode, Download, Share2, Copy, ExternalLink, RefreshCw, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface QRCodeData {
  id: string
  qrCodeUrl: string
  sceneStr: string
  qrCodeType: 'permanent' | 'temporary'
  scanCount: number
  isActive: boolean
  createdAt: string
  expireTime?: string
  shareUrl?: string
}

interface QRCodeDisplayProps {
  qrCode: QRCodeData
  title?: string
  description?: string
  showActions?: boolean
  showStats?: boolean
  onDownload?: () => void
  onShare?: () => void
  onRevoke?: () => void
  onRefresh?: () => void
}

export default function QRCodeDisplay({
  qrCode,
  title = "QR Code",
  description,
  showActions = true,
  showStats = true,
  onDownload,
  onShare,
  onRevoke,
  onRefresh
}: QRCodeDisplayProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      const link = document.createElement('a')
      link.href = qrCode.qrCodeUrl
      link.download = `qr-code-${qrCode.sceneStr}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR code downloaded')
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }

    const shareUrl = qrCode.shareUrl || window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || 'Scan this QR code',
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        handleCopyUrl(shareUrl)
      }
    } else {
      handleCopyUrl(shareUrl)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const handlePreview = () => {
    if (qrCode.shareUrl) {
      window.open(qrCode.shareUrl, '_blank')
    } else {
      setIsPreviewOpen(true)
    }
  }

  const getStatusInfo = () => {
    if (!qrCode.isActive) {
      return {
        badge: <Badge variant="destructive">Revoked</Badge>,
        color: 'text-red-600'
      }
    }
    if (qrCode.expireTime && new Date(qrCode.expireTime) < new Date()) {
      return {
        badge: <Badge variant="secondary">Expired</Badge>,
        color: 'text-gray-600'
      }
    }
    return {
      badge: <Badge variant="default">Active</Badge>,
      color: 'text-green-600'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {title}
            </CardTitle>
            {statusInfo.badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* QR Code Image */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
              <img
                src={qrCode.qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48 object-contain cursor-pointer"
                onClick={() => setIsPreviewOpen(true)}
              />
            </div>
          </div>

          {/* QR Code Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline" className="text-xs">
                {qrCode.qrCodeType}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Scene:</span>
              <span className="font-mono text-xs">{qrCode.sceneStr}</span>
            </div>

            {showStats && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scans:</span>
                <span className="font-semibold">{qrCode.scanCount}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="text-xs">
                {new Date(qrCode.createdAt).toLocaleDateString()}
              </span>
            </div>

            {qrCode.expireTime && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span className="text-xs">
                  {new Date(qrCode.expireTime).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {showActions && (
            <>
              <Separator />
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                )}
              </div>

              {(onRevoke || onRefresh) && (
                <div className="grid grid-cols-1 gap-2">
                  {onRevoke && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onRevoke}
                      className="gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      Revoke QR Code
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* QR Code Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Preview</DialogTitle>
            <DialogDescription>
              Scan this QR code with your mobile device
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            <div className="bg-white p-6 rounded-lg border">
              <img
                src={qrCode.qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          <div className="space-y-2 text-sm text-center">
            <p className="text-muted-foreground">
              Scene: <span className="font-mono">{qrCode.sceneStr}</span>
            </p>
            {qrCode.shareUrl && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(qrCode.shareUrl!)}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(qrCode.shareUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Compact version for lists
export function QRCodeDisplayCompact({
  qrCode,
  title,
  onAction
}: {
  qrCode: QRCodeData
  title?: string
  onAction?: (action: 'download' | 'share' | 'preview' | 'revoke') => void
}) {
  const statusInfo = qrCode.isActive 
    ? { badge: <Badge variant="default" className="text-xs">Active</Badge>, color: 'text-green-600' }
    : { badge: <Badge variant="destructive" className="text-xs">Revoked</Badge>, color: 'text-red-600' }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <img
        src={qrCode.qrCodeUrl}
        alt="QR Code"
        className="w-12 h-12 border rounded"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {title && <span className="font-medium text-sm truncate">{title}</span>}
          {statusInfo.badge}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {qrCode.sceneStr} • {qrCode.scanCount} scans
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction?.('preview')}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction?.('download')}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction?.('share')}
          className="h-8 w-8 p-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// QR Code Generator Component
export function QRCodeGenerator({
  resourceId,
  resourceType,
  onGenerated,
  onError
}: {
  resourceId: string
  resourceType: 'article' | 'survey'
  onGenerated?: (qrCode: QRCodeData) => void
  onError?: (error: string) => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrType, setQrType] = useState<'permanent' | 'temporary'>('permanent')
  const [isOpen, setIsOpen] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // TODO: Implement actual API call
      // const qrCode = await api.generateQRCode(resourceId, resourceType, qrType)

      // Mock implementation
      const mockQRCode: QRCodeData = {
        id: Date.now().toString(),
        qrCodeUrl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=mock-ticket',
        sceneStr: `${resourceType}_${resourceId.slice(0, 8)}`,
        qrCodeType: qrType,
        scanCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        shareUrl: `${window.location.origin}/mobile/${resourceType}s/${resourceId}`,
      }

      onGenerated?.(mockQRCode)
      setIsOpen(false)
      toast.success('QR code generated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code'
      onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <QrCode className="h-4 w-4" />
          Generate QR Code
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate QR Code</DialogTitle>
          <DialogDescription>
            Create a QR code for mobile access to this {resourceType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">QR Code Type</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="permanent"
                  name="qrType"
                  value="permanent"
                  checked={qrType === 'permanent'}
                  onChange={(e) => setQrType(e.target.value as 'permanent')}
                  className="text-blue-600"
                />
                <label htmlFor="permanent" className="text-sm">
                  <span className="font-medium">Permanent</span>
                  <span className="text-muted-foreground block">Never expires, unlimited scans</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="temporary"
                  name="qrType"
                  value="temporary"
                  checked={qrType === 'temporary'}
                  onChange={(e) => setQrType(e.target.value as 'temporary')}
                  className="text-blue-600"
                />
                <label htmlFor="temporary" className="text-sm">
                  <span className="font-medium">Temporary</span>
                  <span className="text-muted-foreground block">Expires in 30 days</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating && <RefreshCw className="h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
