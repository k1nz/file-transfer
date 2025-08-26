import React, { useState } from 'react'
import { Download, Trash2, File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'

const FileTreeNode = ({ item, onDownload, onDelete, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  
  if (!item) {
    return null
  }
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleToggle = () => {
    if (item.type === 'directory') {
      setIsExpanded(!isExpanded)
    }
  }

  const handleDelete = () => {
    const message = item.type === 'directory' 
      ? `确定要删除文件夹 "${item.name}" 及其所有内容吗？此操作不可撤销。`
      : `确定要删除文件 "${item.name}" 吗？此操作不可撤销。`
    
    if (confirm(message)) {
      onDelete(item.path)
    }
  }

  return (
    <div>
      {/* 当前节点 */}
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group border-b border-gray-100">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* 展开/折叠图标 */}
          {item.type === 'directory' ? (
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6"></div>
          )}
          
          {/* 文件/文件夹图标 */}
          <div className="flex-shrink-0">
            {item.type === 'directory' ? (
              isExpanded ? (
                <FolderOpen className="h-5 w-5 text-blue-500" />
              ) : (
                <Folder className="h-5 w-5 text-blue-500" />
              )
            ) : (
              <File className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {/* 文件/文件夹信息 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {item.name || 'Unknown'}
            </p>
            {item.type === 'file' && item.size && (
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <span>{formatFileSize(item.size)}</span>
                {item.uploadTime && (
                  <span>上传于 {formatDate(item.uploadTime)}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type === 'file' && (
            <button
              onClick={() => onDownload(item.path)}
              className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="下载文件"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title={item.type === 'directory' ? '删除文件夹' : '删除文件'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* 子节点 */}
      {item.type === 'directory' && isExpanded && item.children && item.children.length > 0 && (
        <div className="ml-6">
          {item.children.map((child, index) => (
            <FileTreeNode
              key={`${child.path || child.name}-${index}`}
              item={child}
              onDownload={onDownload}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FileTree = ({ files, onDownload, onDelete }) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">暂无文件</p>
        <p className="text-sm">上传一些文件后，它们将显示在这里</p>
      </div>
    )
  }

  return (
    <div>
      {files.map((item, index) => (
        <FileTreeNode
          key={`${item.path || item.name}-${index}`}
          item={item}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default FileTree
