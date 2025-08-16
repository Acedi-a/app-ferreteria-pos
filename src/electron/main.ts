import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { isDev } from './utils.js';
import { dbService } from './database.js';
import fs from 'fs';
import { promises as fsp } from 'fs';

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

// IPC para importar imagen de producto: abre diálogo, copia a carpeta de la app y retorna file:// URL
ipcMain.handle('image-import', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showOpenDialog(win!, {
    title: 'Seleccionar imagen de producto',
    properties: ['openFile'],
    filters: [
      { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
    ],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  const sourcePath = res.filePaths[0];
  const imagesDir = path.join(app.getPath('userData'), 'product-images');
  try { await fsp.mkdir(imagesDir, { recursive: true }); } catch {}
  const base = path.basename(sourcePath);
  const time = Date.now();
  const destName = `${time}-${base}`;
  const destPath = path.join(imagesDir, destName);
  await new Promise<void>((resolve, reject) => {
    const rs = fs.createReadStream(sourcePath);
    const ws = fs.createWriteStream(destPath);
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('close', () => resolve());
    rs.pipe(ws);
  });
  const fileUrl = pathToFileURL(destPath).toString();
  return { path: destPath, url: fileUrl };
});

// IPC para devolver una imagen como Data URL desde una ruta o file:// URL
ipcMain.handle('image-read-dataurl', async (event, fileRef: string) => {
  try {
    let filePath = fileRef;
    if (fileRef.startsWith('file://')) {
      // Convertir file:// a ruta local
      const u = new URL(fileRef);
      filePath = u.pathname;
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        // Quitar el prefijo '/' en Windows
        filePath = filePath.slice(1);
      }
    }
    const buf = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mime = ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'gif' ? 'image/gif'
      : ext === 'webp' ? 'image/webp'
      : 'application/octet-stream';
    const base64 = buf.toString('base64');
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.error('image-read-dataurl error:', e);
    return null;
  }
});

// IPC para eliminar una imagen previamente copiada (limpieza)
ipcMain.handle('image-delete', async (event, fileRef: string) => {
  try {
    const imagesDir = path.join(app.getPath('userData'), 'product-images');
    let filePath = fileRef;
    if (fileRef.startsWith('file://')) {
      const u = new URL(fileRef);
      filePath = u.pathname;
      if (process.platform === 'win32' && filePath.startsWith('/')) filePath = filePath.slice(1);
    }
    const resolved = path.resolve(filePath);
    const allowedRoot = path.resolve(imagesDir);
    // Asegurar que el archivo esté dentro del directorio permitido
    if (!resolved.startsWith(allowedRoot)) {
      return { deleted: false, reason: 'outside-allowed-dir' };
    }
    await fsp.unlink(resolved).catch((e: any) => {
      if (e && e.code === 'ENOENT') return; // ya no existe
      throw e;
    });
    return { deleted: true };
  } catch (e) {
    console.error('image-delete error:', e);
    return { deleted: false, error: String(e) };
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
    // En producción, app.getAppPath() apunta dentro del asar; usar ruta relativa a __dirname
    const indexProd = path.join(__dirname, '..', 'dist-react', 'index.html');
    mainWindow.loadFile(indexProd);
  }
})

app.on('window-all-closed', () => {
  dbService.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC para imprimir HTML en impresora térmica (80mm por defecto)
ipcMain.handle('print-html', async (event, payload: { html: string; widthMm?: number; deviceName?: string; silent?: boolean; title?: string }) => {
  const { html, widthMm = 80, deviceName, silent = true, title = 'Ticket' } = payload || {};
  if (!html) return { ok: false, error: 'missing-html' };
  // Crear una ventana oculta para cargar el contenido
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
    title
  });

  const content = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  await win.loadURL(content);

  return new Promise((resolve) => {
    const mmToMicrons = (mm: number) => Math.max(1, Math.round(mm * 1000));
    // Altura dinámica grande; la impresora corta según contenido
    const printOpts: Electron.WebPreferences & any = {
      silent,
      printBackground: true,
      deviceName: deviceName || undefined,
      margins: { marginType: 'none' },
      pageSize: { width: mmToMicrons(widthMm), height: mmToMicrons(297) },
    };
    win.webContents.print(printOpts, (success, failureReason) => {
      try { win.close(); } catch {}
      if (!success) return resolve({ ok: false, error: failureReason || 'print-failed' });
      resolve({ ok: true });
    });
  });
});