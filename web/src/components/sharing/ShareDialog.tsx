import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Share2,
  Copy,
  QrCode,
  Calendar,
  Hash,
  Type,
  Image,
  MessageSquare,
  Wand2,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import SocialPlatformGrid from './SocialPlatformGrid';
import WeChatShareConfig from './WeChatShareConfig';
import SharePreview from './SharePreview';

import { 
  sharingApi, 
  type ShareRequest, 
  type SharePlatform, 
  type ShareTemplate,
  getPlatformName,
  getPlatformIcon,
  getPlatformColor,
} from '@/api/sharing';
import { articlesApi } from '@/api/articles';

const shareSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  promotionCode: z.string().optional(),
  expiresAt: z.string().optional(),
  customMessage: z.string().max(280, 'Message too long').optional(),
  hashtags: z.string().optional(),
  mentions: z.string().optional(),
  templateId: z.string().optional(),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareDialogProps {
  articleId?: string;
  onClose: () => void;
  initialPlatform?: SharePlatform;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  articleId,
  onClose,
  initialPlatform,
}) => {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform>(initialPlatform || 'wechat');
  const [useTemplate, setUseTemplate] = useState(false);
  const [generateQR, setGenerateQR] = useState(false);

  // Fetch article details
  const { data: article } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => articlesApi.getArticle(articleId!),
    enabled: !!articleId,
  });

  // Fetch share templates
  const { data: templates = [] } = useQuery({
    queryKey: ['share-templates', selectedPlatform],
    queryFn: () => sharingApi.getShareTemplates(selectedPlatform),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      platform: selectedPlatform,
      title: article?.title || '',
      description: article?.summary || '',
      imageUrl: article?.coverImage?.url || '',
    },
  });

  // Create share link mutation
  const createShareMutation = useMutation({
    mutationFn: (data: ShareRequest) => sharingApi.createShareLink(data),
    onSuccess: (shareLink) => {
      toast.success('Share link created successfully!');
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      
      // Copy link to clipboard
      navigator.clipboard.writeText(shareLink.shareUrl).then(() => {
        toast.success('Link copied to clipboard!');
      });
      
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create share link');
      console.error('Share creation error:', error);
    },
  });

  const watchedValues = watch();

  const handlePlatformChange = (platform: SharePlatform) => {
    setSelectedPlatform(platform);
    setValue('platform', platform);
  };

  const handleTemplateSelect = (template: ShareTemplate) => {
    setValue('title', template.title);
    setValue('description', template.description);
    setValue('imageUrl', template.imageUrl || '');
    if (template.hashtags) {
      setValue('hashtags', template.hashtags.join(', '));
    }
  };

  const handleGenerateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setValue('promotionCode', `${selectedPlatform.toUpperCase()}_${randomCode}`);
  };

  const onSubmit = (data: ShareFormData) => {
    if (!articleId) {
      toast.error('Article ID is required');
      return;
    }

    const shareRequest: ShareRequest = {
      articleId,
      platform: data.platform as SharePlatform,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      promotionCode: data.promotionCode,
      expiresAt: data.expiresAt,
      customMessage: data.customMessage,
      hashtags: data.hashtags ? data.hashtags.split(',').map(tag => tag.trim()) : undefined,
      mentions: data.mentions ? data.mentions.split(',').map(mention => mention.trim()) : undefined,
      templateId: data.templateId,
    };

    createShareMutation.mutate(shareRequest);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Platform</Label>
            <SocialPlatformGrid
              selectedPlatform={selectedPlatform}
              onPlatformSelect={handlePlatformChange}
            />
          </div>

          <Separator />

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Use Template</Label>
                <Switch
                  checked={useTemplate}
                  onCheckedChange={setUseTemplate}
                />
              </div>
              
              {useTemplate && (
                <Select onValueChange={(templateId) => {
                  const template = templates.find(t => t.id === templateId);
                  if (template) {
                    handleTemplateSelect(template);
                    setValue('templateId', templateId);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Separator />

          {/* Basic Share Information */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter share title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter share description"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image URL
              </Label>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="Enter image URL"
                className={errors.imageUrl ? 'border-red-500' : ''}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionCode" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Promotion Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="promotionCode"
                  {...register('promotionCode')}
                  placeholder="Enter or generate promotion code"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={generateQR}
                  onCheckedChange={setGenerateQR}
                />
                <Label className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Generate QR Code
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create Share Link'}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Advanced Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customMessage" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Custom Message
              </Label>
              <Textarea
                id="customMessage"
                {...register('customMessage')}
                placeholder="Add a custom message for this platform"
                rows={2}
                className={errors.customMessage ? 'border-red-500' : ''}
              />
              {errors.customMessage && (
                <p className="text-sm text-red-500">{errors.customMessage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                {...register('hashtags')}
                placeholder="Enter hashtags separated by commas"
              />
              <p className="text-xs text-gray-500">
                Example: technology, innovation, article
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentions">Mentions</Label>
              <Input
                id="mentions"
                {...register('mentions')}
                placeholder="Enter mentions separated by commas"
              />
              <p className="text-xs text-gray-500">
                Example: @username, @company
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expiration Date (Optional)
              </Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register('expiresAt')}
              />
            </div>
          </div>

          {/* WeChat Specific Options */}
          {selectedPlatform === 'wechat' && (
            <WeChatShareConfig
              title={watchedValues.title}
              description={watchedValues.description || ''}
              imageUrl={watchedValues.imageUrl}
            />
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <SharePreview
            platform={selectedPlatform}
            title={watchedValues.title}
            description={watchedValues.description || ''}
            imageUrl={watchedValues.imageUrl}
            customMessage={watchedValues.customMessage}
            hashtags={watchedValues.hashtags ? watchedValues.hashtags.split(',').map(tag => tag.trim()) : []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShareDialog;
