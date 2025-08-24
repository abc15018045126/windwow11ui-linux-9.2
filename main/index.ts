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
  const sshConnections = new Map<string, { conn: Client, stream: any, window: BrowserWindow }>();

  ipcMain.handle('ssh:connect', (event, instanceId, config) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return { success: false, error: 'Window not found' };

    return new Promise((resolve) => {
      const conn = new Client();
      const sessionId = `ssh-session-${Date.now()}`;

      conn.on('ready', () => {
        conn.shell({ term: 'xterm-256color' }, (err, stream) => {
          if (err) {
            return resolve({ success: false, error: err.message });
          }

          sshConnections.set(sessionId, { conn, stream, window });

          stream.on('close', () => {
            window.webContents.send(`ssh:close:${instanceId}`);
            conn.end();
          }).on('data', (data: Buffer) => {
            window.webContents.send(`ssh:data:${instanceId}`, data.toString('utf8'));
          }).stderr.on('data', (data: Buffer) => {
            window.webContents.send(`ssh:data:${instanceId}`, data.toString('utf8'));
          });

          resolve({ success: true, sessionId });
        });
      }).on('error', (err) => {
        resolve({ success: false, error: `Connection Error: ${err.message}` });
      }).on('close', () => {
        sshConnections.delete(sessionId);
        window.webContents.send(`ssh:close:${instanceId}`);
      }).connect({
        ...config,
        port: parseInt(config.port, 10) || 22,
        readyTimeout: 20000,
      });
    });
  });

  ipcMain.on('ssh:data', (_event, sessionId: string, data: string) => {
    const connection = sshConnections.get(sessionId);
    if (connection && connection.stream) {
      connection.stream.write(data);
    }
  });

  ipcMain.on('ssh:resize', (_event, sessionId: string, { cols, rows }) => {
    const connection = sshConnections.get(sessionId);
    if (connection && connection.stream) {
      connection.stream.setWindow(rows, cols);
    }
  });

  ipcMain.on('ssh:disconnect', (_event, sessionId: string) => {
    const connection = sshConnections.get(sessionId);
    if (connection && connection.conn) {
      connection.conn.end();
    }
    sshConnections.delete(sessionId);
  });


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
