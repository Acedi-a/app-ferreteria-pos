import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDev } from './utils.js';
import { dbService } from './database.js';

type test = string;

// Definir __dirname para ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// IPC handlers para operaciones de base de datos
ipcMain.handle('db-query', async (event, sql: string, params: any[] = []) => {
  try {
    return await dbService.query(sql, params);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('db-run', async (event, sql: string, params: any[] = []) => {
  try {
    return await dbService.run(sql, params);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('db-get', async (event, sql: string, params: any[] = []) => {
  try {
    return await dbService.get(sql, params);
  } catch (error) {
    throw error;
  }
});

app.on("ready",()=> {
    // Usar preload CommonJS. En desarrollo cargamos directamente desde src; en producción desde dist-electron
    const preloadPath = isDev()
      ? path.join(process.cwd(), 'src', 'electron', 'preload.cjs')
      : path.join(__dirname, 'preload.cjs');

    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath
        }
    });
    
    if (isDev()){
        mainWindow.loadURL('http://localhost:5123')
    }
    else{
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
})

app.on('window-all-closed', () => {
  dbService.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});