import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Calendar,
  User,
  Eye,
  BookOpen,
  Share2,
  ArrowLeft,
  Tag,
  Clock,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import RichTextEditor from './RichTextEditor';
import { articlesApi, createTrackingData, type Article } from '@/api/articles';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [readStartTime, setReadStartTime] = useState<Date | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasTrackedRead, setHasTrackedRead] = useState(false);

  // Fetch article
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['public-article', id],
    queryFn: () => articlesApi.getPublishedArticle(id!),
    enabled: !!id,
  });

  // Track view mutation
  const trackViewMutation = useMutation({
    mutationFn: (data: any) => articlesApi.trackView(id!, data),
    onError: (error) => {
      console.error('Failed to track view:', error);
    },
  });

  // Track read mutation
  const trackReadMutation = useMutation({
    mutationFn: (data: any) => articlesApi.trackRead(id!, data),
    onError: (error) => {
      console.error('Failed to track read:', error);
    },
  });

  // Track view on component mount
  useEffect(() => {
    if (article && !hasTrackedView) {
      const trackingData = createTrackingData();
      trackViewMutation.mutate(trackingData);
      setHasTrackedView(true);
      setReadStartTime(new Date());
    }
  }, [article, hasTrackedView, trackViewMutation]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = element.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
      
      setReadingProgress(progress);

      // Track read completion when user reaches 80% of the article
      if (progress >= 80 && !hasTrackedRead && readStartTime) {
        const readDuration = Math.floor((Date.now() - readStartTime.getTime()) / 1000);
        const trackingData = createTrackingData({
          readDuration,
          readPercentage: progress,
          scrollDepth: progress,
        });
        
        trackReadMutation.mutate(trackingData);
        setHasTrackedRead(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasTrackedRead, readStartTime, trackReadMutation]);

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || 'Article';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            {/* Category */}
            {article.category && (
              <div className="mb-4">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Tag className="h-3 w-3" />
                  {article.category.name}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Summary */}
            {article.summary && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* Cover Image */}
            {article.frontCoverImageUrl && (
              <div className="mb-6">
                <img
                  src={article.frontCoverImageUrl}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>By {article.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Published {new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount.toLocaleString()} views</span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{article.readCount.toLocaleString()} reads</span>
              </div>

              {article.readCount > 0 && article.viewCount > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{Math.round((article.readCount / article.viewCount) * 100)}% completion rate</span>
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Article
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <div ref={contentRef} className="bg-white rounded-lg shadow-sm p-8">
            <RichTextEditor
              content={article.content}
              onChange={() => {}}
              editable={false}
              className="border-none shadow-none"
            />
          </div>

          {/* Article Footer */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Written by <strong>{article.author}</strong></span>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {article.category && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag className="h-4 w-4" />
                  <span>Filed under</span>
                  <Badge variant="outline">{article.category.name}</Badge>
                </div>
              </>
            )}
          </div>

          {/* Related Articles Placeholder */}
          <Card className="mt-6">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
              <p className="text-gray-500">
                Related articles feature coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleViewer;
