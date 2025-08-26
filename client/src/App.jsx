import React from 'react'
import FileUploader from './components/FileUploader'
import FileList from './components/FileList'
import ServerSettings from './components/ServerSettings'
import { ToastProvider } from './components/Toast'
import { useState } from 'react'
import { getCurrentServerUrl } from './config/api'

function App() {
  const [refreshFiles, setRefreshFiles] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1)
  }

  const handleServerChange = () => {
    // 当服务器地址改变时，刷新文件列表
    setRefreshFiles(prev => prev + 1)
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  File Transfer
                </h1>
                <p className="text-gray-600">
                  拖拽文件或点击上传按钮来传输文件
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">连接到</p>
                  <p className="text-sm font-medium text-gray-700">{getCurrentServerUrl()}</p>
                </div>
                <ServerSettings onServerChange={handleServerChange} />
              </div>
            </div>
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
              <FileList refreshTrigger={refreshFiles} />
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
