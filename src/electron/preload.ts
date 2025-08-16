import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs de base de datos al renderer de forma segura
contextBridge.exposeInMainWorld('electronAPI', {
  // Operaciones de base de datos
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db-query', sql, params),
    run: (sql: string, params?: any[]) => ipcRenderer.invoke('db-run', sql, params),
    get: (sql: string, params?: any[]) => ipcRenderer.invoke('db-get', sql, params)
  },
  importImage: (): Promise<{ path: string; url: string } | null> => ipcRenderer.invoke('image-import'),
  imageToDataUrl: (fileRef: string): Promise<string | null> => ipcRenderer.invoke('image-read-dataurl', fileRef),
  deleteImage: (fileRef: string): Promise<{ deleted: boolean; reason?: string; error?: string }> => ipcRenderer.invoke('image-delete', fileRef),
});

// Tipado global provisto desde src/ui/types/electron.d.ts
