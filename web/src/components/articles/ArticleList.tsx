import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { articlesApi, categoriesApi, type Article, type Category, type ArticleListParams } from '@/api/articles';

const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const pageSize = 20;

  // Build query parameters
  const queryParams: ArticleListParams = {
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    isPublished: publishedFilter === 'published' ? true : publishedFilter === 'draft' ? false : undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
    includeCategory: true,
    includeImages: true,
  };

  // Fetch articles
  const { data: articlesResponse, isLoading } = useQuery({
    queryKey: ['articles', queryParams],
    queryFn: () => articlesApi.getArticles(queryParams),
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesApi.deleteArticle(id),
    onSuccess: () => {
      toast.success('Article deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete article');
    },
  });

  // Publish/unpublish mutations
  const publishMutation = useMutation({
    mutationFn: (id: string) => articlesApi.publishArticle(id),
    onSuccess: () => {
      toast.success('Article published successfully');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: () => {
      toast.error('Failed to publish article');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => articlesApi.unpublishArticle(id),
    onSuccess: () => {
      toast.success('Article unpublished successfully');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: () => {
      toast.error('Failed to unpublish article');
    },
  });

  const articles = articlesResponse?.data || [];
  const pagination = articlesResponse?.pagination;

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete.id);
    }
  };

  const handlePublishToggle = (article: Article) => {
    if (article.isPublished) {
      unpublishMutation.mutate(article.id);
    } else {
      publishMutation.mutate(article.id);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPublishedFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-gray-600 mt-1">
            Manage your articles and content
          </p>
        </div>
        <Button
          onClick={() => navigate('/articles/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Stats Cards */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(a => a.isPublished).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(a => !a.isPublished).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.reduce((sum, article) => sum + article.viewCount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="view_count-desc">Most Viewed</SelectItem>
                <SelectItem value="read_count-desc">Most Read</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <BookOpen className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-sm mb-4">Get started by creating your first article</p>
              <Button onClick={() => navigate('/articles/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Reads</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {article.coverImage && (
                          <img
                            src={article.coverImage.url}
                            alt={article.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{article.title}</div>
                          {article.summary && (
                            <div className="text-sm text-gray-500 truncate max-w-[300px]">
                              {article.summary}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.category && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {article.category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {article.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        {article.viewCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        {article.readCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.createdAt).toLocaleDateString()}
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
                            onClick={() => navigate(`/articles/${article.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/articles/${article.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePublishToggle(article)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {article.isPublished ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(article)}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} articles
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArticleList;
