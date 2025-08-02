import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs de base de datos al renderer de forma segura
contextBridge.exposeInMainWorld('electronAPI', {
  // Operaciones de base de datos
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db-query', sql, params),
    run: (sql: string, params?: any[]) => ipcRenderer.invoke('db-run', sql, params),
    get: (sql: string, params?: any[]) => ipcRenderer.invoke('db-get', sql, params)
  }
});

// Tipos para TypeScript
export interface ElectronAPI {
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<{ id?: number; changes: number }>;
    get: (sql: string, params?: any[]) => Promise<any>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
