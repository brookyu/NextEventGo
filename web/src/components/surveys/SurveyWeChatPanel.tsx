import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  QrCode, 
  Share2, 
  Download, 
  RefreshCw, 
  Trash2, 
  Eye,
  Copy,
  ExternalLink,
  Calendar,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { Survey } from '../../api/surveys'

interface SurveyWeChatPanelProps {
  survey: Survey
}

interface WeChatQRCode {
  id: string
  resourceId: string
  qrCodeUrl: string
  sceneStr: string
  qrCodeType: 'permanent' | 'temporary'
  scanCount: number
  isActive: boolean
  createdAt: string
  expireTime?: string
}

interface WeChatShareInfo {
  title: string
  description: string
  qrCodeUrl: string
  shareUrl: string
  qrCodeId: string
}

export default function SurveyWeChatPanel({ survey }: SurveyWeChatPanelProps) {
  const [selectedQRType, setSelectedQRType] = useState<'permanent' | 'temporary'>('permanent')
  const queryClient = useQueryClient()

  // Fetch QR codes for the survey
  const { data: qrCodes, isLoading: qrLoading } = useQuery({
    queryKey: ['survey-qrcodes', survey.id],
    queryFn: async () => {
      // TODO: Implement actual API call
      // return surveyApi.getWeChatQRCodes(survey.id)
      
      // Mock data for now
      return [
        {
          id: '1',
          resourceId: survey.id,
          qrCodeUrl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=mock-ticket',
          sceneStr: `survey_${survey.id.slice(0, 8)}`,
          qrCodeType: 'permanent' as const,
          scanCount: 25,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      ] as WeChatQRCode[]
    },
    enabled: !!survey.id,
  })

  // Fetch WeChat share info
  const { data: shareInfo, isLoading: shareLoading } = useQuery({
    queryKey: ['survey-wechat-share', survey.id],
    queryFn: async () => {
      // TODO: Implement actual API call
      // return surveyApi.getWeChatContent(survey.id)
      
      // Mock data for now
      return {
        title: survey.title,
        description: survey.description || '参与此调研，分享您的观点',
        qrCodeUrl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=mock-ticket',
        shareUrl: `${window.location.origin}/mobile/surveys/${survey.id}`,
        qrCodeId: '1',
      } as WeChatShareInfo
    },
    enabled: !!survey.id,
  })

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: (type: 'permanent' | 'temporary') => {
      // TODO: Implement actual API call
      // return surveyApi.generateWeChatQRCode(survey.id, type)
      
      // Mock implementation
      return Promise.resolve({
        id: Date.now().toString(),
        resourceId: survey.id,
        qrCodeUrl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=new-mock-ticket',
        sceneStr: `survey_${survey.id.slice(0, 8)}_${Date.now()}`,
        qrCodeType: type,
        scanCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      } as WeChatQRCode)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-qrcodes', survey.id] })
      toast.success('QR code generated successfully')
    },
    onError: () => {
      toast.error('Failed to generate QR code')
    },
  })

  // Revoke QR code mutation
  const revokeQRMutation = useMutation({
    mutationFn: (qrCodeId: string) => {
      // TODO: Implement actual API call
      // return surveyApi.revokeWeChatQRCode(qrCodeId)
      
      // Mock implementation
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-qrcodes', survey.id] })
      toast.success('QR code revoked successfully')
    },
    onError: () => {
      toast.error('Failed to revoke QR code')
    },
  })

  const handleGenerateQR = () => {
    generateQRMutation.mutate(selectedQRType)
  }

  const handleRevokeQR = (qrCodeId: string) => {
    revokeQRMutation.mutate(qrCodeId)
  }

  const handleDownloadQR = (qrCode: WeChatQRCode) => {
    const link = document.createElement('a')
    link.href = qrCode.qrCodeUrl
    link.download = `survey-qr-${qrCode.sceneStr}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded')
  }

  const handleCopyShareUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Share URL copied to clipboard')
  }

  const handleShare = async (shareInfo: WeChatShareInfo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareInfo.title,
          text: shareInfo.description,
          url: shareInfo.shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        handleCopyShareUrl(shareInfo.shareUrl)
      }
    } else {
      handleCopyShareUrl(shareInfo.shareUrl)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="qrcodes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="qrcodes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">QR Code Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <QrCode className="h-4 w-4" />
                      Generate QR Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate WeChat QR Code</DialogTitle>
                      <DialogDescription>
                        Create a QR code for sharing this survey on WeChat
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">QR Code Type</label>
                        <Select value={selectedQRType} onValueChange={setSelectedQRType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="permanent">Permanent</SelectItem>
                            <SelectItem value="temporary">Temporary (30 days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleGenerateQR}
                          disabled={generateQRMutation.isPending}
                          className="gap-2"
                        >
                          {generateQRMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                          Generate
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {qrLoading ? (
                <QRCodesSkeleton />
              ) : qrCodes && qrCodes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {qrCodes.map((qrCode) => (
                    <QRCodeCard
                      key={qrCode.id}
                      qrCode={qrCode}
                      onRevoke={() => handleRevokeQR(qrCode.id)}
                      onDownload={() => handleDownloadQR(qrCode)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No QR codes generated yet</p>
                  <p className="text-sm">Generate a QR code to enable mobile access</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">WeChat Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              {shareLoading ? (
                <ShareInfoSkeleton />
              ) : shareInfo ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={shareInfo.qrCodeUrl}
                      alt="Survey QR Code"
                      className="w-24 h-24 border rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{shareInfo.title}</h4>
                      <p className="text-sm text-muted-foreground">{shareInfo.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{survey.isAnonymous ? 'Anonymous' : 'Named'} Survey</span>
                        <Calendar className="h-3 w-3 ml-2" />
                        <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyShareUrl(shareInfo.shareUrl)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(shareInfo)}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(shareInfo.shareUrl, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sharing information not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// QR Code Card Component
function QRCodeCard({ 
  qrCode, 
  onRevoke, 
  onDownload 
}: { 
  qrCode: WeChatQRCode
  onRevoke: () => void
  onDownload: () => void
}) {
  const getStatusBadge = () => {
    if (!qrCode.isActive) {
      return <Badge variant="destructive">Revoked</Badge>
    }
    if (qrCode.expireTime && new Date(qrCode.expireTime) < new Date()) {
      return <Badge variant="secondary">Expired</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{qrCode.qrCodeType}</Badge>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Scene: {qrCode.sceneStr}
            </p>
          </div>
          <img
            src={qrCode.qrCodeUrl}
            alt="QR Code"
            className="w-16 h-16 border rounded"
          />
        </div>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">Scans:</span>
          <span className="font-medium">{qrCode.scanCount}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="gap-1"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRevoke}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Revoke
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Components
function QRCodesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="w-16 h-16" />
            </div>
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ShareInfoSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-24 h-24" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
