#!/usr/bin/env node

/**
 * 專案結構與函式快照生成工具
 * 使用方式: 將此腳本放置於專案根目錄，執行 node snapshot.js
 * 輸出檔案: snapshot.md - 包含專案目錄結構、函式清單與依賴資訊
 */

const fs = require('fs');
const path = require('path');

// ========================= 可自訂設定區 =========================

/**
 * 排除清單 - 設定要排除的檔案或目錄
 * 可使用完整路徑、相對路徑、檔案名稱或路徑片段
 */
const EXCLUDES = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'public',
  'static',
  '.vscode',
  '.idea',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.env',
  'snapshot.md'
];

/**
 * 支援的檔案類型
 * 可依需求擴充或修改
 */
const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.vue'];

/**
 * 目錄樹顯示最大深度
 * 設定為 -1 表示無限深度
 */
const MAX_TREE_DEPTH = -1;

/**
 * 程式碼解析器 - 可依需求自訂或選擇預設解析器
 * 每個解析器需返回一個包含函式資訊的陣列
 */
const CODE_PARSERS = {
  // Controller 物件模式 - 解析 module.exports = {} 或 export default {} 物件內的方法
  controllerObjectParser: (content) => {
    const functions = [];
    // 尋找所有物件匯出模式
    const exportMatches = content.match(/(?:module\.exports|export default)\s*=\s*{([^}]*)}/s);
    
    if (exportMatches && exportMatches[1]) {
      const objectContent = exportMatches[1];
      // 尋找物件內的方法
      const methodRegex = /\/\/\s*([^\n]*)\s*\n\s*([a-zA-Z0-9_]+)\s*(?::\s*)?(?:async\s+)?(?:function\s*)?(\([^)]*\))/g;
      let match;
      
      while ((match = methodRegex.exec(objectContent)) !== null) {
        functions.push({
          name: match[2],
          signature: `${match[2]}${match[3]}`,
          comment: match[1].trim() || null
        });
      }
      
      // 捕捉沒有註解的方法
      const methodWithoutCommentRegex = /([a-zA-Z0-9_]+)\s*(?::\s*)?(?:async\s+)?(?:function\s*)?(\([^)]*\))/g;
      methodRegex.lastIndex = 0;  // 重置正則索引
      
      while ((match = methodWithoutCommentRegex.exec(objectContent)) !== null) {
        // 檢查是否已經添加過此方法
        const existingFunc = functions.find(f => f.name === match[1]);
        if (!existingFunc) {
          functions.push({
            name: match[1],
            signature: `${match[1]}${match[2]}`,
            comment: null
          });
        }
      }
    }
    
    return functions;
  },
  
  // Export 函式模式 - 解析獨立匯出的函式或常數
  exportFunctionParser: (content) => {
    const functions = [];
    
    // 匹配 export function、export async function 以及 export const 形式的函式
    const patterns = [
      { 
        regex: /\/\/\s*([^\n]*)\s*\n\s*export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*(\([^)]*\))/g,
        process: (match) => ({
          name: match[2],
          signature: `${match[2]}${match[3]}`,
          comment: match[1].trim() || null
        })
      },
      { 
        regex: /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*(\([^)]*\))/g,
        process: (match) => ({
          name: match[1],
          signature: `${match[1]}${match[2]}`,
          comment: null
        })
      },
      { 
        regex: /\/\/\s*([^\n]*)\s*\n\s*export\s+const\s+([a-zA-Z0-9_]+)\s*=(?:\s*\(\))?\s*(?:async\s*)?\(?[^=>]*\)?\s*=>/g,
        process: (match) => ({
          name: match[2],
          signature: `${match[2]}()`,
          comment: match[1].trim() || null
        })
      },
      { 
        regex: /export\s+const\s+([a-zA-Z0-9_]+)\s*=(?:\s*\(\))?\s*(?:async\s*)?\(?[^=>]*\)?\s*=>/g,
        process: (match) => ({
          name: match[1],
          signature: `${match[1]}()`,
          comment: null
        })
      },
      // Vue Composables (use 開頭的函式)
      { 
        regex: /\/\/\s*([^\n]*)\s*\n\s*export\s+(?:function|const)\s+(use[A-Z][a-zA-Z0-9_]*)\s*(?:=\s*)?(\([^)]*\))?/g,
        process: (match) => ({
          name: match[2],
          signature: `${match[2]}${match[3] || '()'}`,
          comment: match[1].trim() || null
        })
      },
      { 
        regex: /export\s+(?:function|const)\s+(use[A-Z][a-zA-Z0-9_]*)\s*(?:=\s*)?(\([^)]*\))?/g,
        process: (match) => ({
          name: match[1],
          signature: `${match[1]}${match[2] || '()'}`,
          comment: null
        })
      }
    ];
    
    // 應用每個模式
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const func = pattern.process(match);
        // 避免重複添加
        if (!functions.some(f => f.name === func.name)) {
          functions.push(func);
        }
      }
    }
    
    return functions;
  }
};

