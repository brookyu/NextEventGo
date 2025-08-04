import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Hash,
  Plus,
  Copy,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  MousePointer,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

import { 
  sharingApi, 
  type PromotionCode, 
  type SharePlatform,
  getPlatformName,
  getPlatformIcon,
} from '@/api/sharing';

interface PromotionCodeManagerProps {
  articleId?: string;
}

const PromotionCodeManager: React.FC<PromotionCodeManagerProps> = ({
  articleId,
}) => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCodeType, setNewCodeType] = useState<PromotionCode['type']>('referral');
  const [newCodePlatform, setNewCodePlatform] = useState<SharePlatform>('wechat');
  const [customCode, setCustomCode] = useState('');
  const [maxUses, setMaxUses] = useState<number | undefined>();
  const [expiresAt, setExpiresAt] = useState('');

  // Fetch promotion codes
  const { data: promotionCodes = [], isLoading } = useQuery({
    queryKey: ['promotion-codes', articleId],
    queryFn: () => sharingApi.getPromotionCodes(articleId),
  });

  // Generate promotion code mutation
  const generateMutation = useMutation({
    mutationFn: (data: {
      articleId: string;
      type: PromotionCode['type'];
      customCode?: string;
      expiresAt?: string;
      maxUses?: number;
      platform?: SharePlatform;
    }) => sharingApi.generatePromotionCode(data.articleId, data.type, {
      customCode: data.customCode,
      expiresAt: data.expiresAt,
      maxUses: data.maxUses,
      platform: data.platform,
    }),
    onSuccess: () => {
      toast.success('Promotion code generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['promotion-codes'] });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to generate promotion code');
    },
  });

  // Delete promotion code mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sharingApi.deletePromotionCode(id),
    onSuccess: () => {
      toast.success('Promotion code deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['promotion-codes'] });
    },
    onError: () => {
      toast.error('Failed to delete promotion code');
    },
  });

  const resetForm = () => {
    setCustomCode('');
    setMaxUses(undefined);
    setExpiresAt('');
    setNewCodeType('referral');
    setNewCodePlatform('wechat');
  };

  const handleGenerate = () => {
    if (!articleId) {
      toast.error('Article ID is required');
      return;
    }

    generateMutation.mutate({
      articleId,
      type: newCodeType,
      customCode: customCode || undefined,
      expiresAt: expiresAt || undefined,
      maxUses: maxUses,
      platform: newCodePlatform,
    });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Promotion code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion code?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeColor = (type: PromotionCode['type']) => {
    const colors = {
      referral: 'bg-blue-100 text-blue-800',
      campaign: 'bg-purple-100 text-purple-800',
      social: 'bg-green-100 text-green-800',
      email: 'bg-orange-100 text-orange-800',
      qr: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUsagePercentage = (current: number, max?: number) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Promotion Codes</h3>
          <p className="text-sm text-gray-600">
            Manage promotion codes for tracking and attribution
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Promotion Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codeType">Code Type</Label>
                <Select value={newCodeType} onValueChange={(value: any) => setNewCodeType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="qr">QR Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={newCodePlatform} onValueChange={(value: any) => setNewCodePlatform(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wechat">WeChat</SelectItem>
                    <SelectItem value="weibo">Weibo</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Code (Optional)</Label>
                <Input
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Leave empty for auto-generation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={maxUses || ''}
                  onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate Code'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promotion Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Active Promotion Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : promotionCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Hash className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No promotion codes yet</h3>
              <p className="text-sm mb-4">Generate your first promotion code to start tracking</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotionCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getTypeColor(code.type)}>
                        {code.type}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {code.platform && (
                        <div className="flex items-center gap-2">
                          <span>{getPlatformIcon(code.platform)}</span>
                          <span className="text-sm">{getPlatformName(code.platform)}</span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {code.currentUses}{code.maxUses ? `/${code.maxUses}` : ''}
                        </div>
                        {code.maxUses && (
                          <Progress 
                            value={getUsagePercentage(code.currentUses, code.maxUses)} 
                            className="h-1"
                          />
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4 text-gray-400" />
                        {code.clickCount}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {code.conversionCount}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm font-medium">
                        {code.conversionRate.toFixed(1)}%
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={code.isActive ? 'default' : 'secondary'}>
                        {code.isActive ? 'Active' : 'Inactive'}
                      </Badge>
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
                            onClick={() => handleCopyCode(code.code)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(code.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionCodeManager;
