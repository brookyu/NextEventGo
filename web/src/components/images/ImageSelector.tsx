import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Image as ImageIcon, Upload, X } from 'lucide-react';

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

import { imagesApi, type SiteImage } from '@/api/images';

interface ImageSelectorProps {
  selectedImageId?: string;
  onImageSelect: (imageId: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  selectedImageId,
  onImageSelect,
  placeholder = 'Select an image',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch images
  const { data: imagesResponse, isLoading } = useQuery({
    queryKey: ['images', { search: searchTerm }],
    queryFn: () => imagesApi.getImages({ 
      search: searchTerm,
      pageSize: 20,
    }),
  });

  // Get selected image details
  const { data: selectedImage } = useQuery({
    queryKey: ['image', selectedImageId],
    queryFn: () => imagesApi.getImage(selectedImageId!),
    enabled: !!selectedImageId,
  });

  const images = imagesResponse?.data || [];

  const handleImageSelect = (image: SiteImage) => {
    onImageSelect(image.id);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onImageSelect(undefined);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-center gap-2"
          >
            {selectedImage ? (
              <>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="w-full h-32 object-cover rounded"
                />
                <span className="text-sm font-medium">{selectedImage.name}</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">{placeholder}</span>
              </>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </div>

            {/* Images Grid */}
            <div className="overflow-y-auto max-h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p>No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={cn(
                        'relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                        selectedImageId === image.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => handleImageSelect(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-24 object-cover"
                      />
                      
                      {/* Selection indicator */}
                      {selectedImageId === image.id && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {/* Image info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs truncate">{image.name}</p>
                        <div className="flex gap-1 mt-1">
                          {image.category && (
                            <Badge variant="secondary" className="text-xs">
                              {image.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear selection button */}
      {selectedImageId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearSelection}
          className="w-full flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear Selection
        </Button>
      )}
    </div>
  );
};

export default ImageSelector;