// ========================= 核心功能實現 =========================

/**
 * 主函式 - 程式進入點
 */
async function main() {
  console.log('開始生成專案快照...');
  
  const projectRoot = process.cwd();
  const outputPath = path.join(projectRoot, 'snapshot.md');
  
  // 收集專案資訊
  const projectStructure = generateDirectoryTree(projectRoot);
  const filesWithFunctions = await scanProjectFiles(projectRoot);
  const dependencies = collectDependencies(projectRoot);
  
  // 生成 Markdown 輸出
  const markdown = generateMarkdown(projectStructure, filesWithFunctions, dependencies);
  
  // 寫入檔案
  fs.writeFileSync(outputPath, markdown, 'utf8');
  
  console.log(`專案快照已生成至: ${outputPath}`);
}

/**
 * 檢查路徑是否被排除
 * @param {string} filePath - 要檢查的檔案或目錄路徑
 * @returns {boolean} - true 表示應該排除，false 表示應該包含
 */
function shouldExclude(filePath) {
  return EXCLUDES.some(exclude => {
    // 完全匹配檔名
    if (path.basename(filePath) === exclude) return true;
    // 路徑包含排除項
    return filePath.includes(exclude);
  });
}

/**
 * 生成目錄樹結構
 * @param {string} rootDir - 專案根目錄
 * @param {number} depth - 當前深度
 * @param {string} prefix - ASCII 樹狀圖前綴
 * @returns {string} - ASCII 樹狀圖
 */
