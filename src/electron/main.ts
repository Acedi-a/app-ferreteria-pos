import {app, BrowserWindow, ipcMain, dialog, shell} from 'electron';
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
    
    // Verificar si el archivo existe antes de intentar leerlo
    try {
      await fsp.access(filePath);
    } catch {
      // Archivo no existe, devolver null silenciosamente
      return null;
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
    // Solo mostrar error si no es un problema de archivo no encontrado
    if ((e as any).code !== 'ENOENT') {
      console.error('image-read-dataurl error:', e);
    }
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

app.on("ready", async ()=> {
  // IMPORTANTE: El preload debe estar en CommonJS y ubicado en dist-electron/preload.cjs
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

    // Backup automático diario (simple): si está habilitado
    try {
      const auto = await dbService.get<{ valor: string }>(`SELECT valor FROM configuracion WHERE clave = 'auto_backup'`);
      if (auto?.valor === 'true') {
        const backupsDir = path.join(app.getPath('userData'), 'backups');
        try { await fsp.mkdir(backupsDir, { recursive: true }); } catch {}
        const fname = `auto-backup-${new Date().toISOString().slice(0,10)}.sqlite`;
        const dest = path.join(backupsDir, fname);
        // Si ya existe el de hoy, omitir
        const exists = await fsp.stat(dest).then(() => true).catch(() => false);
        if (!exists) {
          await dbService.backupTo(dest, 'auto');
          await dbService.run(`UPDATE configuracion SET valor = datetime('now') WHERE clave = 'ultimo_backup'`);
        }
      }
    } catch (e) {
      console.warn('Auto-backup skipped:', e);
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

// IPC: crear backup de la base de datos (elige ruta destino)
ipcMain.handle('db-backup', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showSaveDialog(win!, {
    title: 'Guardar respaldo de base de datos',
    defaultPath: `backup-ferreteria-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`,
    filters: [{ name: 'SQLite', extensions: ['sqlite', 'db'] }]
  });
  if (res.canceled || !res.filePath) return { ok: false, canceled: true };
  try {
  // Asegurar directorio destino
  try { await fsp.mkdir(path.dirname(res.filePath), { recursive: true }); } catch {}
  await dbService.backupTo(res.filePath, 'manual');
    return { ok: true, path: res.filePath };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
});

// IPC: restaurar base de datos desde un archivo (elige origen)
ipcMain.handle('db-restore', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showOpenDialog(win!, {
    title: 'Seleccionar respaldo para restaurar',
    properties: ['openFile'],
    filters: [{ name: 'SQLite', extensions: ['sqlite', 'db'] }]
  });
  if (res.canceled || res.filePaths.length === 0) return { ok: false, canceled: true };
  // Confirmación
  const confirm = await dialog.showMessageBox(win!, {
    type: 'warning',
    title: 'Confirmar restauración',
    message: 'Se reemplazará la base de datos actual por el respaldo seleccionado. ¿Desea continuar?',
    buttons: ['Cancelar', 'Restaurar'],
    cancelId: 0,
    defaultId: 1
  });
  if (confirm.response !== 1) return { ok: false, canceled: true };
  try {
    await dbService.restoreFrom(res.filePaths[0]);
    // Reiniciar app automáticamente
    app.relaunch();
    app.exit(0);
    return { ok: true, path: res.filePaths[0], restarted: true };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
});

// IPC: mostrar un archivo en el explorador
ipcMain.handle('reveal-in-folder', async (_evt, filePath: string) => {
  try {
    if (!filePath) return { ok: false, error: 'missing-path' };
    shell.showItemInFolder(filePath);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
});

// IPC: restaurar directamente desde una ruta (sin diálogo)
ipcMain.handle('db-restore-from-path', async (_evt, filePath: string) => {
  try {
    if (!filePath) return { ok: false, error: 'missing-path' };
    await dbService.restoreFrom(filePath);
    // Relanzar aplicación para asegurar estado limpio
    app.relaunch();
    app.exit(0);
    return { ok: true, path: filePath };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
});