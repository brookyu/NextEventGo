import { useState } from 'react'
import { Edit, Trash2, Download, Eye, Calendar } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Image, ImageCategory } from '@/types/images'

interface ImageGalleryProps {
  images: Image[]
  categories: ImageCategory[]
  viewMode: 'grid' | 'list'
  isLoading: boolean
  onRefresh: () => void
}

export function ImageGallery({ 
  images, 
  categories, 
  viewMode, 
  isLoading,
  onRefresh 
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  const handleImageClick = (image: Image) => {
    setSelectedImage(image)
  }

  const handleDownload = (image: Image) => {
    // Create a temporary link to download the image
    const link = document.createElement('a')
    link.href = image.siteUrl
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground mb-4">
              Upload some images to get started or adjust your search filters.
            </p>
            <Button onClick={onRefresh}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={image.siteUrl}
                alt={image.name}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => handleImageClick(image)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleImageClick(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate mb-1">{image.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {getCategoryName(image.categoryId)}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(image.createdAt), 'MMM d, yyyy')}
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // List view
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow key={image.id}>
              <TableCell>
                <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                  <img
                    src={image.siteUrl}
                    alt={image.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleImageClick(image)}
                    loading="lazy"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{image.name}</TableCell>
              <TableCell>{getCategoryName(image.categoryId)}</TableCell>
              <TableCell>{format(new Date(image.createdAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
