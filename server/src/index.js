const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS 配置 - 允许局域网访问
const corsOptions = {
    origin: function (origin, callback) {
        // 允许没有 origin 的请求（如移动应用、Postman）
        if (!origin) return callback(null, true);
        
        // 允许所有 localhost 和局域网地址
        const allowedOrigins = [
            /^http:\/\/localhost(:\d+)?$/,
            /^http:\/\/127\.0\.0\.1(:\d+)?$/,
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/
        ];
        
        const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`❌ CORS: 拒绝来自 ${origin} 的请求`);
            callback(new Error('不允许的 CORS 来源'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 确保正确处理中文文件名
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        
        // 生成唯一文件名，保留原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        
        // 构建文件名，确保中文字符正确显示
        const fileName = `${baseName}-${uniqueSuffix}${extension}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB 限制
    },
    fileFilter: (req, file, cb) => {
        // 这里可以添加文件类型过滤逻辑
        cb(null, true);
    }
});

// 路由
app.get('/', (req, res) => {
    res.json({
        message: '文件传输服务器运行中',
        version: '1.0.0',
        endpoints: {
            upload: 'POST /api/upload',
            files: 'GET /api/files',
            download: 'GET /api/download/:filename'
        }
    });
});

// 文件上传接口
app.post('/api/upload', upload.array('files'), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有接收到文件'
            });
        }

        const uploadedFiles = req.files.map(file => {
            // 正确解码中文文件名
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            return {
                originalName: originalName,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                uploadTime: new Date().toISOString()
            };
        });

        console.log(`成功上传 ${uploadedFiles.length} 个文件:`);
        uploadedFiles.forEach(file => {
            console.log(`- ${file.originalName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        });

        res.json({
            success: true,
            message: `成功上传 ${uploadedFiles.length} 个文件`,
            files: uploadedFiles
        });

    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败',
            error: error.message
        });
    }
});

// 获取已上传文件列表
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const fileList = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            
            return {
                filename,
                size: stats.size,
                uploadTime: stats.birthtime.toISOString(),
                modifiedTime: stats.mtime.toISOString()
            };
        });

        res.json({
            success: true,
            files: fileList
        });
    } catch (error) {
        console.error('获取文件列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取文件列表失败',
            error: error.message
        });
    }
});

// 文件下载接口
app.get('/api/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('文件下载错误:', err);
                res.status(500).json({
                    success: false,
                    message: '文件下载失败'
                });
            }
        });
    } catch (error) {
        console.error('文件下载错误:', error);
        res.status(500).json({
            success: false,
            message: '文件下载失败',
            error: error.message
        });
    }
});

// 删除文件接口
app.delete('/api/files/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }

        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: '文件删除成功'
        });
    } catch (error) {
        console.error('文件删除错误:', error);
        res.status(500).json({
            success: false,
            message: '文件删除失败',
            error: error.message
        });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: '文件大小超过限制 (100MB)'
            });
        }
    }
    
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 获取本机 IP 地址的函数
const getLocalIPAddress = () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // 跳过非 IPv4 和内部（即 127.x.x.x）地址
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results;
};

// 启动服务器 - 监听所有网络接口
app.listen(PORT, '0.0.0.0', () => {
    const localIPs = getLocalIPAddress();
    
    console.log(`🚀 文件传输服务器已启动`);
    console.log(`📁 文件存储目录: ${uploadDir}`);
    console.log(`\n🌐 访问地址:`);
    console.log(`   本地访问: http://localhost:${PORT}`);
    console.log(`   本地访问: http://127.0.0.1:${PORT}`);
    
    if (localIPs.length > 0) {
        console.log(`\n🔗 局域网访问:`);
        localIPs.forEach(ip => {
            console.log(`   http://${ip}:${PORT}`);
        });
        console.log(`\n💡 其他设备可以通过上述局域网地址访问文件传输服务`);
    } else {
        console.log(`\n⚠️  未检测到局域网 IP 地址`);
    }
    
    console.log(`\n📋 API 端点:`);
    console.log(`   GET  /              - 服务器信息`);
    console.log(`   POST /api/upload    - 文件上传`);
    console.log(`   GET  /api/files     - 文件列表`);
    console.log(`   GET  /api/download  - 文件下载`);
});
