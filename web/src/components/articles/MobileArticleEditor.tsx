import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Upload, Image, Type, Bold, Italic, List, Link2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Real135Editor from './Real135Editor'

interface Article {
  id?: string
  title: string
  content: string
  summary: string
  author: string
  categoryId: string
  tags: string
}

interface Category {
  id: string
  title: string
}

export default function MobileArticleEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)

  const [article, setArticle] = useState<Article>({
    title: '',
    content: '',
    summary: '',
    author: '',
    categoryId: '',
    tags: ''
  })

  // Debug article state changes
  useEffect(() => {
    console.log('Article state updated:', article);
  }, [article]);
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    fetchCategories()
    if (isEditing && id) {
      fetchArticle(id)
    }
  }, [isEditing, id])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v2/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/v2/articles/${articleId}`)
      if (response.ok) {
        const data = await response.json()
        setArticle({
          id: data.id,
          title: data.title || '',
          content: data.content || '',
          summary: data.summary || '',
          author: data.author || '',
          categoryId: data.categoryId || '',
          tags: data.tags || ''
        })
      }
    } catch (err) {
      console.error('Failed to load article:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (publish = false) => {
    console.log('Attempting to save article:', article);
    console.log('Title value:', article.title);
    console.log('Title trimmed:', article.title.trim());
    console.log('Title length:', article.title.trim().length);

    if (!article.title.trim()) {
      alert('Please enter article title (请输入文章标题)')
      return
    }

    if (!article.author.trim()) {
      alert('Please enter author name (请输入作者姓名)')
      return
    }

    if (!article.categoryId) {
      alert('Please select a category (请选择分类)')
      return
    }

    if (!article.content.trim()) {
      alert('Please enter article content (请输入文章内容)')
      return
    }

    try {
      setSaving(true)
      const articleData = {
        ...article
      }

      const url = isEditing 
        ? `http://localhost:8080/api/v2/articles/${id}`
        : 'http://localhost:8080/api/v2/articles'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      })

      if (response.ok) {
        const savedArticle = await response.json()
        alert(publish ? '文章已发布' : '文章已保存为草稿')
        navigate(`/articles/${savedArticle.id}`)
      } else {
        throw new Error('保存失败')
      }
    } catch (err) {
      alert('保存失败，请重试')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-900">
            {isEditing ? '编辑文章' : '创建文章'}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'edit'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        {activeTab === 'edit' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-4"
          >
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="文章标题"
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                className="w-full text-xl font-bold border-none outline-none placeholder-gray-400 bg-transparent"
                style={{ fontSize: '20px', lineHeight: '1.3' }}
              />
            </div>

            {/* Summary */}
            <div>
              <textarea
                placeholder="文章摘要（可选）"
                value={article.summary}
                onChange={(e) => setArticle({ ...article, summary: e.target.value })}
                className="w-full h-20 border border-gray-200 rounded-lg p-3 text-sm resize-none"
              />
            </div>

            {/* Meta Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={article.categoryId}
                  onChange={(e) => setArticle({ ...article, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                  <input
                    type="text"
                    placeholder="作者姓名"
                    value={article.author}
                    onChange={(e) => setArticle({ ...article, author: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input
                    type="text"
                    placeholder="标签（用逗号分隔）"
                    value={article.tags}
                    onChange={(e) => setArticle({ ...article, tags: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Real 135Editor */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Real135Editor
                content={article.content}
                onChange={(content) => setArticle({ ...article, content })}
                className="min-h-96"
                config={{
                  initialFrameHeight: 400,
                  autoHeightEnabled: false,
                  scaleEnabled: false,
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            {/* Preview */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {article.title || '文章标题'}
              </h1>
              {article.summary && (
                <p className="text-gray-600 text-sm mb-2">{article.summary}</p>
              )}
              <div className="text-xs text-gray-500">
                作者: {article.author || '未设置'} | 分类: {
                  categories.find(c => c.id === article.categoryId)?.title || '未设置'
                }
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none"
              style={{
                fontSize: '17px',
                lineHeight: '1.6',
                color: 'rgba(0, 0, 0, 0.9)',
                textAlign: 'justify'
              }}
              dangerouslySetInnerHTML={{
                __html: article.content || '<p class="text-gray-400">暂无内容</p>'
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between space-x-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? '发布中...' : '发布文章'}
          </button>
        </div>
      </div>
    </div>
  )
}
