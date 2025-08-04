import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, FileText, Search, X, ExternalLink, Calendar, User, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { articlesApi, categoriesApi, type Article, type ArticleCategory } from '@/api/articles';

interface SourceArticleSelectorProps {
  selectedArticleId?: string;
  onArticleSelect: (articleId: string | undefined, article?: Article) => void;
  onArticleInsert?: (article: Article) => void; // For direct insertion (like editor insertion)
  placeholder?: string;
  className?: string;
  title?: string;
  allowClear?: boolean;
  excludeArticleId?: string; // Exclude current article from selection
  contentOnly?: boolean; // If true, render only the content without Dialog wrapper
}

const SourceArticleSelector: React.FC<SourceArticleSelectorProps> = ({
  selectedArticleId,
  onArticleSelect,
  onArticleInsert,
  placeholder = 'Select source article',
  className,
  title = 'Select Source Article',
  allowClear = true,
  excludeArticleId,
  contentOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [publishedOnly, setPublishedOnly] = useState(true);

  // Fetch articles
  const { data: articlesResponse, isLoading } = useQuery({
    queryKey: ['articles', {
      search: searchTerm,
      category: selectedCategory,
      published: publishedOnly
    }],
    queryFn: () => {
      console.log('Fetching articles with params:', {
        query: searchTerm,
        categoryId: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
        published: publishedOnly,
        limit: 50,
      });
      return articlesApi.getArticles({
        query: searchTerm,
        categoryId: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
        published: publishedOnly,
        limit: 50,
        includeCategory: true,
        includeImages: true,
      });
    },
    enabled: contentOnly || isOpen, // Enable query for contentOnly mode or when dialog is open
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      console.log('Fetching article categories');
      return categoriesApi.getCategories();
    },
    enabled: contentOnly || isOpen, // Enable query for contentOnly mode or when dialog is open
  });

  console.log('SourceArticleSelector state:', {
    contentOnly,
    isOpen,
    queryEnabled: contentOnly || isOpen,
    articlesCount: articlesResponse?.data?.length || 0,
    categoriesCount: categories?.length || 0,
    categoriesLoading,
    categoriesError,
    isLoading
  });



  // Get selected article details
  const { data: selectedArticle } = useQuery({
    queryKey: ['article', selectedArticleId],
    queryFn: () => articlesApi.getArticle(selectedArticleId!),
    enabled: !!selectedArticleId,
  });

  // Filter out current article if excludeArticleId is provided
  const articles = (articlesResponse?.data || []).filter(
    article => article.id !== excludeArticleId
  );

  const handleArticleSelect = (article: Article, event?: React.MouseEvent) => {
    // Prevent form submission and event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Article selected:', { article, onArticleInsert: !!onArticleInsert });

    if (onArticleInsert) {
      // For insertion mode (like editor insertion)
      onArticleInsert(article);
    } else {
      // For selection mode (like form field)
      onArticleSelect(article.id, article);
    }
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onArticleSelect(undefined);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Extract the content part for reuse
  const renderContent = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {categories.length > 0 && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={publishedOnly ? 'published' : 'all'} onValueChange={(value) => setPublishedOnly(value === 'published')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles List */}
      <div className="overflow-y-auto max-h-[60vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <FileText className="h-12 w-12 mb-2" />
            <p>No articles found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className={cn(
                  'relative group cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md',
                  selectedArticleId === article.id
                    ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={(e) => handleArticleSelect(article, e)}
              >
                <div className="flex items-start gap-3">
                  {/* Article thumbnail or icon */}
                  <div className="flex-shrink-0">
                    {article.coverImage?.url ? (
                      <img
                        src={article.coverImage.url}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Article details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                      {article.title}
                    </h3>

                    {article.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {truncateText(article.summary, 120)}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </span>

                      {article.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.viewCount || 0}
                      </span>

                      {article.category && (
                        <Badge variant="secondary" className="text-xs">
                          {article.category.name}
                        </Badge>
                      )}
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 mt-2">
                      {article.isPublished ? (
                        <Badge variant="default" className="text-xs">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Draft
                        </Badge>
                      )}

                      {article.wechatUrl && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          WeChat
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedArticleId === article.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // If contentOnly mode, return just the content
  if (contentOnly) {
    return renderContent();
  }

  // Otherwise, return the full component with Dialog
  return (
    <div className={cn('space-y-2', className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start gap-2 min-h-[80px]"
            type="button"
          >
            {selectedArticle ? (
              <>
                <div className="flex items-start gap-3 w-full">
                  <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {selectedArticle.title}
                    </h4>
                    {selectedArticle.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {selectedArticle.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedArticle.author}
                      </span>
                      {selectedArticle.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(selectedArticle.publishedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {selectedArticle.viewCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <FileText className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">{placeholder}</span>
              </>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden z-[9999]" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>

      {/* Clear selection button */}
      {selectedArticleId && allowClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearSelection}
          className="w-full flex items-center gap-2"
          type="button"
        >
          <X className="h-4 w-4" />
          Clear Selection
        </Button>
      )}
    </div>
  );
};

export default SourceArticleSelector;
