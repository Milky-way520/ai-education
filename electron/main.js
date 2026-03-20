const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

// 判断是否是开发模式
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 服务器端口
const SERVER_PORT = 3000;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: '爱的教育 - AI智能学习助手',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // 窗口样式
    frame: true,
    backgroundColor: '#ffffff',
    show: false, // 先隐藏，加载完成后显示
  });

  // 加载应用
  if (isDev) {
    // 开发模式：加载开发服务器
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载本地服务器
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // 启动时最大化
    mainWindow.maximize();
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 启动内部服务器（生产模式）
function startServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      console.log('开发模式：请确保已运行 npm run dev');
      resolve();
      return;
    }

    // 生产模式下的服务器路径
    const serverPath = path.join(
      process.resourcesPath,
      'server',
      'server.js'
    );

    console.log('启动服务器:', serverPath);
    console.log('资源目录:', process.resourcesPath);

    // 检查服务器文件是否存在
    if (!fs.existsSync(serverPath)) {
      console.error('服务器文件不存在:', serverPath);
      // 列出资源目录内容
      try {
        const files = fs.readdirSync(process.resourcesPath);
        console.log('资源目录内容:', files);
      } catch (e) {
        console.log('无法读取资源目录');
      }
      reject(new Error('服务器文件不存在'));
      return;
    }

    serverProcess = spawn('node', [serverPath], {
      cwd: path.dirname(serverPath),
      env: {
        ...process.env,
        PORT: SERVER_PORT.toString(),
        NODE_ENV: 'production',
        DATABASE_URL: `file:${path.join(process.resourcesPath, 'db', 'dev.db')}`,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`服务器: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`服务器错误: ${data}`);
    });

    serverProcess.on('error', (err) => {
      console.error('启动服务器失败:', err);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`服务器退出，代码: ${code}`);
    });

    // 等待服务器启动
    const waitForServer = () => {
      const http = require('http');
      const req = http.get(`http://localhost:${SERVER_PORT}`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          console.log('服务器已就绪');
          resolve();
        } else {
          setTimeout(waitForServer, 500);
        }
      });
      req.on('error', () => {
        setTimeout(waitForServer, 500);
      });
      req.end();
    };

    // 开始等待服务器
    setTimeout(waitForServer, 1000);
  });
}

// 停止服务器
function stopServer() {
  if (serverProcess) {
    console.log('停止服务器...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建问题',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-new');
            }
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forceReload', label: '强制刷新' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于爱的教育',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于爱的教育',
              message: '爱的教育 - AI智能学习助手',
              detail: `版本: ${app.getVersion()}\n\n利用AI的文字解读能力和解题能力，帮助用户理解学习难点。\n\n© 2024 爱的教育团队`,
              buttons: ['确定'],
            });
          },
        },
        {
          label: '查看GitHub',
          click: () => {
            shell.openExternal('https://github.com/Milky-way520/ai-education');
          },
        },
        {
          label: '检查更新',
          click: () => {
            shell.openExternal('https://github.com/Milky-way520/ai-education/releases');
          },
        },
      ],
    },
  ];

  // 开发模式添加开发者工具
  if (isDev) {
    template[2].submenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools', label: '开发者工具' }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 应用启动
app.whenReady().then(async () => {
  try {
    console.log('应用启动中...');
    console.log('是否开发模式:', isDev);
    
    await startServer();
    createMenu();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('启动失败:', error);
    dialog.showErrorBox('启动失败', `应用启动失败: ${error.message}\n\n请尝试重新安装应用。`);
    app.quit();
  }
});

// 所有窗口关闭时退出
app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  stopServer();
});

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});
