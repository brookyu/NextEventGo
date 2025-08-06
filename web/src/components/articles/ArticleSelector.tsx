import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, FileText, Search, X } from 'lucide-react';

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

import { articlesApi, type Article } from '@/api/articles';

interface ArticleSelectorProps {
  selectedArticleId?: string;
  selectedArticleTitle?: string;
  onArticleSelect: (articleId: string | undefined, article?: Article) => void;
  placeholder?: string;
  className?: string;
  title?: string;
  allowClear?: boolean;
}

const ArticleSelector: React.FC<ArticleSelectorProps> = ({
  selectedArticleId,
  selectedArticleTitle,
  onArticleSelect,
  placeholder = 'Select article',
  className,
  title = 'Select Article',
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch articles
  const { data: articlesResponse, isLoading } = useQuery({
    queryKey: ['articles', { search: searchTerm, published: true }],
    queryFn: () => {
      return articlesApi.getArticles({
        query: searchTerm,
        published: true,
        limit: 50,
        includeCategory: true,
      });
    },
    enabled: isOpen,
  });

  const articles = articlesResponse?.data || [];

  const handleArticleSelect = (article: Article) => {
    onArticleSelect(article.id, article);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onArticleSelect(undefined);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start gap-2 min-h-[80px]"
            type="button"
          >
            {selectedArticleId && selectedArticleTitle ? (
              <>
                <div className="flex items-start gap-3 w-full">
                  <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {selectedArticleTitle}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  </div>
                </div>
                {allowClear && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClearSelection();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 w-full text-gray-500">
                <FileText className="h-5 w-5" />
                <span className="text-sm">{placeholder}</span>
              </div>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No articles found</p>
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
                      onClick={() => handleArticleSelect(article)}
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

                        {/* Article info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          
                          {article.summary && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {article.summary}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {article.publishedAt && (
                              <span>Published: {formatDate(article.publishedAt)}</span>
                            )}
                            {article.category && (
                              <Badge variant="outline" className="text-xs">
                                {article.category.name}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {selectedArticleId === article.id && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-blue-500 text-white rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleSelector;