function generateDirectoryTree(rootDir, depth = 0, prefix = '') {
  if (MAX_TREE_DEPTH !== -1 && depth > MAX_TREE_DEPTH) return '';
  
  const rootName = path.basename(rootDir);
  if (shouldExclude(rootDir)) return '';
  
  let tree = depth === 0 ? `${rootName}\n` : '';
  
  try {
    const items = fs.readdirSync(rootDir).sort((a, b) => {
      // 目錄優先
      const aIsDir = fs.statSync(path.join(rootDir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(rootDir, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b); // 字母順序
    });
    
    items.forEach((item, index) => {
      const itemPath = path.join(rootDir, item);
      if (shouldExclude(itemPath)) return;
      
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      
      const isDir = fs.statSync(itemPath).isDirectory();
      
      if (depth > 0 || depth === 0 && items.length > 0) {
        tree += `${prefix}${connector}${item}${isDir ? '/' : ''}\n`;
      }
      
      if (isDir) {
        tree += generateDirectoryTree(itemPath, depth + 1, newPrefix);
      }
    });
  } catch (error) {
    console.error(`無法讀取目錄 ${rootDir}:`, error);
  }
  
  return tree;
}

/**
 * 掃描專案檔案並解析函式
 * @param {string} rootDir - 專案根目錄
 * @returns {Promise<Array>} - 包含檔案路徑與函式資訊的陣列
 */
async function scanProjectFiles(rootDir) {
  const result = [];
  
  // 遞迴掃描檔案
  async function scanDir(dir) {
    if (shouldExclude(dir)) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        if (shouldExclude(itemPath)) continue;
        
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          await scanDir(itemPath);
        } else if (stat.isFile()) {
          const ext = path.extname(itemPath);
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            const fileContent = fs.readFileSync(itemPath, 'utf8');
            
            // 使用各種解析器處理檔案內容
            const functions = [];
            for (const parserName in CODE_PARSERS) {
              const parser = CODE_PARSERS[parserName];
              const parsed = parser(fileContent);
              
              // 合併解析結果，避免重複
              for (const func of parsed) {
                if (!functions.some(f => f.name === func.name)) {
                  functions.push(func);
                }
              }
            }
            
            if (functions.length > 0) {
              // 取得相對於專案根目錄的路徑
              const relativePath = path.relative(rootDir, itemPath);
              result.push({
                file: relativePath,
                functions: functions
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`掃描目錄 ${dir} 時發生錯誤:`, error);
    }
  }
  
  await scanDir(rootDir);
  return result;
}

/**
 * 收集專案依賴資訊
 * @param {string} rootDir - 專案根目錄
 * @returns {Array} - 包含專案名稱與依賴的陣列
 */
function collectDependencies(rootDir) {
  const dependencies = [];
  
  // 遞迴尋找 package.json 檔案
  function findPackageJson(dir) {
    if (shouldExclude(dir)) return;
    
    try {
      const packageJsonPath = path.join(dir, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const projectName = packageContent.name || path.relative(rootDir, dir) || '主專案';
        
        dependencies.push({
          name: projectName,
          dependencies: packageContent.dependencies || {},
          devDependencies: packageContent.devDependencies || {}
        });
      }
      
      // 檢查子目錄
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        if (!shouldExclude(itemPath) && fs.statSync(itemPath).isDirectory()) {
          findPackageJson(itemPath);
        }
      }
    } catch (error) {
      console.error(`收集依賴資訊時發生錯誤:`, error);
    }
  }
  
  findPackageJson(rootDir);
  return dependencies;
}

/**
 * 生成 Markdown 輸出
 * @param {string} projectStructure - 樹狀目錄結構
 * @param {Array} filesWithFunctions - 檔案與函式資訊
 * @param {Array} dependencies - 依賴資訊
 * @returns {string} - 完整 Markdown 內容
 */
function generateMarkdown(projectStructure, filesWithFunctions, dependencies) {
  let markdown = `# 專案快照\n\n`;
  
  // 專案結構區段
  markdown += `## 專案目錄結構\n\n`;
  markdown += '```\n';
  markdown += projectStructure;
  markdown += '```\n\n';
  
  // 函式清單區段
  markdown += `## 函式清單\n\n`;
  
  if (filesWithFunctions.length > 0) {
    filesWithFunctions.forEach(file => {
      markdown += `### ${file.file}\n\n`;
      
      if (file.functions.length > 0) {
        file.functions.forEach(func => {
          markdown += `- \`${func.signature}\``;
          if (func.comment) {
            markdown += ` - ${func.comment}`;
          }
          markdown += '\n';
        });
      } else {
        markdown += '*沒有找到函式*\n';
      }
      
      markdown += '\n';
    });
  } else {
    markdown += '*沒有找到任何函式*\n\n';
  }
  
  // 依賴清單區段
  markdown += `## 依賴清單\n\n`;
  
  if (dependencies.length > 0) {
    dependencies.forEach(dep => {
      markdown += `### ${dep.name}\n\n`;
      
      if (Object.keys(dep.dependencies).length > 0) {
        markdown += `#### dependencies\n\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(dep.dependencies, null, 2);
        markdown += '\n```\n\n';
      }
      
      if (Object.keys(dep.devDependencies).length > 0) {
        markdown += `#### devDependencies\n\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(dep.devDependencies, null, 2);
        markdown += '\n```\n\n';
      }
    });
  } else {
    markdown += '*沒有找到依賴資訊*\n\n';
  }
  
  markdown += `---\n`;
  markdown += `生成時間: ${new Date().toLocaleString('zh-TW')}\n`;
  
  return markdown;
}

// 執行主函式
main().catch(error => {
  console.error('生成專案快照時發生錯誤:', error);
  process.exit(1);
});
