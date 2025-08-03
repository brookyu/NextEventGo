import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
  Plus,
  X,
  Check,
  AlertCircle,
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import Real135Editor from './Real135Editor';
import ImageSelector from '../images/ImageSelector';
import { articlesApi, categoriesApi, type Article, type Category, type CreateArticleRequest, type UpdateArticleRequest } from '@/api/articles';
import { imagesApi } from '@/api/images';
import './CreateUpdateArticle.css';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  summary: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required').max(100, 'Author must be less than 100 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  siteImageId: z.string().optional(),
  promotionPicId: z.string().optional(),
  frontCoverImageUrl: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Must be a valid URL'),
  isPublished: z.boolean(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface CreateUpdateArticleProps {
  mode: 'create' | 'edit';
}

const CreateUpdateArticle: React.FC<CreateUpdateArticleProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const editorRef = useRef<any>(null);

  // UI State
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [editorType, setEditorType] = useState<'enhanced' | 'real135'>('real135');
  const [showImageSelector, setShowImageSelector] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
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
      tags: [],
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');
  const watchedIsPublished = watch('isPublished');

  // Debug watchedContent changes
  // useEffect(() => {
  //   console.log('watchedContent changed:', watchedContent);
  // }, [watchedContent]);

  // Debug form errors
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  // Fetch existing article for edit mode
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesApi.getArticle(id!),
    enabled: mode === 'edit' && !!id,
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
  });

  // Debug categories
  useEffect(() => {
    console.log('Categories data:', categories);
    console.log('Categories loading:', categoriesLoading);
    console.log('Categories error:', categoriesError);
  }, [categories, categoriesLoading, categoriesError]);

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
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setLastSaved(new Date());
      setIsDirty(false);
    },
    onError: (error) => {
      toast.error('Failed to update article');
      console.error('Update error:', error);
    },
  });

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const performAutoSave = useCallback(() => {
    if (!autoSave || !isDirty || mode === 'create') return;

    const formData = watch();
    // Convert tags string to array
    const tagsArray = typeof formData.tags === 'string'
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : (formData.tags || []);

    updateMutation.mutate({
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      author: formData.author,
      categoryId: formData.categoryId,
      siteImageId: formData.siteImageId,
      promotionPicId: formData.promotionPicId,
      frontCoverImageUrl: formData.frontCoverImageUrl,
      isPublished: formData.isPublished,
      tags: tagsArray,
    });
  }, [autoSave, isDirty, mode, watch, updateMutation]);

  // Set up auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (isDirty && autoSave && mode === 'edit') {
      autoSaveTimeoutRef.current = setTimeout(performAutoSave, 3000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, autoSave, mode, performAutoSave]);

  // Load article data for edit mode
  useEffect(() => {
    if (article && mode === 'edit') {
      // console.log('Loading article data for edit:', article);
      // console.log('Article content:', article.content);
      reset({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        author: article.author || '',
        categoryId: article.categoryId || '',
        siteImageId: article.siteImageId || '',
        promotionPicId: article.promotionPicId || '',
        frontCoverImageUrl: article.frontCoverImageUrl || '',
        isPublished: article.isPublished || false,
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
      });
      // console.log('Form reset with content:', article.content);
    }
  }, [article, mode, reset]);

  // Word count calculation
  useEffect(() => {
    if (watchedContent) {
      const text = watchedContent.replace(/<[^>]*>/g, '');
      setWordCount(text.length);
    }
  }, [watchedContent]);

  // Handle content changes
  const handleContentChange = useCallback((content: string) => {
    setValue('content', content, { shouldDirty: true });
    setIsDirty(true);
  }, [setValue]);

  // Handle form submission
  const onSubmit = (data: ArticleFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', errors);

    // Convert tags string to array
    const tagsArray = typeof data.tags === 'string'
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : (data.tags || []);

    if (mode === 'create') {
      console.log('Creating article...');
      createMutation.mutate({
        title: data.title,
        summary: data.summary,
        content: data.content,
        author: data.author,
        categoryId: data.categoryId,
        siteImageId: data.siteImageId,
        promotionPicId: data.promotionPicId,
        frontCoverImageUrl: data.frontCoverImageUrl,
        isPublished: data.isPublished || false,
        tags: tagsArray,
      });
    } else {
      console.log('Updating article...');
      updateMutation.mutate({
        title: data.title,
        summary: data.summary,
        content: data.content,
        author: data.author,
        categoryId: data.categoryId,
        siteImageId: data.siteImageId,
        promotionPicId: data.promotionPicId,
        frontCoverImageUrl: data.frontCoverImageUrl,
        isPublished: data.isPublished || false,
        tags: tagsArray,
      });
    }
  };



  // Handle save
  const handleSave = async () => {
    console.log('Save button clicked');
    const formData = getValues();
    console.log('Form data:', formData);
    console.log('Form errors:', errors);

    // Set as draft
    setValue('isPublished', false);

    // Trigger form validation and submission
    const isValid = await trigger();
    console.log('Form is valid:', isValid);

    if (isValid) {
      handleSubmit(onSubmit)();
    } else {
      console.log('Form validation failed:', errors);
      toast.error('Please fix the form errors before saving');
    }
  };

  if (articleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/articles')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Create New Article' : 'Edit Article'}
              </h1>
              {isDirty && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="h-8 w-8 p-0"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="h-8 w-8 p-0"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="h-8 w-8 p-0"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>

              {/* Editor Type Toggle */}
              <Select value={editorType} onValueChange={(value: 'enhanced' | 'real135') => setEditorType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real135">135Editor</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Preview Toggle */}
              <Button
                variant={showPreview ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Edit' : 'Preview'}
              </Button>

              {/* Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>

              {/* Save Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>

                {/* Show validation errors */}
                {Object.keys(errors).length > 0 && (
                  <div className="ml-4 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    Validation errors: {Object.keys(errors).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
              {/* Article Meta */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Enter article title..."
                        className={errors.title ? 'border-red-500' : ''}
                        onChange={(e) => {
                          register('title').onChange(e);
                          setIsDirty(true);
                        }}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        {...register('summary')}
                        placeholder="Brief description of the article..."
                        rows={3}
                        className={errors.summary ? 'border-red-500' : ''}
                        onChange={(e) => {
                          register('summary').onChange(e);
                          setIsDirty(true);
                        }}
                      />
                      {errors.summary && (
                        <p className="text-sm text-red-600 mt-1">{errors.summary.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="author">Author *</Label>
                      <Input
                        id="author"
                        {...register('author')}
                        placeholder="Author name..."
                        className={errors.author ? 'border-red-500' : ''}
                        onChange={(e) => {
                          register('author').onChange(e);
                          setIsDirty(true);
                        }}
                      />
                      {errors.author && (
                        <p className="text-sm text-red-600 mt-1">{errors.author.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="categoryId">Category *</Label>
                      <Select
                        value={watch('categoryId')}
                        onValueChange={(value) => {
                          setValue('categoryId', value);
                          setIsDirty(true);
                        }}
                      >
                        <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(categories) && categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.title || category.name || 'Unnamed Category'}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-categories" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && (
                        <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        {...register('tags')}
                        placeholder="Enter tags separated by commas..."
                        onChange={(e) => {
                          register('tags').onChange(e);
                          setIsDirty(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 bg-white">
                {showPreview ? (
                  /* Preview Mode */
                  <div className="h-full overflow-auto">
                    <div 
                      className="max-w-4xl mx-auto p-8"
                      style={{ 
                        width: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%' 
                      }}
                    >
                      <div className="prose prose-lg max-w-none">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {watchedTitle || 'Article Title'}
                        </h1>
                        {watch('summary') && (
                          <p className="text-lg text-gray-600 mb-8 italic">
                            {watch('summary')}
                          </p>
                        )}
                        <div className="text-sm text-gray-500 mb-8 flex items-center space-x-4">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {watch('author') || 'Author'}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {wordCount} characters
                          </span>
                        </div>
                        <div
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
                    {/* Only render editor after article is loaded in edit mode, or immediately in create mode */}
                    {(mode === 'create' || (mode === 'edit' && article)) ? (
                      editorType === 'real135' ? (
                        <Real135Editor
                          ref={editorRef}
                          content={watchedContent}
                          onChange={handleContentChange}
                          style={{ height: '100%' }}
                          className="h-full"
                          config={{
                            initialFrameHeight: 600,
                            autoHeightEnabled: false,
                            scaleEnabled: false,
                          }}
                        />
                      ) : (
                        <Real135Editor
                          content={watchedContent}
                          onChange={handleContentChange}
                          className="h-full"
                          config={{
                            initialFrameHeight: 600,
                            autoHeightEnabled: false,
                            scaleEnabled: false,
                          }}
                        />
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center border border-gray-300 rounded-md">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading editor...</p>
                        </div>
                      </div>
                    )}
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

          {/* Settings Sidebar */}
          {showSettings && (
            <div className="w-80 bg-white border-l border-gray-200 h-[calc(100vh-4rem)] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Article Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Auto-save */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto-save</Label>
                    <Switch
                      id="auto-save"
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    />
                  </div>

                  {/* Publication Status */}
                  <div>
                    <Label>Publication Status</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={watchedIsPublished}
                          onCheckedChange={(checked) => {
                            setValue('isPublished', checked);
                            setIsDirty(true);
                          }}
                        />
                        <span className="text-sm">
                          {watchedIsPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <Label>Featured Images</Label>
                    <div className="mt-2 space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageSelector(true)}
                        className="w-full"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Images
                      </Button>
                      
                      <div>
                        <Label htmlFor="frontCoverImageUrl" className="text-sm">Cover Image URL</Label>
                        <Input
                          id="frontCoverImageUrl"
                          {...register('frontCoverImageUrl')}
                          placeholder="https://..."
                          className="mt-1"
                          onChange={(e) => {
                            register('frontCoverImageUrl').onChange(e);
                            setIsDirty(true);
                          }}
                        />
                        {errors.frontCoverImageUrl && (
                          <p className="text-xs text-red-600 mt-1">{errors.frontCoverImageUrl.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <Label>Statistics</Label>
                    <div className="mt-2 space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Characters:</span>
                        <span>{wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Words:</span>
                        <span>{Math.ceil(wordCount / 5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reading time:</span>
                        <span>{Math.ceil(wordCount / 1000)} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>



      {/* Image Selector Dialog */}
      {showImageSelector && (
        <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Select Images</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search images..."
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>

              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Image selector will be implemented</p>
                <Button
                  variant="outline"
                  onClick={() => setShowImageSelector(false)}
                  className="mt-4"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CreateUpdateArticle;
