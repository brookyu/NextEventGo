import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  QrCode,
  Share2,
  Download,
  Eye,
  Copy,
  RefreshCw,
  Trash2,
  ExternalLink,
  Smartphone,
  Users,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react'

import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Separator } from '../ui/separator'
import { Progress } from '../ui/progress'
import { Skeleton } from '../ui/skeleton'

import { Article, WeChatQRCode, WeChatContentResponse } from '../../types/article'
import { articleApi } from '../../services/articleApi'
import { formatDate, formatNumber } from '../../lib/utils'

interface ArticleWeChatPanelProps {
  article: Article
}

export function ArticleWeChatPanel({ article }: ArticleWeChatPanelProps) {
  const queryClient = useQueryClient()
  const [selectedQRType, setSelectedQRType] = useState<'permanent' | 'temporary'>('permanent')

  // Fetch QR codes
  const { data: qrCodes, isLoading: qrLoading } = useQuery({
    queryKey: ['article-qrcodes', article.id],
    queryFn: () => articleApi.getWeChatQRCodes(article.id),
  })

  // Fetch WeChat content
  const { data: wechatContent, isLoading: contentLoading } = useQuery({
    queryKey: ['article-wechat-content', article.id],
    queryFn: () => articleApi.getWeChatContent(article.id),
  })

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: (type: 'permanent' | 'temporary') => 
      articleApi.generateWeChatQRCode(article.id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-qrcodes', article.id] })
      toast.success('QR code generated successfully')
    },
    onError: () => {
      toast.error('Failed to generate QR code')
    },
  })

  // Revoke QR code mutation
  const revokeQRMutation = useMutation({
    mutationFn: (qrCodeId: string) => articleApi.revokeWeChatQRCode(qrCodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-qrcodes', article.id] })
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

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const handleDownloadQR = (qrCode: WeChatQRCode) => {
    // Create a download link for the QR code image
    const link = document.createElement('a')
    link.href = qrCode.qrCodeUrl
    link.download = `qr-${article.title}-${qrCode.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">WeChat Integration</h3>
          <p className="text-sm text-muted-foreground">
            Manage QR codes and optimize content for WeChat sharing
          </p>
        </div>
      </div>

      <Tabs defaultValue="qrcodes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                        Create a QR code for sharing this article on WeChat
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
                      onCopyLink={() => handleCopyLink(qrCode.qrCodeUrl)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No QR codes generated yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">WeChat Optimized Content</CardTitle>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <ContentSkeleton />
              ) : wechatContent ? (
                <WeChatContentPreview content={wechatContent} />
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Content optimization not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">QR Scans</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatNumber(qrCodes?.reduce((sum, qr) => sum + qr.scanCount, 0) || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Shares</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatNumber(article.shareCount || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Views</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatNumber(article.viewCount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Reads</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatNumber(article.readCount)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface QRCodeCardProps {
  qrCode: WeChatQRCode
  onRevoke: () => void
  onDownload: () => void
  onCopyLink: () => void
}

function QRCodeCard({ qrCode, onRevoke, onDownload, onCopyLink }: QRCodeCardProps) {
  const getStatusBadge = () => {
    switch (qrCode.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
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

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Scans:</span>
            <span className="font-medium">{formatNumber(qrCode.scanCount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(qrCode.createdAt)}</span>
          </div>
          {qrCode.expireTime && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <span>{formatDate(qrCode.expireTime)}</span>
            </div>
          )}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onDownload} className="gap-1">
            <Download className="h-3 w-3" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={onCopyLink} className="gap-1">
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          {qrCode.status === 'active' && (
            <Button size="sm" variant="outline" onClick={onRevoke} className="gap-1 text-destructive">
              <Trash2 className="h-3 w-3" />
              Revoke
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function WeChatContentPreview({ content }: { content: WeChatContentResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Optimized Content Preview</h4>
        <Button size="sm" variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View Full
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content.optimizedContent }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(content.shareUrl)}>
          <Copy className="h-4 w-4 mr-1" />
          Copy Share URL
        </Button>
      </div>
    </div>
  )
}

function QRCodesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="w-16 h-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
