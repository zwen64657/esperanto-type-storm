// 完整写入1000词到程序，与音频一一对应

const fs = require('fs');
const path = require('path');

// 读取txt文件
const inputFile = path.join(__dirname, '世界语1000词.txt');
const content = fs.readFileSync(inputFile, 'utf-8');

// 处理每一行（只取前1000行）
const lines = content.split('\n').slice(0, 1000);
const wordDatabase = [];

lines.forEach((line, index) => {
    // 移除BOM标记
    line = line.replace(/^\uFEFB/, '').trim();

    // 空行也要保留，用占位符
    if (!line) {
        wordDatabase.push({
            word: '',
            trans: '',
            audio: `esperanto 1000基础词 一词一音/${String(index + 1).padStart(4, '0')}.mp3`
        });
        return;
    }

    // 找到第一个空格分割单词和解释
    const firstSpaceIndex = line.indexOf(' ');
    if (firstSpaceIndex === -1) {
        // 没有空格，整行作为单词
        wordDatabase.push({
            word: line,
            trans: '',
            audio: `esperanto 1000基础词 一词一音/${String(index + 1).padStart(4, '0')}.mp3`
        });
        return;
    }

    const word = line.substring(0, firstSpaceIndex).trim();
    let translation = line.substring(firstSpaceIndex + 1).trim();

    // 处理多解释：按分号或逗号分割，取前两个
    const parts = translation.split(/[;,，；]/).map(p => p.trim()).filter(p => p);
    const trans = parts.length > 0 ? parts.slice(0, 2).join('，') : translation;

    // 音频文件编号（4位数字）- 使用原始行号+1
    const audioNum = String(index + 1).padStart(4, '0');
    const audioPath = `esperanto 1000基础词 一词一音/${audioNum}.mp3`;

    wordDatabase.push({
        word: word,
        trans: trans,
        audio: audioPath
    });
});

// 读取index.html
const htmlFile = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlFile, 'utf-8');

// 生成新的wordDatabase字符串
const dbString = JSON.stringify(wordDatabase, null, 4);
const newWordDB = `const wordDatabase = ${dbString};`;

// 替换index.html中的wordDatabase
html = html.replace(/const wordDatabase = \[[\s\S]*?\];/, newWordDB);

// 写回index.html
fs.writeFileSync(htmlFile, html, 'utf-8');

console.log(`生成完成！`);
console.log(`单词总数: ${wordDatabase.length}`);
console.log(`已更新到 index.html`);
console.log(``);
console.log(`第1个: ${wordDatabase[0].word} - ${wordDatabase[0].trans}`);
console.log(`第1000个: ${wordDatabase[999].word} - ${wordDatabase[999].trans}`);
