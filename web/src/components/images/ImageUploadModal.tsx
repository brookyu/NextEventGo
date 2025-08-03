import { useState, useCallback } from 'react'
import { X, Upload, Check, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { images } from '@/api/images'
import type { ImageCategory, ImageUploadProgress } from '@/types/images'

interface ImageUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  categories: ImageCategory[]
}

export function ImageUploadModal({ 
  open, 
  onClose, 
  onSuccess, 
  categories 
}: ImageUploadModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [uploads, setUploads] = useState<ImageUploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )

    if (files.length > 0) {
      const newUploads: ImageUploadProgress[] = files.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }))
      setUploads(prev => [...prev, ...newUploads])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )

    if (files.length > 0) {
      const newUploads: ImageUploadProgress[] = files.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }))
      setUploads(prev => [...prev, ...newUploads])
    }
  }

  const handleUpload = async () => {
    if (!selectedCategoryId) {
      alert('Please select a category')
      return
    }

    setIsUploading(true)

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i]
      if (upload.status !== 'pending') continue

      try {
        // Update status to uploading
        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, status: 'uploading' as const, progress: 0 } : u
        ))

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map((u, idx) => 
            idx === i && u.status === 'uploading' 
              ? { ...u, progress: Math.min(u.progress + 10, 90) } 
              : u
          ))
        }, 100)

        // Upload the image
        const result = await images.upload(upload.file, selectedCategoryId)

        clearInterval(progressInterval)

        // Update status to success
        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { 
            ...u, 
            status: 'success' as const, 
            progress: 100,
            result: result.data 
          } : u
        ))

      } catch (error) {
        // Update status to error
        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { 
            ...u, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : u
        ))
      }
    }

    setIsUploading(false)

    // Check if all uploads were successful
    const allSuccessful = uploads.every(u => u.status === 'success')
    if (allSuccessful) {
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1000)
    }
  }

  const handleClose = () => {
    setUploads([])
    setSelectedCategoryId('')
    setIsUploading(false)
    onClose()
  }

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Upload multiple images to your library
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: JPEG, PNG, GIF, WebP (max 10MB each)
            </p>
          </div>

          {/* Upload Queue */}
          {uploads.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="font-medium">Upload Queue ({uploads.length})</h4>
              {uploads.map((upload, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {upload.status === 'uploading' && (
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {upload.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {upload.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    )}
                    {upload.status === 'success' && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploads.length === 0 || !selectedCategoryId || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${uploads.length} Images`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
