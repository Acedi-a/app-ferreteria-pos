// Tipos para las APIs de Electron expuestas al renderer
export interface ElectronAPI {
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<{ id?: number; changes: number }>;
    get: (sql: string, params?: any[]) => Promise<any>;
  };
  importImage: () => Promise<{ path: string; url: string } | null>;
  imageToDataUrl: (fileRef: string) => Promise<string | null>;
  deleteImage: (fileRef: string) => Promise<{ deleted: boolean; reason?: string; error?: string }>;
  printHtml: (payload: { html: string; widthMm?: number; deviceName?: string; silent?: boolean; title?: string }) => Promise<{ ok: boolean; error?: string }>;
  backupDb: () => Promise<{ ok: boolean; path?: string; error?: string; canceled?: boolean }>;
  restoreDb: () => Promise<{ ok: boolean; path?: string; error?: string; canceled?: boolean }>;
  revealInFolder: (filePath: string) => Promise<{ ok: boolean; error?: string }>;
  restoreDbFromPath: (filePath: string) => Promise<{ ok: boolean; error?: string; path?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
