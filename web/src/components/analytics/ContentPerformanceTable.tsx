import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  Tag,
  ExternalLink,
  MoreHorizontal,
  ArrowUpDown,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { type ContentPerformance, type CategoryStats, type AuthorStats, formatAnalyticsNumber, formatReadingTime } from '@/api/analytics';

interface ContentPerformanceTableProps {
  data?: ContentPerformance[];
  isLoading: boolean;
  categoryStats?: CategoryStats[];
  authorStats?: AuthorStats[];
}

type SortField = 'title' | 'views' | 'reads' | 'avgReadDuration' | 'engagementScore' | 'shareCount';
type SortOrder = 'asc' | 'desc';

const ContentPerformanceTable: React.FC<ContentPerformanceTableProps> = ({
  data = [],
  isLoading,
  categoryStats = [],
  authorStats = [],
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sort and filter data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [data, sortField, sortOrder, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? 
      <TrendingUp className="h-4 w-4" /> : 
      <TrendingDown className="h-4 w-4" />;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category and Author Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.slice(0, 5).map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="font-medium">{category.categoryName}</div>
                      <div className="text-sm text-gray-500">
                        {category.articleCount} articles
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatAnalyticsNumber(category.totalViews)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(category.readingRate * 100)}% completion
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Author Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Author Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {authorStats.slice(0, 5).map((author) => (
                <div key={author.author} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{author.author}</div>
                    <div className="text-sm text-gray-500">
                      {author.publishedCount} published, {author.draftCount} drafts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatAnalyticsNumber(author.totalViews)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatReadingTime(author.avgReadTime)} avg read
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Content Performance
            </CardTitle>
            
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryStats.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {processedData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No content data available</p>
                <p className="text-sm">Content performance will appear here once you have published articles</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Article
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('views')}
                  >
                    <div className="flex items-center gap-2">
                      Views
                      {getSortIcon('views')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('reads')}
                  >
                    <div className="flex items-center gap-2">
                      Reads
                      {getSortIcon('reads')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('avgReadDuration')}
                  >
                    <div className="flex items-center gap-2">
                      Avg Read Time
                      {getSortIcon('avgReadDuration')}
                    </div>
                  </TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('engagementScore')}
                  >
                    <div className="flex items-center gap-2">
                      Engagement
                      {getSortIcon('engagementScore')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('shareCount')}
                  >
                    <div className="flex items-center gap-2">
                      Shares
                      {getSortIcon('shareCount')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.map((article) => {
                  const completionRate = article.views > 0 ? (article.reads / article.views) * 100 : 0;
                  
                  return (
                    <TableRow key={article.articleId} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{article.title}</div>
                          <div className="text-sm text-gray-500">
                            {article.wordCount} words • {Math.ceil(article.readingTime)} min read
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          {formatAnalyticsNumber(article.views)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          {formatAnalyticsNumber(article.reads)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatReadingTime(article.avgReadDuration)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{completionRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getEngagementColor(article.engagementScore)}
                        >
                          {getEngagementLabel(article.engagementScore)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          {article.shareCount}
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
                              onClick={() => navigate(`/articles/${article.articleId}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Article
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/articles/${article.articleId}/edit`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Edit Article
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/analytics/articles/${article.articleId}`)}
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Detailed Analytics
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
    </div>
  );
};

export default ContentPerformanceTable;
