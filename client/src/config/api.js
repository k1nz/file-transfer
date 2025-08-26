// API 配置
const getServerUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  
  // 从 localStorage 获取用户设置的服务器地址
  const savedServerUrl = localStorage.getItem('serverUrl');
  if (savedServerUrl) {
    return savedServerUrl;
  }
  
  // 默认使用本地服务器
  return 'http://localhost:3001';
};

export const API_CONFIG = {
  baseURL: getServerUrl(),
  endpoints: {
    upload: '/api/upload',
    files: '/api/files',
    download: '/api/download',
    delete: '/api/files'
  }
};

// 更新服务器地址
export const updateServerUrl = (url) => {
  localStorage.setItem('serverUrl', url);
  API_CONFIG.baseURL = url;
};

// 获取当前服务器地址
export const getCurrentServerUrl = () => {
  return API_CONFIG.baseURL;
};

// 重置为默认地址
export const resetServerUrl = () => {
  localStorage.removeItem('serverUrl');
  API_CONFIG.baseURL = 'http://localhost:3001';
};
