#!/usr/bin/env node

const { networkInterfaces } = require('os');
const { exec } = require('child_process');

// 获取本机 IP 地址
function getLocalIPAddresses() {
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
        const interfaces = nets[name];
        for (const net of interfaces) {
            // 跳过非 IPv4 和内部地址
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}

// 检查端口是否被占用
function checkPort(port) {
    return new Promise((resolve) => {
        const cmd = process.platform === 'win32' 
            ? `netstat -an | findstr :${port}`
            : `lsof -i :${port}`;
            
        exec(cmd, (error, stdout) => {
            resolve(!error && stdout.trim() !== '');
        });
    });
}

// 主函数
async function main() {
    const PORT = process.env.PORT || 3001;
    
    console.log('🌐 文件传输系统 - 网络配置信息');
    console.log('==================================');
    
    // 显示本机 IP 地址
    console.log('\n📍 本机网络接口:');
    const interfaces = getLocalIPAddresses();
    
    if (Object.keys(interfaces).length === 0) {
        console.log('   ❌ 未找到可用的网络接口');
        return;
    }
    
    for (const [name, addresses] of Object.entries(interfaces)) {
        console.log(`\n   🔗 ${name}:`);
        addresses.forEach(addr => {
            console.log(`      • ${addr}`);
        });
    }
    
    // 显示访问地址
    console.log('\n🚀 服务器访问地址:');
    console.log(`\n   本地访问:`);
    console.log(`      • http://localhost:${PORT}`);
    console.log(`      • http://127.0.0.1:${PORT}`);
    
    console.log(`\n   局域网访问:`);
    const allAddresses = Object.values(interfaces).flat();
    allAddresses.forEach(addr => {
        console.log(`      • http://${addr}:${PORT}`);
    });
    
    // 检查端口状态
    console.log(`\n🔍 端口状态:`);
    const isPortInUse = await checkPort(PORT);
    if (isPortInUse) {
        console.log(`   ✅ 端口 ${PORT} 正在使用中`);
    } else {
        console.log(`   ⚪ 端口 ${PORT} 未使用`);
    }
    
    // 显示防火墙提示
    console.log('\n🛡️  防火墙配置:');
    if (process.platform === 'darwin') {
        console.log('   macOS: 系统偏好设置 > 安全性与隐私 > 防火墙');
    } else if (process.platform === 'win32') {
        console.log('   Windows: 控制面板 > 系统和安全 > Windows Defender 防火墙');
    } else {
        console.log('   Linux: 检查 iptables 或 ufw 配置');
    }
    console.log(`   确保端口 ${PORT} 允许入站连接`);
    
    // 显示客户端配置说明
    console.log('\n📱 客户端配置:');
    console.log('   1. 在客户端页面点击右上角 "服务器设置"');
    console.log('   2. 输入上述局域网地址之一');
    console.log('   3. 点击连接测试确认可用性');
    console.log('   4. 保存设置');
    
    // 显示测试命令
    console.log('\n🧪 连接测试:');
    allAddresses.forEach(addr => {
        console.log(`   curl http://${addr}:${PORT}/`);
    });
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { getLocalIPAddresses, checkPort };
