import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Calendar, User, Search, Filter, Plus, Download, Eye, Edit, Grid, List, Upload, Trash2 } from 'lucide-react'

interface Image {
  id: string
  title: string
  description?: string
  url?: string
  thumbnail?: string
  alt_text?: string
  created_at?: string
  updated_at?: string
  author?: string
  size?: string
  format?: string
  width?: number
  height?: number
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadResults, setUploadResults] = useState<{success: string[], failed: string[]}>({success: [], failed: []})

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalImages, setTotalImages] = useState(0)

  // Category filter state
  const [categories, setCategories] = useState<Array<{id: string, title: string, type: number}>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Statistics state
  const [stats, setStats] = useState({
    total_images: 0,
    this_month: 0,
    total_categories: 0,
    total_views: 0
  })

  useEffect(() => {
    fetchCategories()
    fetchImages()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchImages()
    fetchStats()
  }, [currentPage, pageSize, selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v2/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
      // Don't show error for categories as it's not critical
    }
  }

  const fetchStats = async () => {
    try {
      let url = 'http://localhost:8080/api/v2/images/stats'

      // Add category filter if selected
      if (selectedCategory) {
        url += `?category=${selectedCategory}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load statistics:', err)
      // Don't show error for stats as it's not critical
    }
  }

  const fetchImages = async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * pageSize
      let url = `http://localhost:8080/api/v2/images?limit=${pageSize}&offset=${offset}`

      // Add category filter if selected
      if (selectedCategory) {
        url += `&category=${selectedCategory}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      const data = await response.json()
      setImages(data.data || [])
      setTotalImages(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(image =>
    image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Use statistics from API (already filtered by category if selected)
  const currentStats = {
    totalImages: stats.total_images,
    thisMonth: stats.this_month,
    categories: stats.total_categories,
    totalViews: stats.total_views
  }

  const handleImagePreview = (image: Image) => {
    setSelectedImage(image)
    setShowPreview(true)
  }

  const handleDownloadImage = (image: Image) => {
    if (image.url) {
      const link = document.createElement('a')
      link.href = image.url
      link.download = image.title || 'image'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDeleteImage = (image: Image) => {
    setImageToDelete(image)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!imageToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`http://localhost:8080/api/v2/images/${imageToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Remove image from local state
      setImages(images.filter(img => img.id !== imageToDelete.id))
      setTotalImages(totalImages - 1)

      // Close modals
      setShowDeleteConfirm(false)
      setImageToDelete(null)

      // If this was the last image on the page and we're not on page 1, go to previous page
      if (images.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Refresh the current page
        fetchImages()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    // Filter files by size (5MB limit for WeChat integration)
    const validFiles: File[] = []
    const oversizedFiles: string[] = []

    Array.from(files).forEach(file => {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        validFiles.push(file)
      } else {
        oversizedFiles.push(file.name)
      }
    })

    if (oversizedFiles.length > 0) {
      alert(`The following files exceed 5MB limit and will not be uploaded:\n${oversizedFiles.join('\n')}`)
    }

    if (validFiles.length > 0) {
      const fileList = new DataTransfer()
      validFiles.forEach(file => fileList.items.add(file))
      setSelectedFiles(fileList.files)
    }
  }

  const uploadImages = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress({})
    setUploadResults({success: [], failed: []})

    const results = {success: [] as string[], failed: [] as string[]}

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', selectedCategory || '')

      try {
        setUploadProgress(prev => ({...prev, [file.name]: 0}))

        const response = await fetch('http://localhost:8080/api/v2/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        results.success.push(file.name)
        setUploadProgress(prev => ({...prev, [file.name]: 100}))

      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error)
        results.failed.push(file.name)
        setUploadProgress(prev => ({...prev, [file.name]: -1})) // -1 indicates error
      }
    }

    setUploadResults(results)
    setUploading(false)

    // Refresh images list if any uploads succeeded
    if (results.success.length > 0) {
      fetchImages()
    }

    // Show results
    if (results.success.length > 0 && results.failed.length === 0) {
      alert(`Successfully uploaded ${results.success.length} image(s)`)
      setShowUpload(false)
      setSelectedFiles(null)
    } else if (results.failed.length > 0) {
      alert(`Upload completed:\n✓ Success: ${results.success.length}\n✗ Failed: ${results.failed.length}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchImages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Images</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your image library and media assets
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="inline-flex items-center">
          <Filter className="w-4 h-4 mr-2 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1) // Reset to first page when filtering
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {selectedCategory ? 'Category Images' : 'Total Images'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{currentStats.totalImages}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">{currentStats.thisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Categories</dt>
                  <dd className="text-lg font-medium text-gray-900">{currentStats.categories}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {currentStats.totalViews > 0 ? currentStats.totalViews.toLocaleString() : '-'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by uploading your first image'}
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {image.url || image.thumbnail ? (
                  <img
                    src={image.url || image.thumbnail}
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleImagePreview(image)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDownloadImage(image)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {image.title || 'Untitled Image'}
                </h3>
                {image.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {image.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {image.author || 'Unknown'}
                  </div>
                  {image.format && (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800">
                      {image.format}
                    </span>
                  )}
                </div>
                {(image.width && image.height) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {image.width} × {image.height}
                    {image.size && ` • ${image.size}`}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredImages.map((image, index) => (
              <motion.li
                key={image.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        {image.url || image.thumbnail ? (
                          <img
                            src={image.url || image.thumbnail}
                            alt={image.alt_text || image.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {image.title || 'Untitled Image'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span className="mr-4">{image.author || 'Unknown Author'}</span>
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>
                            {image.created_at
                              ? new Date(image.created_at).toLocaleDateString()
                              : 'No date'
                            }
                          </span>
                          {image.format && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {image.format}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleImagePreview(image)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadImage(image)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination Controls */}
      {totalImages > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(totalImages / pageSize), currentPage + 1))}
              disabled={currentPage >= Math.ceil(totalImages / pageSize)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalImages)}</span>
                {' '}to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalImages)}</span>
                {' '}of{' '}
                <span className="font-medium">{totalImages}</span>
                {' '}results
              </p>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="ml-4 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(totalImages / pageSize)) }, (_, i) => {
                  const totalPages = Math.ceil(totalImages / pageSize)
                  let pageNumber

                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(totalImages / pageSize), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(totalImages / pageSize)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && imageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Image</h3>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{imageToDelete.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setImageToDelete(null)
                  }}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Upload Images</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload your images</p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop your files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>

              {/* Selected Files Display */}
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                        {uploadProgress[file.name] !== undefined && (
                          <div className="ml-2">
                            {uploadProgress[file.name] === -1 ? (
                              <span className="text-red-500">✗</span>
                            ) : uploadProgress[file.name] === 100 ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <span className="text-blue-500">{uploadProgress[file.name]}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                <p>Supported formats: JPEG, PNG, GIF</p>
                <p>Maximum file size: 5MB per file (for WeChat integration)</p>
                <p>Files under 5MB will be automatically uploaded to WeChat Media API</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={uploadImages}
                disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles?.length || 0} File(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedImage.title || 'Image Preview'}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <img
                    src={selectedImage.url || selectedImage.thumbnail}
                    alt={selectedImage.alt_text || selectedImage.title}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                </div>
                <div className="lg:w-80 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                    <dl className="space-y-2 text-sm">
                      {selectedImage.description && (
                        <>
                          <dt className="font-medium text-gray-500">Description</dt>
                          <dd className="text-gray-900">{selectedImage.description}</dd>
                        </>
                      )}
                      {selectedImage.author && (
                        <>
                          <dt className="font-medium text-gray-500">Author</dt>
                          <dd className="text-gray-900">{selectedImage.author}</dd>
                        </>
                      )}
                      {selectedImage.created_at && (
                        <>
                          <dt className="font-medium text-gray-500">Created</dt>
                          <dd className="text-gray-900">
                            {new Date(selectedImage.created_at).toLocaleDateString()}
                          </dd>
                        </>
                      )}
                      {(selectedImage.width && selectedImage.height) && (
                        <>
                          <dt className="font-medium text-gray-500">Dimensions</dt>
                          <dd className="text-gray-900">
                            {selectedImage.width} × {selectedImage.height}
                          </dd>
                        </>
                      )}
                      {selectedImage.format && (
                        <>
                          <dt className="font-medium text-gray-500">Format</dt>
                          <dd className="text-gray-900">{selectedImage.format}</dd>
                        </>
                      )}
                      {selectedImage.size && (
                        <>
                          <dt className="font-medium text-gray-500">Size</dt>
                          <dd className="text-gray-900">{selectedImage.size}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadImage(selectedImage)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
