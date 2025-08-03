import React, { useState, useEffect, useRef } from 'react'
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image, Video, Palette, Type, Minus,
  Undo, Redo, Eye, Copy, Smartphone, Monitor, Tablet
} from 'lucide-react'
import './Enhanced135Editor.css'

interface Enhanced135EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

interface StyleTemplate {
  id: string
  name: string
  category: string
  html: string
  thumbnail: string
}

export default function Enhanced135Editor({ 
  content, 
  onChange, 
  placeholder = "开始创作...",
  className = ""
}: Enhanced135EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [fontSize, setFontSize] = useState('17')
  const [lineHeight, setLineHeight] = useState('1.6')
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')

  // 135Editor style templates (simplified examples)
  const styleTemplates: StyleTemplate[] = [
    {
      id: '1',
      name: '标题样式1',
      category: '标题',
      html: `<section style="margin: 10px auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; text-align: center;">
        <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">在此输入标题</p>
      </section>`,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9InVybCgjZ3JhZGllbnQpIiByeD0iNCIvPjx0ZXh0IHg9IjUwIiB5PSIzMCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuagh+mimDwvdGV4dD48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+'
    },
    {
      id: '2',
      name: '引用样式',
      category: '内容',
      html: `<section style="margin: 15px 0; padding: 15px; border-left: 4px solid #4CAF50; background: #f8f9fa; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-style: italic; color: #555;">在此输入引用内容</p>
      </section>`,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjUwIiBmaWxsPSIjNENBRjUwIi8+PHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjkyIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTQiIHk9IjMwIiBmaWxsPSIjNTU1IiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lvJXnlKg8L3RleHQ+PC9zdmc+'
    },
    {
      id: '3',
      name: '分割线',
      category: '装饰',
      html: `<section style="margin: 20px 0; text-align: center;">
        <div style="display: inline-block; width: 60px; height: 2px; background: linear-gradient(to right, transparent, #ddd, transparent);"></div>
        <span style="margin: 0 15px; color: #999; font-size: 14px;">✦</span>
        <div style="display: inline-block; width: 60px; height: 2px; background: linear-gradient(to right, transparent, #ddd, transparent);"></div>
      </section>`,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB2aWV3Qm94PSIwIDAgMTAwIDMwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxsaW5lIHgxPSIxMCIgeTE9IjE1IiB4Mj0iNDAiIHkyPSIxNSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iMjAiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKcpjwvdGV4dD48bGluZSB4MT0iNjAiIHkxPSIxNSIgeDI9IjkwIiB5Mj0iMTUiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'
    }
  ]

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff6600', '#ffcc00', '#33cc00', '#0099cc', '#6633cc',
    '#ff3366', '#ff9933', '#ffff33', '#66ff33', '#33ccff', '#9966ff'
  ]

  const fontSizes = ['12', '14', '15', '16', '17', '18', '20', '24', '28', '32']
  const lineHeights = ['1', '1.2', '1.4', '1.6', '1.8', '2.0', '2.5', '3.0']

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      editorRef.current.innerHTML = content
    }
  }, [content, isPreview])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }

  const insertTemplate = (template: StyleTemplate) => {
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = template.html
        
        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild)
        }
        
        selection.removeAllRanges()
        updateContent()
      }
    }
    setShowTemplates(false)
  }

  const insertImage = () => {
    const url = prompt('请输入图片URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const insertLink = () => {
    const url = prompt('请输入链接URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const applyFontSize = (size: string) => {
    execCommand('fontSize', '7') // Use size 7 as base
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.style.fontSize = size + 'px'
      try {
        range.surroundContents(span)
      } catch (e) {
        span.appendChild(range.extractContents())
        range.insertNode(span)
      }
      updateContent()
    }
    setFontSize(size)
  }

  const applyLineHeight = (height: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const div = document.createElement('div')
      div.style.lineHeight = height
      try {
        range.surroundContents(div)
      } catch (e) {
        div.appendChild(range.extractContents())
        range.insertNode(div)
      }
      updateContent()
    }
    setLineHeight(height)
  }

  const copyToClipboard = async () => {
    if (editorRef.current) {
      try {
        await navigator.clipboard.writeText(editorRef.current.innerHTML)
        alert('内容已复制到剪贴板')
      } catch (err) {
        console.error('复制失败:', err)
        alert('复制失败，请手动复制')
      }
    }
  }

  const getViewModeWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px'
      case 'tablet': return '768px'
      case 'desktop': return '100%'
      default: return '375px'
    }
  }

  return (
    <div className={`enhanced-135-editor ${className}`}>
      {/* Toolbar */}
      <div className="toolbar bg-white border-b border-gray-200 p-2 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-1">
          {/* Basic formatting */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-100 rounded"
              title="粗体"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-100 rounded"
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-100 rounded"
              title="下划线"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Font size */}
          <div className="relative">
            <select
              value={fontSize}
              onChange={(e) => applyFontSize(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              {fontSizes.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-100 rounded"
              title="文字颜色"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
                <div className="grid grid-cols-6 gap-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        execCommand('foreColor', color)
                        setCurrentColor(color)
                        setShowColorPicker(false)
                      }}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 hover:bg-gray-100 rounded"
              title="左对齐"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 hover:bg-gray-100 rounded"
              title="居中"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 hover:bg-gray-100 rounded"
              title="右对齐"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyFull')}
              className="p-2 hover:bg-gray-100 rounded"
              title="两端对齐"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-100 rounded"
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-100 rounded"
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Media */}
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={insertImage}
              className="p-2 hover:bg-gray-100 rounded"
              title="插入图片"
            >
              <Image className="w-4 h-4" />
            </button>
            <button
              onClick={insertLink}
              className="p-2 hover:bg-gray-100 rounded"
              title="插入链接"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>

          {/* Templates */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            title="样式模板"
          >
            模板
          </button>

          {/* View modes */}
          <div className="flex items-center ml-auto">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1 rounded ${viewMode === 'mobile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              title="手机预览"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-1 rounded ${viewMode === 'tablet' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              title="平板预览"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1 rounded ${viewMode === 'desktop' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              title="桌面预览"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center ml-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`p-2 rounded ${isPreview ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
              title="预览"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 rounded"
              title="复制内容"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="templates-panel bg-white border-b border-gray-200 p-4">
          <h3 className="text-sm font-medium mb-3">样式模板</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {styleTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => insertTemplate(template)}
                className="cursor-pointer border border-gray-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm"
              >
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-12 object-cover rounded mb-2"
                />
                <p className="text-xs text-gray-600 text-center">{template.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="editor-container flex-1 overflow-auto">
        <div 
          className="editor-wrapper mx-auto transition-all duration-300"
          style={{ width: getViewModeWidth() }}
        >
          <div
            ref={editorRef}
            contentEditable={!isPreview}
            onInput={updateContent}
            className={`editor-content min-h-96 p-4 outline-none ${
              isPreview ? 'bg-gray-50' : 'bg-white'
            }`}
            style={{
              fontSize: '17px',
              lineHeight: '1.6',
              color: 'rgba(0, 0, 0, 0.9)',
              textAlign: 'justify'
            }}
            dangerouslySetInnerHTML={{ __html: isPreview ? content : undefined }}
          />
          {!content && !isPreview && (
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
              {placeholder}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
