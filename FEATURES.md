# 新功能说明

## 🔧 最新更新

### 1. 中文文件名支持 ✅

**问题**: 上传包含中文字符的文件时，服务端会显示乱码。

**解决方案**: 
- 在服务端的 multer 配置中正确处理文件名编码
- 使用 `Buffer.from(file.originalname, 'latin1').toString('utf8')` 转换编码
- 确保文件名在存储和返回时都保持正确的 UTF-8 编码

**测试方法**:
1. 上传包含中文字符的文件，如 `测试文件.txt`
2. 查看服务端日志和文件列表
3. 确认文件名显示正确

### 2. 动态服务器地址配置 ✅

**功能**: 客户端可以动态配置连接的服务器地址，支持连接到不同的服务器。

**主要特性**:
- 🔧 **图形化设置界面**: 右上角设置按钮
- 🔄 **连接测试**: 实时测试服务器连接状态
- 💾 **持久化存储**: 设置保存在浏览器本地存储
- 🎯 **环境变量支持**: 支持通过 `VITE_SERVER_URL` 环境变量预设
- 🔄 **一键重置**: 快速重置为默认设置

**使用方法**:

#### 方法一: 图形界面设置
1. 点击右上角的 "服务器设置" 按钮
2. 在弹出的面板中输入新的服务器地址
3. 点击连接测试确认服务器可用
4. 点击 "保存" 应用设置

#### 方法二: 环境变量设置
```bash
# 创建 .env.local 文件
echo "VITE_SERVER_URL=http://192.168.1.100:3001" > client/.env.local

# 重启客户端
pnpm dev:client
```

#### 方法三: 本地存储
设置会自动保存到浏览器的 localStorage，下次访问时自动加载。

## 🌐 支持的服务器地址格式

```bash
# 本地服务器
http://localhost:3001

# 局域网服务器
http://192.168.1.100:3001

# 远程服务器
http://example.com:3001
https://file-server.example.com

# 自定义端口
http://10.0.0.50:8080
```

## 🔍 连接状态指示

设置界面会显示连接状态：
- 🟢 **已连接**: 服务器响应正常
- 🔴 **连接失败**: 无法连接到服务器
- 🔄 **连接中**: 正在测试连接
- ⚪ **未知**: 尚未测试连接

## 💡 使用场景

### 开发环境
```bash
# 本地开发
VITE_SERVER_URL=http://localhost:3001
```

### 测试环境
```bash
# 测试服务器
VITE_SERVER_URL=http://test-server:3001
```

### 生产环境
```bash
# 生产服务器
VITE_SERVER_URL=https://api.example.com
```

### 局域网共享
```bash
# 局域网内其他设备
VITE_SERVER_URL=http://192.168.1.100:3001
```

## 🛠️ 技术实现

### 客户端
- **配置管理**: `src/config/api.js`
- **设置组件**: `src/components/ServerSettings.jsx`
- **持久化**: localStorage
- **连接测试**: Fetch API

### API 调用
所有 API 请求都通过配置的服务器地址：
```javascript
import { API_CONFIG } from '../config/api'

// 上传文件
axios.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.upload}`, formData)

// 获取文件列表
axios.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.files}`)
```

## 🔧 故障排查

### 连接问题
1. **检查服务器是否运行**:
   ```bash
   curl http://your-server:3001/
   ```

2. **检查防火墙设置**:
   确保目标端口（如 3001）对外开放

3. **检查网络连通性**:
   ```bash
   ping your-server-ip
   ```

### CORS 问题
如果遇到跨域问题，确保服务端已正确配置 CORS：
```javascript
// 服务端已包含
app.use(cors());
```

### SSL 问题
从 HTTPS 页面连接到 HTTP 服务器可能被阻止，考虑：
- 使用 HTTPS 服务器
- 在浏览器中允许不安全内容

## 📚 最佳实践

1. **生产环境**: 使用 HTTPS 和域名
2. **开发环境**: 使用本地 IP 便于移动设备访问
3. **团队协作**: 在 README 中记录团队使用的服务器地址
4. **安全考虑**: 不要在公网暴露开发服务器

## 🔄 向后兼容

- 默认行为保持不变（连接 localhost:3001）
- 现有的 Vite 代理配置已移除，改为直接 API 调用
- 所有原有功能正常工作
