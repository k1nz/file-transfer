import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import axios from 'axios'
import { useToast } from './Toast'
import { API_CONFIG } from '../config/api'
import FileTree from './FileTree'

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
        setFiles(response.data.files || [])
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



  const handleDownload = async (filePath) => {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/download/${encodeURIComponent(filePath)}`, {
        responseType: 'blob'
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filePath.split('/').pop()) // 使用文件名
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      showToast({
        title: '下载成功',
        description: `文件 ${filePath.split('/').pop()} 下载完成`,
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

  const handleDelete = async (filePath) => {
    try {
      const response = await axios.delete(`${API_CONFIG.baseURL}/api/files/${encodeURIComponent(filePath)}`)
      
      if (response.data.success) {
        // 刷新文件列表
        fetchFiles()
        showToast({
          title: '删除成功',
          description: `${filePath.split('/').pop()} 已删除`,
          type: 'success'
        })
      }
    } catch (error) {
      console.error('删除失败:', error)
      showToast({
        title: '删除失败',
        description: error.response?.data?.message || '删除时发生错误',
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

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">
          文件列表
        </h3>
        <button
          onClick={fetchFiles}
          className="text-blue-500 hover:text-blue-600 transition-colors"
          title="刷新列表"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="min-h-[200px]">
        <FileTree 
          files={files}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export default FileList
