# Windows桌面版打包指南

## 方式一：自动打包（推荐）

### 前置要求
- Windows 10/11 64位系统
- Node.js 18+ ([下载地址](https://nodejs.org/))

### 操作步骤

1. **下载项目**
   ```bash
   git clone https://github.com/Milky-way520/ai-education.git
   cd ai-education
   ```

2. **双击运行 `build-windows.bat`**

   脚本会自动完成：
   - 安装依赖
   - 构建项目
   - 打包成exe

3. **获取安装包**
   
   打包完成后，在 `release` 文件夹中可以找到：
   - `爱的教育 Setup 1.0.0.exe` - 安装版
   - `爱的教育-1.0.0-Portable.exe` - 便携版（免安装）

---

## 方式二：手动打包

```bash
# 1. 安装依赖
npm install

# 2. 生成Prisma客户端
npx prisma generate

# 3. 构建项目
npm run build

# 4. 打包（安装版+便携版）
npx electron-builder --win --x64

# 或者只打包便携版
npx electron-builder --win portable --x64
```

---

## 打包产物说明

| 文件 | 大小 | 说明 |
|------|------|------|
| `爱的教育 Setup 1.0.0.exe` | ~150MB | 安装版，需要安装才能使用 |
| `爱的教育-1.0.0-Portable.exe` | ~150MB | 便携版，双击即可运行 |

---

## 首次运行配置

打包完成后，首次运行软件需要配置AI API：

1. 点击右上角 **设置图标⚙️**
2. 选择您要使用的AI模型
3. 填入对应的API Key
4. 保存设置

### 获取API Key

| AI模型 | 获取地址 |
|--------|---------|
| OpenAI (GPT-4o) | https://platform.openai.com/api-keys |
| DeepSeek | https://platform.deepseek.com/ |
| 通义千问 | https://dashscope.console.aliyun.com/ |

---

## 常见问题

### Q: 打包失败提示"node-gyp"错误？
A: 需要安装Visual Studio Build Tools：
```bash
npm install --global windows-build-tools
```

### Q: 运行时提示"无法连接服务器"？
A: 检查防火墙是否阻止了应用，添加信任即可。

### Q: 如何更新应用？
A: 重新下载最新版本的安装包或便携版覆盖即可。

---

## 技术架构

```
爱的教育.exe
    ├── Electron (桌面框架)
    ├── Next.js (Web框架)
    ├── Prisma + SQLite (本地数据库)
    └── AI API (云端服务)
```

应用启动时会自动启动本地服务器（端口3000），然后在Electron窗口中加载。
