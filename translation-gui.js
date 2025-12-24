// 全局变量
let currentLanguage = null;
let currentLanguageData = {};
let allLanguages = {};
let isModified = false;

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

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadLanguageFiles();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 语言列表搜索功能
    document.getElementById('languageSearch').addEventListener('input', function(e) {
        filterLanguages(e.target.value);
    });

    // 键值搜索功能
    const keyValueSearchInput = document.getElementById('keyValueSearch');
    if (keyValueSearchInput) {
        keyValueSearchInput.addEventListener('input', function(e) {
            filterKeyValues(e.target.value);
        });
    }

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCurrentLanguage();
        }
        // Ctrl+F 聚焦到键值搜索框
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            if (keyValueSearchInput) {
                keyValueSearchInput.focus();
            }
        }
    });

    // 点击模态框外部关闭
    document.getElementById('addKeyModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddKeyModal();
        }
    });
}

// 加载语言文件
async function loadLanguageFiles() {
    showLoading(true);
    updateStatus('正在加载语言文件...');

    try {
        // 模拟从服务器加载语言文件
        // 在实际应用中，这里应该调用后端API
        const response = await fetch('/api/languages');
        if (!response.ok) {
            throw new Error('无法加载语言文件');
        }
        
        allLanguages = await response.json();
        renderLanguageList();
        updateStatus('语言文件加载完成');
    } catch (error) {
        console.error('加载语言文件失败:', error);
        // 使用模拟数据
        loadMockData();
    } finally {
        showLoading(false);
    }
}

// 加载模拟数据
function loadMockData() {
    allLanguages = {};
    
    // 为每种语言创建模拟数据
    Object.keys(languageMap).forEach(langCode => {
        allLanguages[langCode] = {
            code: langCode,
            name: languageMap[langCode].name,
            flag: languageMap[langCode].flag,
            data: {
                'welcome': langCode === 'en' ? 'Welcome' : `Welcome (${langCode})`,
                'hello': langCode === 'en' ? 'Hello' : `Hello (${langCode})`,
                'goodbye': langCode === 'en' ? 'Goodbye' : `Goodbye (${langCode})`,
                'thank_you': langCode === 'en' ? 'Thank you' : `Thank you (${langCode})`,
                'please': langCode === 'en' ? 'Please' : `Please (${langCode})`
            }
        };
    });
    
    renderLanguageList();
    updateStatus('使用模拟数据');
}

// 渲染语言列表
function renderLanguageList() {
    const languageList = document.getElementById('languageList');
    languageList.innerHTML = '';

    // 将语言按优先级排序：英语置顶，其他按字母顺序
    const sortedLanguages = Object.values(allLanguages).sort((a, b) => {
        // 英语置顶
        if (a.code === 'en') return -1;
        if (b.code === 'en') return 1;
        
        // 其他语言按名称字母顺序排序
        return a.name.localeCompare(b.name);
    });

    sortedLanguages.forEach(language => {
        const languageItem = document.createElement('div');
        languageItem.className = 'language-item';
        languageItem.onclick = () => selectLanguage(language.code);
        
        // 为英语添加特殊标识
        const isMainLanguage = language.code === 'en';
        const mainLanguageClass = isMainLanguage ? ' main-language' : '';
        languageItem.className += mainLanguageClass;
        
        languageItem.innerHTML = `
            <div class="language-flag">${language.flag}</div>
            <div>
                <div style="font-weight: 500;">${language.name}${isMainLanguage ? ' (主语言)' : ''}</div>
                <div style="font-size: 12px; color: #666;">${language.code}</div>
            </div>
        `;
        
        languageList.appendChild(languageItem);
    });
}

// 过滤语言列表
function filterLanguages(searchTerm) {
    const languageItems = document.querySelectorAll('.language-item');
    const term = searchTerm.toLowerCase();

    // 先隐藏所有项目
    languageItems.forEach(item => {
        item.style.display = 'none';
    });

    // 收集匹配的语言项目
    const matchedItems = [];
    languageItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(term)) {
            matchedItems.push(item);
        }
    });

    // 对匹配的项目重新排序：英语置顶
    matchedItems.sort((a, b) => {
        const aIsEnglish = a.textContent.includes('en') && a.textContent.includes('英语');
        const bIsEnglish = b.textContent.includes('en') && b.textContent.includes('英语');
        
        if (aIsEnglish && !bIsEnglish) return -1;
        if (!aIsEnglish && bIsEnglish) return 1;
        return 0;
    });

    // 显示匹配的项目
    matchedItems.forEach(item => {
        item.style.display = 'flex';
    });
}

