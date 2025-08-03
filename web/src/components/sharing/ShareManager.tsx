import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Share2,
  Copy,
  QrCode,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Eye,
  MousePointer,
  Users,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

import ShareDialog from './ShareDialog';
import PromotionCodeManager from './PromotionCodeManager';
import ShareAnalytics from './ShareAnalytics';

import { 
  sharingApi, 
  type ShareLink, 
  type ShareStats, 
  type SharePlatform,
  getPlatformIcon,
  getPlatformName,
  getPlatformColor,
} from '@/api/sharing';

interface ShareManagerProps {
  articleId?: string;
  showAnalytics?: boolean;
  compact?: boolean;
}

const ShareManager: React.FC<ShareManagerProps> = ({
  articleId,
  showAnalytics = true,
  compact = false,
}) => {
  const queryClient = useQueryClient();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedShareId, setSelectedShareId] = useState<string | null>(null);

  // Fetch share links
  const { data: shareLinks = [], isLoading: sharesLoading } = useQuery({
    queryKey: ['share-links', articleId],
    queryFn: () => sharingApi.getShareLinks(articleId),
  });

  // Fetch share stats
  const { data: shareStats, isLoading: statsLoading } = useQuery({
    queryKey: ['share-stats', articleId],
    queryFn: () => sharingApi.getShareStats(articleId),
    enabled: showAnalytics,
  });

  // Toggle share link mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => sharingApi.toggleShareLink(id),
    onSuccess: () => {
      toast.success('Share link updated successfully');
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
    },
    onError: () => {
      toast.error('Failed to update share link');
    },
  });

  // Delete share link mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sharingApi.deleteShareLink(id),
    onSuccess: () => {
      toast.success('Share link deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
    },
    onError: () => {
      toast.error('Failed to delete share link');
    },
  });

  // Copy to clipboard
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Handle share link toggle
  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  // Handle share link deletion
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this share link?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle analytics view
  const handleViewAnalytics = (shareId: string) => {
    setSelectedShareId(shareId);
    setAnalyticsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getConversionRate = (clicks: number, conversions: number) => {
    return clicks > 0 ? (conversions / clicks) * 100 : 0;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Quick Share Buttons */}
        <div className="flex items-center gap-2">
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Article</DialogTitle>
              </DialogHeader>
              <ShareDialog
                articleId={articleId}
                onClose={() => setShareDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {shareLinks.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {shareLinks.length} share{shareLinks.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        {shareStats && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="font-medium">{shareStats.totalClicks}</div>
              <div className="text-gray-500 text-xs">Clicks</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{shareStats.totalConversions}</div>
              <div className="text-gray-500 text-xs">Conversions</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{shareStats.conversionRate.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">Rate</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Share Management</h2>
          <p className="text-gray-600 mt-1">
            Manage article sharing and track performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Promotion Codes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Promotion Code Manager</DialogTitle>
              </DialogHeader>
              <PromotionCodeManager articleId={articleId} />
            </DialogContent>
          </Dialog>

          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Share Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Share Link</DialogTitle>
              </DialogHeader>
              <ShareDialog
                articleId={articleId}
                onClose={() => setShareDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Share Stats Overview */}
      {showAnalytics && shareStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Shares</CardTitle>
              <Share2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shareStats.totalShares}</div>
              <div className="text-xs text-gray-500">Across all platforms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shareStats.totalClicks}</div>
              <div className="text-xs text-gray-500">Link clicks</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shareStats.totalConversions}</div>
              <div className="text-xs text-gray-500">Completed reads</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shareStats.conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Click to read rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Links Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Links
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sharesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : shareLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Share2 className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No share links yet</h3>
              <p className="text-sm mb-4">Create your first share link to start tracking</p>
              <Button onClick={() => setShareDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Share Link
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Promotion Code</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareLinks.map((share) => {
                  const conversionRate = getConversionRate(share.clickCount, share.conversionCount);
                  
                  return (
                    <TableRow key={share.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span style={{ color: getPlatformColor(share.platform) }}>
                            {getPlatformIcon(share.platform)}
                          </span>
                          <span className="font-medium">{getPlatformName(share.platform)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {share.promotionCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(share.shareUrl)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-4 w-4 text-gray-400" />
                          {share.clickCount}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {share.conversionCount}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {conversionRate.toFixed(1)}%
                          </div>
                          <Progress value={conversionRate} className="h-1" />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={share.isActive ? 'default' : 'secondary'}>
                          {share.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(share.createdAt)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleCopyLink(share.shareUrl)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(share.shareUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewAnalytics(share.id)}
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggle(share.id)}
                            >
                              {share.isActive ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(share.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Analytics</DialogTitle>
          </DialogHeader>
          {selectedShareId && (
            <ShareAnalytics
              shareId={selectedShareId}
              onClose={() => setAnalyticsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareManager;
