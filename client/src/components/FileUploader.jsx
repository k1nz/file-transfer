import React, { useState, useRef } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useToast } from './Toast'

const FileUploader = ({ onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  const addFiles = (files) => {
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' // pending, uploading, success, error
    }))
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    
    selectedFiles.forEach(fileItem => {
      formData.append('files', fileItem.file)
    })

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          
          // 为所有文件设置相同的进度
          const newProgress = {}
          selectedFiles.forEach(fileItem => {
            newProgress[fileItem.id] = percentCompleted
          })
          setUploadProgress(newProgress)
        }
      })

      if (response.data.success) {
        // 标记所有文件为成功
        setSelectedFiles(prev => 
          prev.map(fileItem => ({ ...fileItem, status: 'success' }))
        )
        
        showToast({
          title: '上传成功',
          description: `成功上传 ${selectedFiles.length} 个文件`,
          type: 'success'
        })

        // 清空文件列表
        setTimeout(() => {
          setSelectedFiles([])
          setUploadProgress({})
          onUploadSuccess && onUploadSuccess()
        }, 2000)
      }
    } catch (error) {
      console.error('上传失败:', error)
      
      // 标记所有文件为错误
      setSelectedFiles(prev => 
        prev.map(fileItem => ({ ...fileItem, status: 'error' }))
      )
      
      showToast({
        title: '上传失败',
        description: error.response?.data?.message || '文件上传时发生错误',
        type: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          拖拽文件到此处上传
        </p>
        <p className="text-sm text-gray-500 mb-4">
          或者点击下方按钮选择文件
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          选择文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 选中文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">
              待上传文件 ({selectedFiles.length})
            </h3>
            <button
              onClick={uploadFiles}
              disabled={isUploading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {isUploading ? '上传中...' : '开始上传'}
            </button>
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(fileItem.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>
                
                {/* 进度条 */}
                {uploadProgress[fileItem.id] !== undefined && (
                  <div className="w-24 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[fileItem.id]}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {uploadProgress[fileItem.id]}%
                    </p>
                  </div>
                )}
                
                {!isUploading && fileItem.status === 'pending' && (
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader
