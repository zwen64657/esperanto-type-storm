# Esperanto Type Storm - 技术文档

## 项目概述

**Esperanto Type Storm（世界语打字风暴）** 是一个基于 Web 的打字游戏，玩家通过输入屏幕上掉落的世界语单词来得分，同时学习世界语词汇。

### 核心特性
- 霓虹赛博朋克风格视觉设计
- 三种难度等级（简单/普通/困难）
- 世界语单词发音学习
- 本地最高分记录
- 游戏进度保存/恢复功能
- 背景音乐与音效系统

---

## 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式与动画（霓虹发光效果、网格动画） |
| Vanilla JavaScript | 游戏逻辑，无框架依赖 |
| Canvas API | 游戏渲染（单词、粒子效果） |
| Web Audio API | 音效合成 |
| Speech Synthesis API | 单词发音（TTS） |
| LocalStorage | 存档与最高分保存 |

---

## 文件结构

```
世界语打字游戏/
├── index.html          # 单文件应用（包含HTML/CSS/JS）
└── audio/              # 音频文件夹（可选，用于存放本地发音文件）
    ├── saluton.mp3
    ├── amiko.mp3
    └── ...
```

---

## 核心模块

### 1. 游戏配置

#### 单词数据库 `wordDatabase`
```javascript
const wordDatabase = [
    { word: "saluton", trans: "你好", audio: "saluton.mp3" },
    { word: "amiko", trans: "朋友", audio: "amiko.mp3" },
    // ... 更多单词
];
```

#### 难度配置 `difficulties`
| 难度 | 下落速度 | 生成间隔(ms) | 分数倍率 |
|------|----------|--------------|----------|
| easy | 1.0 | 2000 | 1x |
| medium | 2.0 | 1500 | 2x |
| hard | 3.5 | 1000 | 3x |

### 2. 游戏状态 `gameState`

```javascript
{
    isPlaying: boolean,    // 游戏是否运行中
    isPaused: boolean,     // 是否暂停
    score: number,         // 当前分数
    health: number,        // 生命值 (0-100)
    difficulty: string,    // 当前难度
    words: Word[],         // 屏幕上的单词对象
    particles: Particle[], // 爆炸粒子效果
    spawnRate: number,     // 单词生成间隔
    fallSpeed: number      // 下落速度
}
```

### 3. 核心类

#### `Word` 类 - 单词对象
```javascript
class Word {
    constructor(diff) {
        this.text   // 世界语单词
        this.trans  // 中文翻译
        this.data   // 原始数据（用于发音）
        this.x, this.y   // 位置坐标
        this.speed  // 下落速度
        this.color  // 颜色
    }
    update()  // 更新位置
    draw()    // 绘制到Canvas
}
```

#### `Particle` 类 - 爆炸粒子
```javascript
class Particle {
    constructor(x, y) {
        this.x, this.y    // 位置
        this.vx, this.vy  // 速度向量
        this.life         // 生命周期 (1.0 → 0)
        this.color        // 随机颜色
    }
    update()  // 更新位置与生命周期
    draw()    // 绘制粒子
}
```

---

## 游戏流程

```
┌─────────────────────────────────────────────────────────────┐
│                         开始菜单                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐   │
│  │  简单   │  │  普通   │  │  困难   │  │ 继续上次进度 │   │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         游戏循环                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 根据生成间隔创建新单词                            │   │
│  │  2. 更新所有单词位置                                  │   │
│  │  3. 检测触底（扣血）                                  │   │
│  │  4. 更新粒子效果                                      │   │
│  │  5. 渲染画面                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│        ┌─────────────────┼─────────────────┐                │
│        ▼                 ▼                 ▼                │
│   ┌─────────┐      ┌─────────┐      ┌──────────┐           │
│   │ 输入匹配 │      │  触底   │      │ 暂停ESC  │           │
│   │ 加分+音效│      │  扣血   │      │ 保存进度 │           │
│   └─────────┘      └─────────┘      └──────────┘           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │   GAME OVER │
                    │  显示最终分数│
                    │  保存最高分 │
                    └─────────────┘
```

---

## 主要函数说明

### 游戏控制

| 函数 | 说明 |
|------|------|
| `startGame(diff)` | 开始新游戏，重置状态 |
| `restartGame()` | 重新开始当前难度 |
| `togglePause()` | 暂停/继续游戏 |
| `gameOver()` | 游戏结束处理 |

### 存档系统

| 函数 | 说明 |
|------|------|
| `saveProgress()` | 保存当前状态到 localStorage |
| `checkSavedProgress()` | 检查是否有存档，显示/隐藏继续按钮 |
| `resumeGame()` | 恢复存档继续游戏 |

**存档数据结构：**
```javascript
{
    score: number,
    health: number,
    difficulty: string,
    words: [{ text, trans, x, y, speed }],
    timestamp: number
}
```

### 音频系统

| 函数 | 说明 |
|------|------|
| `playWordAudio(wordData)` | 播放单词发音（支持本地文件或TTS） |
| `playSoundEffect(type)` | 播放合成音效（hit/damage） |

### 渲染循环

```javascript
function gameLoop(timestamp) {
    // 计算 deltaTime
    // 生成新单词
    // 更新/绘制单词
    // 更新/绘制粒子
    requestAnimationFrame(gameLoop);
}
```

---

## 输入处理

```javascript
inputEl.addEventListener('input', (e) => {
    // 获取输入内容
    // 匹配屏幕上的单词（优先匹配最底部的）
    // 匹配成功：播放发音、创建特效、加分
});
```

**匹配逻辑：**
1. 获取输入框内容并转小写
2. 遍历屏幕上所有单词
3. 优先匹配 Y 坐标最大（最接近底部）的单词
4. 匹配成功后清空输入框

---

## 视觉效果

### CSS 动画

| 效果 | 实现 |
|------|------|
| 背景网格 | `perspective` + `rotateX` + `translateY` 动画 |
| 霓虹发光 | `text-shadow` + `box-shadow` |
| 震动效果 | `@keyframes shake` 动画 |
| 模糊背景 | `backdrop-filter: blur(5px)` |

### Canvas 效果

| 效果 | 实现方式 |
|------|----------|
| 单词发光 | `ctx.shadowBlur` + `ctx.shadowColor` |
| 爆炸粒子 | 粒子系统，随机速度和颜色 |
| 双语显示 | 主单词大字 + 翻译小字 |

---

## 扩展指南

### 添加新单词

编辑 `wordDatabase` 数组：

```javascript
{ word: "nova", trans: "新的", audio: "nova.mp3" }
```

### 使用本地音频文件

1. 在项目目录创建 `audio/` 文件夹
2. 放入对应的 `.mp3` 文件
3. 修改 `playWordAudio()` 函数，取消注释本地文件部分

### 添加新难度

编辑 `difficulties` 对象：

```javascript
nightmare: { speed: 5.0, spawnRate: 600, scoreMult: 5 }
```

### 自定义样式

修改 CSS `:root` 变量：

```css
:root {
    --primary: #00f3ff;    /* 主色调 */
    --secondary: #ff00ff;  /* 辅色调 */
    --bg-color: #050510;   /* 背景色 */
}
```

---

## 已知问题 & 修复

### Bug 修复记录

| 问题 | 修复方案 |
|------|----------|
| 难度显示与音乐开关重叠 | 将 `hud-top` 改为左对齐，使用 `score-section` 垂直布局 |

---

## 快捷键

| 按键 | 功能 |
|------|------|
| ESC | 暂停/保存游戏 |

---

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持（需用户交互后播放音频）

---

## 开发者

- 创建日期: 2025
- 技术文档版本: 1.0
