import React, { useState, useEffect } from 'react'
import { Download, Trash2, File, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { useToast } from './Toast'
import { API_CONFIG } from '../config/api'

const FileList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.files}`)
      
      if (response.data.success) {
        setFiles(response.data.files)
      } else {
        setError('获取文件列表失败')
      }
    } catch (err) {
      console.error('获取文件列表错误:', err)
      setError('无法连接到服务器')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.download}/${encodeURIComponent(filename)}`, {
        responseType: 'blob'
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      showToast({
        title: '下载成功',
        description: `文件 ${filename} 下载完成`,
        type: 'success'
      })
    } catch (error) {
      console.error('下载失败:', error)
      showToast({
        title: '下载失败',
        description: error.response?.data?.message || '文件下载时发生错误',
        type: 'error'
      })
    }
  }

  const handleDelete = async (filename) => {
    if (!confirm(`确定要删除文件 "${filename}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.delete}/${encodeURIComponent(filename)}`)
      
      if (response.data.success) {
        setFiles(prev => prev.filter(file => file.filename !== filename))
        showToast({
          title: '删除成功',
          description: `文件 ${filename} 已删除`,
          type: 'success'
        })
      }
    } catch (error) {
      console.error('删除失败:', error)
      showToast({
        title: '删除失败',
        description: error.response?.data?.message || '文件删除时发生错误',
        type: 'error'
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchFiles}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">暂无文件</p>
          <p className="text-sm">上传一些文件后，它们将显示在这里</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">
          文件列表 ({files.length})
        </h3>
        <button
          onClick={fetchFiles}
          className="text-blue-500 hover:text-blue-600 transition-colors"
          title="刷新列表"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {files.map((file, index) => (
          <div
            key={`${file.filename}-${index}`}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.filename}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>上传于 {formatDate(file.uploadTime)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(file.filename)}
                  className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="下载文件"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(file.filename)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="删除文件"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileList
