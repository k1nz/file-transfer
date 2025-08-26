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

// 中间件
app.use(cors());
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

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 文件传输服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 文件存储目录: ${uploadDir}`);
});
