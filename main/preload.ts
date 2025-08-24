import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  notebook: {
    readFile: (filePath: string) => ipcRenderer.invoke('notebook:readFile', filePath),
    saveFile: (filePath: string, content: string) => ipcRenderer.invoke('notebook:saveFile', filePath, content),
  },
  filesystem: {
    getItemsInPath: (path: string) => ipcRenderer.invoke('fs:getItemsInPath', path),
    createFolder: (path: string, folderName: string) => ipcRenderer.invoke('fs:createFolder', path, folderName),
    createFile: (path: string, fileName: string) => ipcRenderer.invoke('fs:createFile', path, fileName),
    deleteItem: (path: string) => ipcRenderer.invoke('fs:deleteItem', path),
    renameItem: (path: string, newName: string) => ipcRenderer.invoke('fs:renameItem', path, newName),
    readAppFile: (path: string) => ipcRenderer.invoke('fs:readAppFile', path),
  },
  sftp: {
    connect: (config: any) => ipcRenderer.invoke('sftp:connect', config),
    disconnect: (sessionId: string) => ipcRenderer.invoke('sftp:disconnect', sessionId),
    list: (sessionId: string, path: string) => ipcRenderer.invoke('sftp:list', sessionId, path),
    download: (sessionId: string, path: string) => ipcRenderer.invoke('sftp:download', sessionId, path),
  },
  launcher: {
    launchExternal: (path: string) => ipcRenderer.invoke('launcher:launchExternal', path),
  },
  appStore: {
    discoverApps: () => ipcRenderer.invoke('appStore:discover'),
    installApp: (app: any) => ipcRenderer.invoke('appStore:install', app),
    getInstalledApps: () => ipcRenderer.invoke('appStore:getInstalled'),
  },
  ssh: {
    connect: (instanceId: string, config: any) => ipcRenderer.invoke('ssh:connect', instanceId, config),
    disconnect: (sessionId: string) => ipcRenderer.send('ssh:disconnect', sessionId),
    sendData: (sessionId: string, data: string) => ipcRenderer.send('ssh:data', sessionId, data),
    resize: (sessionId: string, dims: { cols: number, rows: number }) => ipcRenderer.send('ssh:resize', sessionId, dims),
    onData: (instanceId: string, callback: (data: string) => void) =>
      ipcRenderer.on(`ssh:data:${instanceId}`, (_event, data) => callback(data)),
    onError: (instanceId: string, callback: (error: string) => void) =>
      ipcRenderer.on(`ssh:error:${instanceId}`, (_event, error) => callback(error)),
    onClose: (instanceId: string, callback: () => void) =>
      ipcRenderer.on(`ssh:close:${instanceId}`, () => callback()),
    offData: (instanceId: string) => ipcRenderer.removeAllListeners(`ssh:data:${instanceId}`),
    offError: (instanceId: string) => ipcRenderer.removeAllListeners(`ssh:error:${instanceId}`),
    offClose: (instanceId: string) => ipcRenderer.removeAllListeners(`ssh:close:${instanceId}`),
  },
}

// Securely expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
} catch (error) {
  console.error('Failed to expose electronAPI to the main world.', error)
}