// 过滤键值对
function filterKeyValues(searchTerm) {
    const translationRows = document.querySelectorAll('.translation-row');
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        // 如果搜索框为空，显示所有行
        translationRows.forEach(row => {
            row.style.display = 'flex';
        });
        updateKeyCount();
        return;
    }
    
    let visibleCount = 0;
    
    translationRows.forEach(row => {
        const keyColumn = row.querySelector('.key-column');
        const valueInput = row.querySelector('.value-input');
        
        if (keyColumn && valueInput) {
            const keyText = keyColumn.textContent.toLowerCase();
            const valueText = valueInput.value.toLowerCase();
            
            // 检查键名或值是否包含搜索词
            if (keyText.includes(term) || valueText.includes(term)) {
                row.style.display = 'flex';
                visibleCount++;
                
                // 高亮匹配的文本
                highlightMatch(row, term);
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    // 更新键值计数
    const keyCount = document.getElementById('keyCount');
    if (keyCount) {
        const totalCount = Object.keys(currentLanguageData).length;
        keyCount.textContent = `${visibleCount} / ${totalCount} 个键值`;
    }
}

// 高亮匹配的文本
function highlightMatch(row, searchTerm) {
    // 移除之前的高亮
    row.style.backgroundColor = '';
    
    // 添加轻微的高亮效果
    row.style.backgroundColor = 'rgba(72, 187, 120, 0.05)';
}

// 选择语言
function selectLanguage(languageCode) {
    // 如果当前有未保存的修改，提示用户
    if (isModified && currentLanguage) {
        if (!confirm('当前语言包有未保存的修改，是否继续切换？')) {
            return;
        }
    }

    // 更新选中状态
    document.querySelectorAll('.language-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.closest('.language-item').classList.add('active');

    currentLanguage = languageCode;
    currentLanguageData = { ...allLanguages[languageCode].data };
    isModified = false;

    renderTranslationTable();
    updateEditorTitle();
    updateStatus(`已选择语言: ${allLanguages[languageCode].name}`);
}

// 渲染翻译表格
function renderTranslationTable() {
    const translationTable = document.getElementById('translationTable');
    translationTable.innerHTML = '';
    
    // 清除键值搜索框
    const keyValueSearch = document.getElementById('keyValueSearch');
    if (keyValueSearch) {
        keyValueSearch.value = '';
    }

    if (!currentLanguageData || Object.keys(currentLanguageData).length === 0) {
        translationTable.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">没有翻译数据</div>';
        return;
    }

    Object.entries(currentLanguageData).forEach(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'translation-row';
        
        row.innerHTML = `
            <div class="key-column">
                ${key}
                <div style="margin-top: 5px;">
                    <button onclick="deleteKey('${key}')" style="background: #f56565; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: background-color 0.2s ease;" onmouseover="this.style.background='#e53e3e'" onmouseout="this.style.background='#f56565'">删除</button>
                </div>
            </div>
            <div class="value-column">
                <textarea 
                    class="value-input" 
                    onchange="updateValue('${key}', this.value)"
                    oninput="markAsModified()"
                    placeholder="输入翻译..."
                >${value || ''}</textarea>
            </div>
        `;
        
        translationTable.appendChild(row);
    });

    updateKeyCount();
}

// 更新编辑器标题
function updateEditorTitle() {
    const editorTitle = document.getElementById('editorTitle');
    if (currentLanguage && allLanguages[currentLanguage]) {
        const lang = allLanguages[currentLanguage];
        editorTitle.textContent = `${lang.flag} ${lang.name} (${lang.code})`;
    } else {
        editorTitle.textContent = '选择一个语言包开始编辑';
    }
}

// 更新键值计数
function updateKeyCount() {
    const keyCount = document.getElementById('keyCount');
    const count = Object.keys(currentLanguageData).length;
    keyCount.textContent = `${count} 个键值`;
}

// 更新值
function updateValue(key, value) {
    currentLanguageData[key] = value;
    markAsModified();
}

// 标记为已修改
function markAsModified() {
    isModified = true;
    document.getElementById('lastSaved').textContent = '未保存 *';
    document.getElementById('lastSaved').style.color = '#dc3545';
}

// 删除键值
function deleteKey(key) {
    if (confirm(`确定要删除键值 "${key}" 吗？`)) {
        delete currentLanguageData[key];
        markAsModified();
        renderTranslationTable();
        updateStatus(`已删除键值: ${key}`);
    }
}

// 保存当前语言
async function saveCurrentLanguage() {
    if (!currentLanguage) {
        alert('请先选择一个语言包');
        return;
    }

    updateStatus('正在保存...');
    
    try {
        // 模拟保存到服务器
        // 在实际应用中，这里应该调用后端API
        const response = await fetch(`/api/languages/${currentLanguage}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentLanguageData)
        });

        if (!response.ok) {
            throw new Error('保存失败');
        }

        // 更新本地数据
        allLanguages[currentLanguage].data = { ...currentLanguageData };
        isModified = false;
        
        document.getElementById('lastSaved').textContent = `已保存 ${new Date().toLocaleTimeString()}`;
        document.getElementById('lastSaved').style.color = '#28a745';
        updateStatus('保存成功');
    } catch (error) {
        console.error('保存失败:', error);
        // 模拟保存成功
        allLanguages[currentLanguage].data = { ...currentLanguageData };
        isModified = false;
        
        document.getElementById('lastSaved').textContent = `已保存 ${new Date().toLocaleTimeString()}`;
        document.getElementById('lastSaved').style.color = '#28a745';
        updateStatus('保存成功 (模拟)');
    }
}

// 显示添加键值模态框
function showAddKeyModal() {
    document.getElementById('addKeyModal').style.display = 'block';
    document.getElementById('newKeyName').focus();
}

// 关闭添加键值模态框
function closeAddKeyModal() {
    document.getElementById('addKeyModal').style.display = 'none';
    document.getElementById('newKeyName').value = '';
    document.getElementById('newKeyValue').value = '';
}

// 添加新键值
function addNewKey() {
    const keyName = document.getElementById('newKeyName').value.trim();
    const keyValue = document.getElementById('newKeyValue').value.trim();

    if (!keyName) {
        alert('请输入键名');
        return;
    }

    if (!currentLanguage) {
        alert('请先选择一个语言包');
        return;
    }

    if (currentLanguageData.hasOwnProperty(keyName)) {
        if (!confirm(`键值 "${keyName}" 已存在，是否覆盖？`)) {
            return;
        }
    }

    currentLanguageData[keyName] = keyValue;
    markAsModified();
    renderTranslationTable();
    closeAddKeyModal();
    updateStatus(`已添加键值: ${keyName}`);
}

// 同步所有语言
async function syncAllLanguages() {
    if (!confirm('确定要同步所有语言包吗？这将调用翻译API并可能产生费用。')) {
        return;
    }

    updateStatus('正在同步所有语言包...');
    showLoading(true);

    try {
        // 模拟调用后端同步API
        const response = await fetch('/api/sync-languages', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('同步失败');
        }

        const result = await response.json();
        updateStatus(`同步完成: ${result.message}`);
        
        // 重新加载语言文件
        await loadLanguageFiles();
        
        if (currentLanguage) {
            selectLanguage(currentLanguage);
        }
    } catch (error) {
        console.error('同步失败:', error);
        updateStatus('同步失败 (模拟环境)');
    } finally {
        showLoading(false);
    }
}

// 导出语言包
function exportLanguage() {
    if (!currentLanguage) {
        alert('请先选择一个语言包');
        return;
    }

    const dataStr = JSON.stringify(currentLanguageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentLanguage}_${allLanguages[currentLanguage].name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    updateStatus(`已导出: ${allLanguages[currentLanguage].name}`);
}

// 导出所有语言包
async function exportAllLanguages() {
    if (!confirm('确定要导出所有语言包吗？这将下载一个包含所有语言文件的压缩包。')) {
        return;
    }

    updateStatus('正在准备导出所有语言包...');
    
    try {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = '/api/export-all';
        link.download = `language-package-${new Date().toISOString().split('T')[0]}.zip`;
        
        // 添加到页面并触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        updateStatus('所有语言包导出成功');
        
        // 显示成功提示
        setTimeout(() => {
            alert('✅ 所有语言包已成功导出！\n\n📦 文件包含:\n- 所有32种语言的翻译文件\n- 完整的目录结构\n- 可直接用于项目部署');
        }, 1000);
        
    } catch (error) {
        console.error('导出失败:', error);
        updateStatus('导出失败');
        alert('❌ 导出失败，请检查网络连接或联系管理员');
    }
}

// 显示/隐藏加载指示器
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const translationTable = document.getElementById('translationTable');
    
    if (show) {
        loadingIndicator.style.display = 'block';
        translationTable.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
        translationTable.style.display = 'block';
    }
}

// 更新状态信息
function updateStatus(message) {
    document.getElementById('statusInfo').textContent = message;
    console.log('Status:', message);
}

// 页面卸载前提醒保存
window.addEventListener('beforeunload', function(e) {
    if (isModified) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定要离开吗？';
    }
});