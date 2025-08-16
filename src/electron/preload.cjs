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
});
