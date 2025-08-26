import React from 'react'
import FileUploader from './components/FileUploader'
import FileList from './components/FileList'
import { ToastProvider } from './components/Toast'
import { useState } from 'react'

function App() {
  const [refreshFiles, setRefreshFiles] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1)
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              文件传输系统
            </h1>
            <p className="text-gray-600">
              拖拽文件或点击上传按钮来传输文件
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 文件上传区域 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                上传文件
              </h2>
              <FileUploader onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* 文件列表区域 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                已上传文件
              </h2>
              <FileList key={refreshFiles} />
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
