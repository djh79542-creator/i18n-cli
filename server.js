const express = require('express');
const fs = require('fs');
const path = require('path');
const { syncStructural } = require('./lib/i18n-sync-structural');

const app = express();
const PORT = process.env.PORT || 7777;
const ROOT = './language-package';
const MAIN_LANG = 'en';

app.use(express.json());
app.use(express.static('.'));

function listLocaleJsonFiles(langDir) {
    return fs.readdirSync(langDir).filter(
        (f) => f.endsWith('.json') && !f.startsWith('i18n-')
    );
}

// 语言代码映射
const languageMap = {
    'ar': { name: '阿拉伯语', flag: '🇸🇦' },
    'bg': { name: '保加利亚语', flag: '🇧🇬' },
    'cs': { name: '捷克语', flag: '🇨🇿' },
    'da': { name: '丹麦语', flag: '🇩🇰' },
    'de': { name: '德语', flag: '🇩🇪' },
    'el': { name: '希腊语', flag: '🇬🇷' },
    'en': { name: '英语', flag: '🇺🇸' },
    'es': { name: '西班牙语', flag: '🇪🇸' },
    'et': { name: '爱沙尼亚语', flag: '🇪🇪' },
    'fi': { name: '芬兰语', flag: '🇫🇮' },
    'fr': { name: '法语', flag: '🇫🇷' },
    'he': { name: '希伯来语', flag: '🇮🇱' },
    'hr': { name: '克罗地亚语', flag: '🇭🇷' },
    'hu': { name: '匈牙利语', flag: '🇭🇺' },
    'is': { name: '冰岛语', flag: '🇮🇸' },
    'it': { name: '意大利语', flag: '🇮🇹' },
    'ja': { name: '日语', flag: '🇯🇵' },
    'ko': { name: '韩语', flag: '🇰🇷' },
    'lt': { name: '立陶宛语', flag: '🇱🇹' },
    'lv': { name: '拉脱维亚语', flag: '🇱🇻' },
    'nl': { name: '荷兰语', flag: '🇳🇱' },
    'no': { name: '挪威语', flag: '🇳🇴' },
    'pl': { name: '波兰语', flag: '🇵🇱' },
    'pt': { name: '葡萄牙语', flag: '🇵🇹' },
    'ro': { name: '罗马尼亚语', flag: '🇷🇴' },
    'ru': { name: '俄语', flag: '🇷🇺' },
    'sk': { name: '斯洛伐克语', flag: '🇸🇰' },
    'sl': { name: '斯洛文尼亚语', flag: '🇸🇮' },
    'sv': { name: '瑞典语', flag: '🇸🇪' },
    'tr': { name: '土耳其语', flag: '🇹🇷' },
    'uk': { name: '乌克兰语', flag: '🇺🇦' },
    'zh': { name: '简体中文', flag: '🇨🇳' }
};

// 读取JSON文件
function readJSON(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        console.error(`解析 JSON 文件时出错：${file}`);
        return {};
    }
}

// 写入JSON文件
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// API路由：获取所有语言包
app.get('/api/languages', (req, res) => {
    try {
        const languages = {};
        
        if (!fs.existsSync(ROOT)) {
            return res.json(languages);
        }

        const languageDirs = fs.readdirSync(ROOT).filter(dir => {
            return fs.statSync(path.join(ROOT, dir)).isDirectory();
        });

        languageDirs.forEach(langCode => {
            const langDir = path.join(ROOT, langCode);
            const files = listLocaleJsonFiles(langDir);
            
            if (files.length > 0) {
                const langFile = files[0];
                const langPath = path.join(langDir, langFile);
                const langData = readJSON(langPath);
                
                languages[langCode] = {
                    code: langCode,
                    name: languageMap[langCode]?.name || langCode,
                    flag: languageMap[langCode]?.flag || '🏳️',
                    data: langData,
                    filePath: langPath
                };
            }
        });

        res.json(languages);
    } catch (error) {
        console.error('获取语言包失败:', error);
        res.status(500).json({ error: '获取语言包失败' });
    }
});

// API路由：保存语言包
app.put('/api/languages/:langCode', (req, res) => {
    try {
        const { langCode } = req.params;
        const data = req.body;

        const langDir = path.join(ROOT, langCode);
        if (!fs.existsSync(langDir)) {
            return res.status(404).json({ error: '语言包不存在' });
        }

        const files = listLocaleJsonFiles(langDir);
        if (files.length === 0) {
            return res.status(404).json({ error: '语言包文件不存在' });
        }

        const langFile = files[0];
        const langPath = path.join(langDir, langFile);
        
        writeJSON(langPath, data);
        
        res.json({ message: '保存成功', filePath: langPath });
    } catch (error) {
        console.error('保存语言包失败:', error);
        res.status(500).json({ error: '保存失败' });
    }
});

// API路由：同步所有语言包（仅对齐 key，新 key 填空；译文请用 Cursor Skill + i18n-ai-queue.js）
app.post('/api/sync-languages', (req, res) => {
    try {
        const mainDir = path.join(ROOT, MAIN_LANG);
        if (!fs.existsSync(mainDir)) {
            return res.status(404).json({ error: '主语言包不存在' });
        }

        const { mainPath, updatedFileCount, results } = syncStructural();
        console.log(`主语言文件：${mainPath}`);
        results.forEach((line) => console.log(line));

        res.json({
            message: `同步完成！写入了 ${updatedFileCount} 个语言包文件（新 key 为空字符串，请人工/AI 翻译）`,
            results: results,
            updatedCount: updatedFileCount
        });
    } catch (error) {
        console.error('同步失败:', error);
        res.status(500).json({ error: '同步失败', details: error.message });
    }
});

// API路由：导出所有语言包
app.get('/api/export-all', (req, res) => {
    try {
        const archiver = require('archiver');
        
        // 设置响应头
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=language-package-${new Date().toISOString().split('T')[0]}.zip`);

        // 创建zip压缩流
        const archive = archiver('zip', {
            zlib: { level: 9 } // 最高压缩级别
        });

        // 处理错误
        archive.on('error', (err) => {
            console.error('压缩失败:', err);
            res.status(500).json({ error: '导出失败' });
        });

        // 将压缩流连接到响应
        archive.pipe(res);

        // 添加整个language-package目录到压缩包
        archive.directory(ROOT, 'language-package');

        // 完成压缩
        archive.finalize();

        console.log('导出语言包压缩文件');

    } catch (error) {
        console.error('导出失败:', error);
        res.status(500).json({ error: '导出失败', details: error.message });
    }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    // 获取本机IP地址
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            // 跳过内部地址和IPv6地址
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
        if (localIP !== 'localhost') break;
    }
    
    console.log(`🚀 翻译管理工具服务器已启动`);
    console.log(`📱 本地访问: http://localhost:${PORT}/translation-gui.html`);
    console.log(`🌐 局域网访问: http://${localIP}:${PORT}/translation-gui.html`);
    console.log(`📁 语言包目录: ${ROOT}`);
    console.log(`🌍 主语言: ${MAIN_LANG}`);
    console.log(`\n💡 提示:`);
    console.log(`   - 局域网内其他设备可通过 http://${localIP}:${PORT}/translation-gui.html 访问`);
    console.log(`   - 请确保防火墙允许端口 ${PORT} 的访问`);
});