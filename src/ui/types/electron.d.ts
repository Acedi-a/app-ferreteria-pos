// Tipos para las APIs de Electron expuestas al renderer
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

export {};
