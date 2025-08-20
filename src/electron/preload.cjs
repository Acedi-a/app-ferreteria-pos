const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  db: {
    query: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    run: (sql, params) => ipcRenderer.invoke('db-run', sql, params),
    get: (sql, params) => ipcRenderer.invoke('db-get', sql, params)
  },
  importImage: () => ipcRenderer.invoke('image-import'),
  imageToDataUrl: (fileRef) => ipcRenderer.invoke('image-read-dataurl', fileRef)
  ,deleteImage: (fileRef) => ipcRenderer.invoke('image-delete', fileRef)
  ,printHtml: (payload) => ipcRenderer.invoke('print-html', payload)
  ,backupDb: () => ipcRenderer.invoke('db-backup')
  ,restoreDb: () => ipcRenderer.invoke('db-restore')
  ,revealInFolder: (filePath) => ipcRenderer.invoke('reveal-in-folder', filePath)
  ,restoreDbFromPath: (filePath) => ipcRenderer.invoke('db-restore-from-path', filePath)
});
