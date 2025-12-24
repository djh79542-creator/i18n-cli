// 测试导出功能的脚本
const axios = require('axios');
const fs = require('fs');

async function testExportFunction() {
    console.log('🧪 开始测试导出功能...');
    
    const baseURL = 'http://localhost:3000';
    
    try {
        // 1. 测试获取语言列表
        console.log('1️⃣ 测试获取语言列表...');
        const languagesResponse = await axios.get(`${baseURL}/api/languages`);
        const languages = Object.keys(languagesResponse.data);
        console.log(`✅ 成功获取 ${languages.length} 种语言`);
        
        // 2. 测试导出所有语言包API
        console.log('2️⃣ 测试导出所有语言包API...');
        const exportResponse = await axios.get(`${baseURL}/api/export-all`, {
            responseType: 'stream'
        });
        
        if (exportResponse.status === 200) {
            console.log('✅ 导出API响应正常');
            
            // 保存测试文件
            const testFileName = `test-export-${Date.now()}.zip`;
            const writer = fs.createWriteStream(testFileName);
            
            exportResponse.data.pipe(writer);
            
            writer.on('finish', () => {
                const stats = fs.statSync(testFileName);
                console.log(`✅ 导出文件创建成功: ${testFileName}`);
                console.log(`📦 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
                
                // 清理测试文件
                fs.unlinkSync(testFileName);
                console.log('🧹 清理测试文件完成');
                
                console.log('\n🎉 导出功能测试通过！');
            });
            
            writer.on('error', (err) => {
                console.error('❌ 文件写入失败:', err);
            });
            
        } else {
            console.error('❌ 导出API响应异常:', exportResponse.status);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 请确保服务器已启动: npm start');
        }
    }
}

// 运行测试
testExportFunction();