const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const axios = require('axios'); // 引入 axios 用于 HTTP 请求
const ROOT = './language-package';
const MAIN_LANG = 'en'; // 主语言目录

// 百度翻译 API 配置
const BAIDU_API_KEY = 'Bd8t_d4sj0meofjssc2461t9g'; // 替换为你的百度翻译 API Key
const BAIDU_APP_ID = '20251210002516424'; // 替换为你的百度翻译 APP ID
const sercretKey = 'aJZSkPG03VmQ_umzvAL3'; // 替换为你的百度翻译密钥
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/ait/api/aiTextTranslate';

const COM_BAIDU_API_KEY = 'https://fanyi-api.baidu.com/api/trans/vip/translate'; // 替换为你的百度翻译 API Key

// 调用百度翻译 API
async function translateText(text, targetLanguage) {
	// 提取 {} 内的内容、@ 之后的部分，以及转义字符（如 \n、\q 等）
	const placeholders = [];
	// const processedText = text.replace(/\{.*?\}|\@[\w]+|\\[^\n]/g, (match) => {
	// 	placeholders.push(match);
	// 	return `__PLACEHOLDER_${placeholders.length}__`;
	//   });
	const processedText = text
	.replace(/\n/g, '__NEWLINE__') // 将换行符替换为 __NEWLINE__
	.replace(/\{.*?\}|\@[\w]+|\\[^\n]/g, (match) => {
		placeholders.push(match);
		return `__PLACEHOLDER_${placeholders.length}__`;
	});
	
	const params = {
	  q: processedText,
	  from: 'auto', // 自动检测源语言
	  to: targetLanguage,
	  appid: BAIDU_APP_ID,
	};
  
	try {
	  const response = await axios.post(
		BAIDU_API_URL,
		params,
		{
		  headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${BAIDU_API_KEY}`, // 使用 API Key 鉴权
		  },
		}
	  );
  
	  const result = response.data;
	  if (result.trans_result && result.trans_result.length > 0) {
		let translatedText = result.trans_result[0].dst;
  
		// 将占位符替换回原始内容
		translatedText = translatedText.replace(/__PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[index - 1]);
		// 将 __NEWLINE__ 替换回换行符
		translatedText = translatedText.replace(/__NEWLINE__/g, '\n');
  
		return translatedText; // 返回最终翻译结果
	  } else {
		throw new Error(result.error_msg || '未知错误');
	  }
	} catch (error) {
	  console.error(`调用百度翻译 API 时出错: ${error.message}`);
	  throw error;
	}
  }


  // 调用百度通用翻译 API
async function comTranslateText(text, targetLanguage) {
	// 提取 {} 内的内容、@ 之后的部分，以及转义字符（如 \n、\q 等）
	const placeholders = [];
	// const processedText = text.replace(/\{.*?\}|\@[\w]+|\\[^\n]/g, (match) => {
	// 	placeholders.push(match);
	// 	return `__PLACEHOLDER_${placeholders.length}__`;
	//   });
	const processedText = text
	.replace(/\n/g, '__NEWLINE__') // 将换行符替换为 __NEWLINE__
	.replace(/\{.*?\}|\@[\w]+|\\[^\n]/g, (match) => {
		placeholders.push(match);
		return `__PLACEHOLDER_${placeholders.length}__`;
	});
	
	const params = {
	  q: processedText,
	  from: 'auto', // 自动检测源语言
	  to: targetLanguage,
	  appid: BAIDU_APP_ID,
	  salt: 123465,
	  sign: md5(BAIDU_APP_ID + processedText + 123465 + sercretKey)
	};
  
	try {
	  const response = await axios.post(
		COM_BAIDU_API_KEY,
		params,
		{
		  headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		  },
		}
	  );
  
	  const result = response.data;
	  if (result.trans_result && result.trans_result.length > 0) {
		let translatedText = result.trans_result[0].dst;
  
		// 将占位符替换回原始内容
		translatedText = translatedText.replace(/__PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[index - 1]);
		// 将 __NEWLINE__ 替换回换行符
		translatedText = translatedText.replace(/__NEWLINE__/g, '\n');
  
		return translatedText; // 返回最终翻译结果
	  } else {
		throw new Error(result.error_msg || '未知错误');
	  }
	} catch (error) {
	  console.error(`调用百度翻译 API 时出错: ${error.message}`);
	  throw error;
	}
  }

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`解析 JSON 文件时出错：${file}`);
    console.error(error.message);
    process.exit(1); // 退出程序
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

async function sync() {
  const mainDir = path.join(ROOT, MAIN_LANG);
  const mainFile = fs.readdirSync(mainDir).find(f => f.endsWith('.json'));
  const mainPath = path.join(mainDir, mainFile);

  const mainJson = readJSON(mainPath);

  console.log(`主语言文件：${mainPath}`);

  const languages = fs.readdirSync(ROOT).filter(dir => dir !== MAIN_LANG);

  for (const lang of languages) {
    const langDir = path.join(ROOT, lang);
    const langFile = fs.readdirSync(langDir).find(f => f.endsWith('.json'));
	const langCode = langFile.split('_')[0]; // 提取语言代码的前半部分
    const langPath = path.join(langDir, langFile);

    let langJson = readJSON(langPath);

    let updated = false;

    // 同步所有 key
    for (const key of Object.keys(mainJson)) {
      if (!langJson.hasOwnProperty(key)) {
        // 新增的 key
        try {
          const translatedText = await comTranslateText(mainJson[key], langCode); // 翻译主语言包的值
          langJson[key] = translatedText;
          updated = true;
          console.log(`[${langCode}] 添加新 key: ${key}`);
        } catch (error) {
          console.error(`翻译失败: ${langCode}-${key} - ${mainJson[key]} - ${error.message}`);
        }
      }
    }

	// 删除多余的 key
	for (const key of Object.keys(langJson)) {
		if (!mainJson.hasOwnProperty(key)) {
		// 主语言包中不存在的 key
		delete langJson[key];
		updated = true;
		console.log(`[${langCode}] 删除多余的 key: ${key}`);
		}
	}

    if (updated) {
      writeJSON(langPath, langJson);
      console.log(`已更新：${langPath}`);
    }
  }

  console.log("语言包同步完成！");
}

sync();