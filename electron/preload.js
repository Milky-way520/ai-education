const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露API
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getVersion: () => ipcRenderer.invoke('get-app-version'),

  // 显示保存对话框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // 显示打开对话框
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // 监听菜单事件
  onMenuNew: (callback) => {
    ipcRenderer.on('menu-new', callback);
    return () => ipcRenderer.removeListener('menu-new', callback);
  },

  // 平台信息
  platform: process.platform,
  isElectron: true,
});
