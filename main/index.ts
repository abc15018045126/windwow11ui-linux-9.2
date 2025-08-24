import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { Client } from 'ssh2'
import { Notebook_v1_readFile, Notebook_v1_saveFile } from '../services/api/notebook'
import { SFTP_v1_listDirectory, SFTP_v1_downloadFile } from '../services/api/sftp'
import { Launcher_v1_launchExternal } from '../services/api/launcher'
import { AppStore_v1_discoverAvailableApps, AppStore_v1_installExternalApp, AppStore_v1_getInstalledExternalApps } from '../services/api/appStore'
import { startApiServer } from './server'
import {
  Filesystem_v1_getItemsInPath,
  Filesystem_v1_createFolder,
  Filesystem_v1_createFile,
  Filesystem_v1_deleteItem,
  Filesystem_v1_renameItem,
  Filesystem_v1_readAppFile,
} from '../services/api/filesystem'

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = 'http://localhost:5173'

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (!app.isPackaged) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '..', 'window', 'index.html');
    win.loadFile(indexPath);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  const appService = startApiServer();

  const sftpConnections = new Map<string, { client: Client, sftp: any }>();

  ipcMain.handle('sftp:connect', (_event, config) => {
    return new Promise((resolve) => {
      const client = new Client();
      const sessionId = `sftp-session-${Date.now()}`;

      client.on('ready', () => {
        client.sftp((err: any, sftp: any) => {
          if (err) {
            resolve({ success: false, error: err.message });
            return;
          }
          sftpConnections.set(sessionId, { client, sftp });
          resolve({ success: true, sessionId });
        });
      });

      client.on('error', (err: any) => {
        resolve({ success: false, error: err.message });
      });

      client.on('close', () => {
        sftpConnections.delete(sessionId);
      });

      client.connect({
        ...config,
        port: parseInt(config.port, 10) || 22,
      });
    });
  });

  ipcMain.handle('sftp:disconnect', (_event, sessionId: string) => {
    const conn = sftpConnections.get(sessionId);
    if (conn) {
      conn.client.end();
      sftpConnections.delete(sessionId);
    }
  });

  ipcMain.handle('sftp:list', (_event, sessionId: string, path: string) => {
    const conn = sftpConnections.get(sessionId);
    if (conn) {
      return SFTP_v1_listDirectory(conn.sftp, path);
    }
    return null;
  });

  ipcMain.handle('sftp:download', (_event, sessionId: string, path: string) => {
    const conn = sftpConnections.get(sessionId);
    if (conn) {
      return SFTP_v1_downloadFile(conn.sftp, path);
    }
    return null;
  });

  const virtualFsPath = path.join(process.cwd(), 'virtual-fs', 'Desktop');
  if (!fs.existsSync(virtualFsPath)) {
    fs.mkdirSync(virtualFsPath, { recursive: true });
  }

  ipcMain.handle('notebook:readFile', (_event, filePath: string) => Notebook_v1_readFile(filePath));
  ipcMain.handle('notebook:saveFile', (_event, filePath: string, content: string) => Notebook_v1_saveFile(filePath, content));

  ipcMain.handle('fs:getItemsInPath', (_event, path: string) => Filesystem_v1_getItemsInPath(path));
  ipcMain.handle('fs:createFolder', (_event, path: string, folderName: string) => Filesystem_v1_createFolder(path, folderName));
  ipcMain.handle('fs:createFile', (_event, path: string, fileName: string) => Filesystem_v1_createFile(path, fileName));
  ipcMain.handle('fs:deleteItem', (_event, path: string) => Filesystem_v1_deleteItem(path));
  ipcMain.handle('fs:renameItem', (_event, path: string, newName: string) => Filesystem_v1_renameItem(path, newName));
  ipcMain.handle('fs:readAppFile', (_event, path: string) => Filesystem_v1_readAppFile(path));

  ipcMain.handle('launcher:launchExternal', (_event, path: string) => Launcher_v1_launchExternal(path));

  // Register IPC handlers for App Store, passing the appService instance
  ipcMain.handle('appStore:discover', () => {
    return AppStore_v1_discoverAvailableApps(appService);
  });
  ipcMain.handle('appStore:install', (_event, app) => {
    return AppStore_v1_installExternalApp(appService, app);
  });
  ipcMain.handle('appStore:getInstalled', () => {
    return AppStore_v1_getInstalledExternalApps(appService);
  });

  createWindow()
})
