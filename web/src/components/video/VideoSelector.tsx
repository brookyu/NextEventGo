import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Video as VideoIcon, Upload, X, Plus, Search, Play, Clock, Eye } from 'lucide-react';

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

import { videosApi, type VideoItem, type VideoCategory } from '@/api/videos';

export type VideoSelectorMode = 'single' | 'insert' | 'inline';

interface VideoSelectorProps {
  selectedVideoId?: string;
  onVideoSelect: (videoId: string | undefined, video?: VideoItem) => void;
  onVideoInsert?: (video: VideoItem) => void; // For 135editor insertion
  placeholder?: string;
  className?: string;
  mode?: VideoSelectorMode;
  title?: string;
  showUpload?: boolean;
  showPreview?: boolean;
  allowClear?: boolean;
  contentOnly?: boolean; // If true, render only the content without Dialog wrapper
}

const VideoSelector: React.FC<VideoSelectorProps> = ({
  selectedVideoId,
  onVideoSelect,
  onVideoInsert,
  placeholder = 'Select a video',
  className,
  mode = 'single',
  title,
  showUpload = true,
  showPreview = true,
  allowClear = true,
  contentOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch videos
  const { data: videosResponse, isLoading } = useQuery({
    queryKey: ['videos', { search: searchTerm, category: selectedCategory }],
    queryFn: () => {
      console.log('Fetching videos with params:', {
        search: searchTerm,
        categoryId: selectedCategory || undefined,
        pageSize: mode === 'insert' ? 50 : 20,
        includeCategory: true,
      });
      return videosApi.getVideos({
        search: searchTerm,
        categoryId: selectedCategory || undefined,
        pageSize: mode === 'insert' ? 50 : 20,
        includeCategory: true,
      });
    },
    enabled: contentOnly || isOpen, // Enable query for contentOnly mode or when dialog is open
  });

  console.log('VideoSelector state:', {
    contentOnly,
    isOpen,
    mode,
    queryEnabled: contentOnly || isOpen,
    videosCount: videosResponse?.data?.length || 0,
    isLoading
  });

  // Fetch video categories
  const { data: categories = [] } = useQuery({
    queryKey: ['video-categories'],
    queryFn: () => videosApi.getVideoCategories(),
  });

  // Get selected video details
  const { data: selectedVideo } = useQuery({
    queryKey: ['video', selectedVideoId],
    queryFn: () => videosApi.getVideo(selectedVideoId!),
    enabled: !!selectedVideoId,
  });

  const videos = videosResponse?.data || [];

  const handleVideoSelect = (video: VideoItem, event?: React.MouseEvent) => {
    // Prevent form submission and event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Video selected:', { video, mode, onVideoInsert: !!onVideoInsert });

    if (mode === 'insert' && onVideoInsert) {
      // For insert mode, call the insert handler and keep dialog open
      onVideoInsert(video);
    } else if (contentOnly && onVideoInsert) {
      // For contentOnly mode, also use insert handler
      onVideoInsert(video);
    } else {
      // For selection modes, update selection and close dialog
      onVideoSelect(video.id, video);
      setIsOpen(false);
    }
  };

  const handleClearSelection = () => {
    onVideoSelect(undefined);
  };

  const getDialogTitle = () => {
    if (title) return title;
    switch (mode) {
      case 'insert': return 'Insert Video';
      case 'inline': return 'Select Inline Video';
      default: return 'Select Video';
    }
  };

  const getPlaceholderText = () => {
    switch (mode) {
      case 'insert': return 'Click to insert video';
      case 'inline': return 'Select inline video';
      default: return placeholder;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Extract the content part for reuse
  const renderContent = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search videos..."
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
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showUpload && (
          <Button variant="outline" size="sm" type="button">
            <Upload className="h-4 w-4 mr-2" />
            Upload New
          </Button>
        )}
      </div>

      {/* Videos Grid */}
      <div className={cn(
        "overflow-y-auto",
        mode === 'insert' ? "max-h-[60vh]" : "max-h-96"
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <VideoIcon className="h-12 w-12 mb-2" />
            <p>No videos found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            mode === 'insert'
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {videos.map((video) => (
              <div
                key={video.id}
                className={cn(
                  'group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                  selectedVideoId === video.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={(e) => handleVideoSelect(video, e)}
              >
                <div className="relative aspect-video bg-gray-100">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <VideoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-gray-800" />
                    </div>
                  </div>

                  {/* Duration */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Selection indicator */}
                  {selectedVideoId === video.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Video info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{video.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    {video.viewCount && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.viewCount}
                      </span>
                    )}
                    {video.fileSize && (
                      <span>{formatFileSize(video.fileSize)}</span>
                    )}
                  </div>
                  {video.category && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      {video.category.name}
                    </Badge>
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
          {mode === 'insert' ? (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              type="button"
            >
              <VideoIcon className="h-4 w-4" />
              {getPlaceholderText()}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 min-h-[120px]"
              type="button"
            >
              {selectedVideo && showPreview ? (
                <>
                  <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                    {selectedVideo.thumbnailUrl ? (
                      <img
                        src={selectedVideo.thumbnailUrl}
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <VideoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {selectedVideo.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(selectedVideo.duration)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate w-full text-center">
                    {selectedVideo.title}
                  </span>
                </>
              ) : (
                <>
                  <VideoIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">{getPlaceholderText()}</span>
                </>
              )}
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className={cn(
          "max-h-[80vh] overflow-hidden z-[9999]",
          mode === 'insert' ? "max-w-6xl" : "max-w-5xl"
        )} style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>

      {/* Clear selection button */}
      {selectedVideoId && allowClear && mode !== 'insert' && (
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

export default VideoSelector;
