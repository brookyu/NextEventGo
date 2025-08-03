import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Save,
  Eye,
  EyeOff,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  Settings,
  Clock,
  User,
  Tag,
  FileText,
  Palette,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Upload,
  Copy,
  Undo,
  Redo,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import Real135Editor from './Real135Editor';
import Enhanced135Editor from './Enhanced135Editor';
import ImageSelector from '../images/ImageSelector';
import { articlesApi, categoriesApi, type Article, type Category, type CreateArticleRequest, type UpdateArticleRequest } from '@/api/articles';
import { imagesApi } from '@/api/images';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  summary: z.string().max(1000, 'Summary must be less than 1000 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  author: z.string().min(1, 'Author is required').max(100, 'Author must be less than 100 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  siteImageId: z.string().optional(),
  promotionPicId: z.string().optional(),
  frontCoverImageUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  mode: 'create' | 'edit';
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const editorRef = useRef<any>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showStylePanel, setShowStylePanel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      author: '',
      categoryId: '',
      siteImageId: '',
      promotionPicId: '',
      frontCoverImageUrl: '',
      isPublished: false,
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');
  const watchedIsPublished = watch('isPublished');

  // Fetch existing article for edit mode
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesApi.getArticle(id!),
    enabled: mode === 'edit' && !!id,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateArticleRequest) => articlesApi.createArticle(data),
    onSuccess: (newArticle) => {
      toast.success('Article created successfully!');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      navigate(`/articles/${newArticle.id}/edit`);
    },
    onError: (error) => {
      toast.error('Failed to create article');
      console.error('Create error:', error);
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateArticleRequest) => articlesApi.updateArticle(id!, data),
    onSuccess: () => {
      toast.success('Article updated successfully!');
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error) => {
      toast.error('Failed to update article');
      console.error('Update error:', error);
    },
  });

  // Publish/unpublish mutations
  const publishMutation = useMutation({
    mutationFn: (articleId: string) => articlesApi.publishArticle(articleId),
    onSuccess: () => {
      toast.success('Article published successfully!');
      queryClient.invalidateQueries({ queryKey: ['article', id] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (articleId: string) => articlesApi.unpublishArticle(articleId),
    onSuccess: () => {
      toast.success('Article unpublished successfully!');
      queryClient.invalidateQueries({ queryKey: ['article', id] });
    },
  });

  // Load article data for edit mode
  useEffect(() => {
    if (article && mode === 'edit') {
      reset({
        title: article.title,
        summary: article.summary,
        content: article.content,
        author: article.author,
        categoryId: article.categoryId,
        siteImageId: article.siteImageId || '',
        promotionPicId: article.promotionPicId || '',
        frontCoverImageUrl: article.frontCoverImageUrl,
        isPublished: article.isPublished,
      });
    }
  }, [article, mode, reset]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || mode === 'create' || !id || !isDirty) return;

    const timer = setTimeout(() => {
      const formData = watch();
      updateMutation.mutate(formData);
    }, 2000);

    return () => clearTimeout(timer);
  }, [watchedContent, watchedTitle, autoSave, mode, id, isDirty, watch, updateMutation]);

  // Word count calculation
  useEffect(() => {
    const content = watchedContent || '';
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    setWordCount(textContent.length);
  }, [watchedContent]);

  // 135editor handles image uploads internally, so we don't need a custom handler
  const handleEditorReady = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // Get view mode width for responsive preview
  const getViewModeWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '375px';
    }
  };

  // Export content as HTML
  const handleExportHTML = () => {
    const content = watchedContent || '';
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${watchedTitle || 'article'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML exported successfully!');
  };

  // Copy content to clipboard
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(watchedContent || '');
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  // Form submission
  const onSubmit = (data: ArticleFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  // Handle publish/unpublish
  const handlePublishToggle = () => {
    if (!id) return;

    if (watchedIsPublished) {
      unpublishMutation.mutate(id);
    } else {
      publishMutation.mutate(id);
    }
  };

  if (articleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Enhanced Header with 135editor-style toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/articles')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {mode === 'create' ? 'Create Article' : 'Edit Article'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {wordCount} characters
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'edit' && id && (
              <Button
                onClick={handlePublishToggle}
                disabled={publishMutation.isPending || unpublishMutation.isPending}
                className="flex items-center gap-2"
                variant={watchedIsPublished ? 'outline' : 'default'}
              >
                <Send className="h-4 w-4" />
                {watchedIsPublished ? 'Unpublish' : 'Publish'}
              </Button>
            )}

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-6 py-2 bg-gray-50">
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-white rounded-md border p-1">
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
                className="h-8 px-2"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
                className="h-8 px-2"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
                className="h-8 px-2"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview Toggle */}
            <Button
              variant={showPreview ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>

            {/* Style Panel Toggle */}
            <Button
              variant={showStylePanel ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Styles
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Options */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHTML}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>

            {/* Settings */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editor Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto-save</Label>
                    <Switch
                      id="auto-save"
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fullscreen">Fullscreen Mode</Label>
                    <Switch
                      id="fullscreen"
                      checked={isFullscreen}
                      onCheckedChange={setIsFullscreen}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        <div className={`flex ${isFullscreen ? 'h-screen' : 'min-h-screen'}`}>
          {/* Sidebar - Article Settings */}
          <div className={`${showStylePanel ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-gray-50 border-r border-gray-200`}>
            <div className="p-4 space-y-6">
              {/* Article Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Article Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-xs font-medium">Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter article title..."
                      className="text-sm"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="summary" className="text-xs font-medium">Summary</Label>
                    <Textarea
                      id="summary"
                      {...register('summary')}
                      placeholder="Brief summary..."
                      rows={2}
                      className="text-sm"
                    />
                    {errors.summary && (
                      <p className="text-xs text-red-600 mt-1">{errors.summary.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Article Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="author" className="text-xs font-medium">Author *</Label>
                    <Input
                      id="author"
                      {...register('author')}
                      placeholder="Author name"
                      className="text-sm"
                    />
                    {errors.author && (
                      <p className="text-xs text-red-600 mt-1">{errors.author.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoryId" className="text-xs font-medium">Category *</Label>
                    <Select
                      value={watch('categoryId')}
                      onValueChange={(value) => setValue('categoryId', value, { shouldDirty: true })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="frontCoverImageUrl" className="text-xs font-medium">Cover Image URL</Label>
                    <Input
                      id="frontCoverImageUrl"
                      {...register('frontCoverImageUrl')}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                    />
                    {errors.frontCoverImageUrl && (
                      <p className="text-xs text-red-600 mt-1">{errors.frontCoverImageUrl.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Images */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Featured Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Cover Image</Label>
                    <ImageSelector
                      selectedImageId={watch('siteImageId')}
                      onImageSelect={(imageId) => setValue('siteImageId', imageId, { shouldDirty: true })}
                      placeholder="Select cover image"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Promotion Image</Label>
                    <ImageSelector
                      selectedImageId={watch('promotionPicId')}
                      onImageSelect={(imageId) => setValue('promotionPicId', imageId, { shouldDirty: true })}
                      placeholder="Select promotion image"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Article Status */}
              {mode === 'edit' && article && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Published</Label>
                      <Badge variant={watchedIsPublished ? 'default' : 'secondary'} className="text-xs">
                        {watchedIsPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>

                    <Separator />
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Views:</span>
                        <span>{article.viewCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reads:</span>
                        <span>{article.readCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                      {article.publishedAt && (
                        <div className="flex justify-between">
                          <span>Published:</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Editor Container */}
            <div className="flex-1 bg-white">
              {showPreview ? (
                /* Preview Mode */
                <div className="h-full overflow-auto">
                  <div
                    className="mx-auto transition-all duration-300 p-6"
                    style={{ width: getViewModeWidth(), maxWidth: '100%' }}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                      <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        {watchedTitle || 'Untitled Article'}
                      </h1>
                      <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: watchedContent || '<p class="text-gray-400">No content yet...</p>'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Editor Mode */
                <div className="h-full">
                  <Enhanced135Editor
                    content={watchedContent}
                    onChange={(content) => setValue('content', content, { shouldDirty: true })}
                    placeholder="开始创作你的文章..."
                    className="h-full"
                  />
                </div>
              )}

              {errors.content && (
                <div className="p-4 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;
