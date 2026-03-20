# 爱的教育 - AI驱动的智能学习助手

<div align="center">

![爱的教育](https://img.shields.io/badge/爱的教育-AI学习助手-blue?style=for-the-badge)

**利用AI的文字解读能力和解题能力，将用户上传的题目、书本内容、知识点等内容，让AI解读翻译，再生成相应的讲解视频**

[下载桌面版](#-下载桌面版) · [报告问题](https://github.com/Milky-way520/ai-education/issues) · [功能建议](https://github.com/Milky-way520/ai-education/issues)

</div>

---

## 📥 下载桌面版

### Windows 版本

| 版本 | 说明 | 下载方式 |
|------|------|---------|
| 安装版 | 需要安装，自动创建快捷方式 | 自行打包 |
| 便携版 | 免安装，双击即可运行 | 自行打包 |

### 如何打包

1. 克隆项目到本地
2. 双击运行 `build-windows.bat`
3. 在 `release` 文件夹获取安装包

详细说明请查看 [Windows打包指南](docs/WINDOWS_BUILD.md)

---

## 📖 项目简介

"爱的教育"是一个开源的AI教育平台，旨在帮助学习者更好地理解和掌握各种知识点。当用户遇到难以理解的问题时，可以通过本平台：

1. **上传问题内容**（文字、图片）
2. **1.AI 深度理解**问题并生成详细解释
3. **2.AI 生成教学视频**，直观展示解题过程
4. **下载学习资源**，随时复习

---

## ✨ 核心功能

- 🔥 **双AI协作模式** - 理解型AI + 视频生成AI
- 📝 **多模态输入** - 支持文字、图片上传
- 🛡️ **内容安全审核** - 符合教育伦理标准
- 📚 **多学科支持** - 数学、物理、化学、生物等
- 🎬 **视频生成** - 将抽象知识可视化
- 💾 **本地下载** - 生成的资源可直接保存
- 🖥️ **桌面应用** - 支持Windows安装版/便携版

---

## 🤖 支持的AI模型

### 理解型AI (1.AI)
| 模型 | 提供商 | 特点 |
|------|--------|------|
| GPT-4o | OpenAI | 最强多模态能力 |
| Claude 3.5 | Anthropic | 长文本理解优秀 |
| Gemini Pro | Google | 免费额度多 |
| DeepSeek | 国产 | 性价比极高 |
| 通义千问 | 阿里云 | 中文理解优秀 |

### 视频生成AI (2.AI)
| 模型 | 提供商 | 特点 |
|------|--------|------|
| 可灵AI | 快手 | 国内领先 |
| Runway Gen-3 | Runway | 国际顶尖 |
| Pika Labs | Pika | 创意视频 |

---

## 🛠️ 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui
- **桌面框架**: Electron
- **后端**: Next.js API Routes
- **AI集成**: z-ai-web-dev-sdk
- **数据库**: Prisma ORM + SQLite
- **状态管理**: Zustand

---

## 🚀 快速开始

### 方式一：运行Web版

```bash
# 1. 克隆项目
git clone https://github.com/Milky-way520/ai-education.git

# 2. 进入项目目录
cd ai-education

# 3. 安装依赖
npm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 5. 初始化数据库
npm run db:push

# 6. 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

### 方式二：打包桌面版

Windows用户双击运行 `build-windows.bat` 即可自动打包。

---

## 📁 项目结构

```
ai-education/
├── electron/             # Electron 桌面应用配置
├── src/
│   ├── app/              # Next.js 页面和API路由
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数
│   ├── store/            # 状态管理
│   └── types/            # TypeScript 类型定义
├── prisma/               # 数据库 schema
├── public/               # 静态资源
├── docs/                 # 文档
├── build-windows.bat     # Windows打包脚本
└── package.json
```

---

## ⚙️ 配置说明

### 环境变量

创建 `.env` 文件并配置以下变量：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# AI API Keys（按需配置）
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
DEEPSEEK_API_KEY="your-deepseek-api-key"
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 开源协议

本项目采用 MIT 协议开源 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- 提交 Issue: [GitHub Issues](https://github.com/Milky-way520/ai-education/issues)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给一个 Star！⭐**

Made with ❤️ by 爱的教育团队

</div>
