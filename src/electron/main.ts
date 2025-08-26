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
      filePath = fileURLToPath(fileRef);
    }
    
    // Verificar si el archivo existe antes de intentar leerlo
    try {
      await fsp.access(filePath);

    } catch {
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
      filePath = fileURLToPath(fileRef);
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
  console.log('User Data Path:', app.getPath('userData'));
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

    // Configurar backup automático programado
    try {
      await configurarBackupAutomatico();
    } catch (e) {
      console.warn('Auto-backup configuration failed:', e);
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

// Variables para el sistema de backup programado
let backupInterval: NodeJS.Timeout | null = null;
let nextBackupTime: Date | null = null;

// Función para configurar el backup automático
async function configurarBackupAutomatico() {
  try {
    // Limpiar intervalo anterior si existe
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }

    // Obtener configuraciones
    const configs = await Promise.all([
      dbService.get<{ valor: string }>(`SELECT valor FROM configuracion WHERE clave = 'auto_backup'`),
      dbService.get<{ valor: string }>(`SELECT valor FROM configuracion WHERE clave = 'backup_frecuencia'`),
      dbService.get<{ valor: string }>(`SELECT valor FROM configuracion WHERE clave = 'backup_hora'`)
    ]);

    const autoBackup = configs[0]?.valor === 'true';
    const frecuencia = configs[1]?.valor || 'diario';
    const hora = configs[2]?.valor || '02:00';

    if (!autoBackup) {
      console.log('Backup automático deshabilitado');
      return;
    }

    // Calcular próximo backup
    nextBackupTime = calcularProximoBackup(frecuencia, hora);
    console.log(`Próximo backup programado para: ${nextBackupTime.toLocaleString()}`);

    // Configurar intervalo para verificar cada minuto
    backupInterval = setInterval(async () => {
      const ahora = new Date();
      if (nextBackupTime && ahora >= nextBackupTime) {
        await ejecutarBackupProgramado();
        // Recalcular próximo backup
        nextBackupTime = calcularProximoBackup(frecuencia, hora);
        console.log(`Próximo backup programado para: ${nextBackupTime.toLocaleString()}`);
      }
    }, 60000); // Verificar cada minuto

  } catch (e) {
    console.error('Error configurando backup automático:', e);
  }
}

// Función para calcular el próximo momento de backup
function calcularProximoBackup(frecuencia: string, hora: string): Date {
  const [horas, minutos] = hora.split(':').map(Number);
  const ahora = new Date();
  let proximoBackup = new Date();
  
  proximoBackup.setHours(horas, minutos, 0, 0);
  
  // Si ya pasó la hora de hoy, programar para el próximo período
  if (proximoBackup <= ahora) {
    switch (frecuencia) {
      case 'diario':
        proximoBackup.setDate(proximoBackup.getDate() + 1);
        break;
      case 'semanal':
        // Programar para el próximo domingo
        const diasHastaDomingo = (7 - proximoBackup.getDay()) % 7;
        proximoBackup.setDate(proximoBackup.getDate() + (diasHastaDomingo || 7));
        break;
      case 'mensual':
        // Programar para el día 1 del próximo mes
        proximoBackup.setMonth(proximoBackup.getMonth() + 1, 1);
        break;
    }
  } else {
    // Si no ha pasado la hora de hoy, verificar si corresponde según la frecuencia
    switch (frecuencia) {
      case 'semanal':
        // Solo los domingos (día 0)
        if (proximoBackup.getDay() !== 0) {
          const diasHastaDomingo = (7 - proximoBackup.getDay()) % 7;
          proximoBackup.setDate(proximoBackup.getDate() + (diasHastaDomingo || 7));
        }
        break;
      case 'mensual':
        // Solo el día 1 del mes
        if (proximoBackup.getDate() !== 1) {
          proximoBackup.setMonth(proximoBackup.getMonth() + 1, 1);
        }
        break;
    }
  }
  
  return proximoBackup;
}

// Función para ejecutar el backup programado
async function ejecutarBackupProgramado() {
  try {
    console.log('Ejecutando backup automático programado...');
    
    const backupsDir = path.join(app.getPath('userData'), 'backups');
    await fsp.mkdir(backupsDir, { recursive: true });
    
    // Obtener frecuencia para el nombre del archivo
    const frecuenciaConfig = await dbService.get<{ valor: string }>(`SELECT valor FROM configuracion WHERE clave = 'backup_frecuencia'`);
    const frecuencia = frecuenciaConfig?.valor || 'diario';
    
    const fecha = new Date().toISOString().slice(0, 10);
    const fname = `auto-backup-${frecuencia}-${fecha}.sqlite`;
    const dest = path.join(backupsDir, fname);
    
    // Verificar si ya existe backup para evitar duplicados
    const exists = await fsp.stat(dest).then(() => true).catch(() => false);
    if (!exists) {
      await dbService.backupTo(dest, 'auto');
      await dbService.run(`UPDATE configuracion SET valor = ? WHERE clave = 'ultimo_backup'`, [new Date().toISOString()]);
      console.log(`Backup automático completado: ${fname}`);
    } else {
      console.log(`Backup ya existe para hoy: ${fname}`);
    }
    
  } catch (e) {
    console.error('Error ejecutando backup automático:', e);
  }
}

// Reconfigurar backup cuando cambien las configuraciones
ipcMain.handle('reconfigurar-backup', async () => {
  try {
    await configurarBackupAutomatico();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e) };
  }
});