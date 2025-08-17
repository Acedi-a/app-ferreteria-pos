import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { promises as fsp } from 'fs';

export class DatabaseService {
  private db: sqlite3.Database | null = null;
  private dbPath!: string;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // Usar directorio de datos del usuario para lectura/escritura
    const userDir = app.getPath('userData');
  const dbPath = path.join(userDir, 'db.sqlite');
  this.dbPath = dbPath;

    // Asegurar carpeta
    try { fs.mkdirSync(userDir, { recursive: true }); } catch {}

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        // Crear esquema/ajustes de forma idempotente
        this.ensureSchema()
          .then(() => this.migrate())
          .catch((e) => console.error('DB init/migrate error:', e));
      }
    });
  }

  private async reopen() {
    return new Promise<void>((resolve, reject) => {
      if (this.db) {
        try { this.db.close(); } catch {}
      }
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) return reject(err);
        this.ensureSchema()
          .then(() => this.migrate())
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  private exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      this.db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  private async ensureSchema() {
    const schema = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo INTEGER DEFAULT 1,
  fecha_creacion TEXT DEFAULT (datetime('now')),
  fecha_actualizacion TEXT
);

CREATE TABLE IF NOT EXISTS tipos_unidad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  abreviacion TEXT NOT NULL,
  descripcion TEXT,
  activo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_barras TEXT,
  codigo_interno TEXT UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  costo_unitario REAL DEFAULT 0,
  precio_venta REAL NOT NULL,
  stock_minimo INTEGER DEFAULT 0,
  categoria_id INTEGER,
  tipo_unidad_id INTEGER,
  unidad_medida TEXT,
  activo INTEGER DEFAULT 1,
  imagen_url TEXT,
  fecha_creacion TEXT DEFAULT (datetime('now')),
  fecha_actualizacion TEXT,
  FOREIGN KEY(categoria_id) REFERENCES categorias(id),
  FOREIGN KEY(tipo_unidad_id) REFERENCES tipos_unidad(id)
);

CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  activo INTEGER DEFAULT 1,
  fecha_creacion TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT,
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  documento TEXT,
  tipo_documento TEXT,
  activo INTEGER DEFAULT 1,
  saldo_pendiente REAL DEFAULT 0,
  fecha_creacion TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL,
  almacen_id INTEGER DEFAULT 1,
  tipo_movimiento TEXT NOT NULL,
  cantidad REAL NOT NULL,
  costo_unitario REAL,
  stock_anterior REAL,
  stock_nuevo REAL,
  proveedor_id INTEGER,
  observaciones TEXT,
  usuario TEXT,
  fecha_movimiento TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(producto_id) REFERENCES productos(id),
  FOREIGN KEY(proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS ventas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_venta TEXT,
  cliente_id INTEGER,
  almacen_id INTEGER DEFAULT 1,
  fecha_venta TEXT DEFAULT (datetime('now')),
  metodo_pago TEXT,
  subtotal REAL DEFAULT 0,
  descuento REAL DEFAULT 0,
  impuestos REAL DEFAULT 0,
  total REAL DEFAULT 0,
  estado TEXT DEFAULT 'completada',
  observaciones TEXT,
  usuario TEXT,
  fecha_creacion TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(cliente_id) REFERENCES clientes(id)
);

-- Compras (cabecera)
CREATE TABLE IF NOT EXISTS compras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_compra TEXT,
  proveedor_id INTEGER,
  almacen_id INTEGER DEFAULT 1,
  fecha_compra TEXT DEFAULT (datetime('now')),
  subtotal REAL DEFAULT 0,
  descuento REAL DEFAULT 0,
  impuestos REAL DEFAULT 0,
  total REAL DEFAULT 0,
  estado TEXT DEFAULT 'completada',
  observaciones TEXT,
  usuario TEXT,
  fecha_creacion TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(proveedor_id) REFERENCES proveedores(id)
);

-- Compras (detalles)
CREATE TABLE IF NOT EXISTS compra_detalles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compra_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad REAL NOT NULL,
  costo_unitario REAL NOT NULL,
  descuento REAL DEFAULT 0,
  subtotal REAL NOT NULL,
  FOREIGN KEY(compra_id) REFERENCES compras(id),
  FOREIGN KEY(producto_id) REFERENCES productos(id)
);

-- Gastos simples
CREATE TABLE IF NOT EXISTS gastos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descripcion TEXT NOT NULL,
  monto REAL NOT NULL,
  categoria TEXT,
  metodo_pago TEXT,
  fecha_gasto TEXT DEFAULT (date('now')),
  observaciones TEXT
);

CREATE TABLE IF NOT EXISTS venta_detalles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venta_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad REAL NOT NULL,
  precio_unitario REAL NOT NULL,
  descuento REAL DEFAULT 0,
  subtotal REAL NOT NULL,
  FOREIGN KEY(venta_id) REFERENCES ventas(id),
  FOREIGN KEY(producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descripcion TEXT,
  fecha_modificacion TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  venta_id INTEGER NOT NULL,
  monto REAL NOT NULL,
  saldo REAL NOT NULL,
  fecha_vencimiento TEXT,
  estado TEXT DEFAULT 'pendiente',
  observaciones TEXT,
  fecha_creacion TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(cliente_id) REFERENCES clientes(id),
  FOREIGN KEY(venta_id) REFERENCES ventas(id)
);

CREATE TABLE IF NOT EXISTS pagos_cuentas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuenta_id INTEGER NOT NULL,
  monto REAL NOT NULL,
  metodo_pago TEXT,
  observaciones TEXT,
  fecha_pago TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(cuenta_id) REFERENCES cuentas_por_cobrar(id)
);

-- Registro de respaldos
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  size_bytes INTEGER,
  status TEXT,
  triggered_by TEXT, -- manual | auto
  operation TEXT,    -- backup | restore
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

DROP VIEW IF EXISTS inventario_actual;
CREATE VIEW IF NOT EXISTS inventario_actual AS
SELECT
  p.id AS id,
  p.codigo_interno AS codigo_interno,
  p.nombre AS nombre,
  c.nombre AS categoria,
  p.stock_minimo AS stock_minimo,
  p.unidad_medida AS unidad_medida,
  tu.nombre AS tipo_unidad_nombre,
  tu.abreviacion AS tipo_unidad_abrev,
  p.precio_venta AS precio_venta,
  -- stock actual por suma de movimientos
  COALESCE((
    SELECT SUM(CASE 
      WHEN m2.tipo_movimiento = 'entrada' THEN m2.cantidad
      WHEN m2.tipo_movimiento = 'salida' THEN -m2.cantidad
      WHEN m2.tipo_movimiento = 'ajuste' THEN m2.cantidad
      ELSE 0 END)
    FROM movimientos m2 WHERE m2.producto_id = p.id
  ), 0) AS stock_actual,
  -- último costo conocido (de compras) o costo del producto
  COALESCE((
    SELECT cd.costo_unitario
    FROM compra_detalles cd
    INNER JOIN compras c2 ON c2.id = cd.compra_id
    WHERE cd.producto_id = p.id
    ORDER BY c2.fecha_compra DESC, cd.id DESC
    LIMIT 1
  ), p.costo_unitario, 0) AS costo_unitario_ultimo,
  -- valor total estimado: stock actual * costo último
  COALESCE((
    SELECT SUM(CASE 
      WHEN m3.tipo_movimiento = 'entrada' THEN m3.cantidad
      WHEN m3.tipo_movimiento = 'salida' THEN -m3.cantidad
      WHEN m3.tipo_movimiento = 'ajuste' THEN m3.cantidad
      ELSE 0 END)
    FROM movimientos m3 WHERE m3.producto_id = p.id
  ), 0) * COALESCE((
    SELECT cd2.costo_unitario
    FROM compra_detalles cd2
    INNER JOIN compras c3 ON c3.id = cd2.compra_id
    WHERE cd2.producto_id = p.id
    ORDER BY c3.fecha_compra DESC, cd2.id DESC
    LIMIT 1
  ), p.costo_unitario, 0) AS valor_total,
  -- último movimiento y su tipo
  (SELECT MAX(m4.fecha_movimiento) FROM movimientos m4 WHERE m4.producto_id = p.id) AS ultimo_movimiento,
  (SELECT m5.tipo_movimiento FROM movimientos m5 WHERE m5.producto_id = p.id ORDER BY m5.fecha_movimiento DESC, m5.id DESC LIMIT 1) AS tipo_ultimo_movimiento
FROM productos p
LEFT JOIN categorias c ON c.id = p.categoria_id
LEFT JOIN tipos_unidad tu ON tu.id = p.tipo_unidad_id;
`;

    await this.exec(schema);

    // Sembrar configuración por defecto (idempotente)
    const defaults = [
      ['nombre_empresa', 'Mi Ferretería', 'Nombre de la empresa'],
      ['nit_empresa', '', 'NIT de la empresa'],
      ['direccion_empresa', '', 'Dirección de la empresa'],
      ['telefono_empresa', '', 'Teléfono de la empresa'],
      ['email_empresa', '', 'Email de la empresa'],
      ['ciudad_empresa', '', 'Ciudad de la empresa'],
      ['descripcion_empresa', '', 'Descripción del negocio'],
      ['ticket_ancho', '80', 'Ancho del ticket en mm'],
      ['ticket_impresora', '', 'Impresora seleccionada'],
      ['ticket_encabezado', '¡Gracias por su compra!', 'Mensaje del encabezado'],
      ['ticket_pie_pagina', 'Vuelva pronto', 'Mensaje del pie de página'],
      ['ticket_mostrar_logo', 'true', 'Mostrar logo en ticket'],
      ['ticket_auto_imprimir', 'true', 'Imprimir automáticamente'],
      ['ticket_mostrar_barcode', 'false', 'Mostrar código de barras'],
      ['ticket_logo_path', '', 'Ruta/URL del logo para el ticket'],
      ['ticket_logo_width', '60', 'Ancho del logo en px para el ticket'],
      ['ticket_tipo_comprobante', 'recibo', 'Tipo de comprobante por defecto: recibo o factura'],
      ['iva_general', '19.00', 'IVA general en porcentaje'],
      ['iva_reducido', '5.00', 'IVA reducido en porcentaje'],
      ['retencion_fuente', '2.50', 'Retención en la fuente'],
      ['aplicar_iva_defecto', 'true', 'Aplicar IVA por defecto'],
      ['mostrar_impuestos_ticket', 'false', 'Mostrar impuestos en ticket'],
      ['calcular_impuestos_auto', 'true', 'Calcular impuestos automáticamente'],
      ['auto_backup', 'true', 'Respaldos automáticos'],
      ['log_activity', 'true', 'Registrar actividad'],
      ['debug_mode', 'false', 'Modo de desarrollo'],
      ['ultimo_backup', '', 'Fecha del último respaldo']
    ];
    for (const [clave, valor, descripcion] of defaults) {
      await this.run(
        `INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, fecha_modificacion) VALUES (?, ?, ?, datetime('now'))`,
        [clave, valor, descripcion]
      );
    }
  }

  private async migrate() {
    // Agregar columna costo_unitario a productos si no existe
    try {
      const hasCol: any[] = await this.query(
        "PRAGMA table_info('productos')"
      );
      const exists = hasCol.some((c: any) => c.name === 'costo_unitario');
      if (!exists) {
        console.log('Migrating: adding productos.costo_unitario ...');
        await this.run(
          "ALTER TABLE productos ADD COLUMN costo_unitario DECIMAL(10,2) DEFAULT 0"
        );
        console.log('Migration done: productos.costo_unitario');
      }
    } catch (e) {
      console.error('Migration check/add costo_unitario failed:', e);
    }

    // Agregar columna imagen_url a productos si no existe
    try {
      const cols: any[] = await this.query("PRAGMA table_info('productos')");
      const hasImagen = cols.some((c: any) => c.name === 'imagen_url');
      if (!hasImagen) {
        console.log('Migrating: adding productos.imagen_url ...');
        await this.run("ALTER TABLE productos ADD COLUMN imagen_url TEXT");
        console.log('Migration done: productos.imagen_url');
      }
    } catch (e) {
      console.error('Migration check/add imagen_url failed:', e);
    }
  }

  // Backup: cierra, copia y reabre
  async backupTo(destPath: string, triggeredBy: 'manual' | 'auto' = 'manual'): Promise<void> {
    await new Promise<void>((resolve) => {
      if (this.db) {
        try { this.db.close(() => resolve()); } catch { resolve(); }
      } else {
        resolve();
      }
    });
    await fsp.copyFile(this.dbPath, destPath);
    // Reabrir y luego registrar el backup
    await this.reopen();
    try {
      const stat = await fsp.stat(destPath);
      await this.run(
        `INSERT INTO backups (file_path, size_bytes, status, triggered_by, operation, notes) VALUES (?, ?, 'completed', ?, 'backup', NULL)`,
        [destPath, stat.size, triggeredBy]
      );
    } catch (e) {
      console.warn('No se pudo registrar backup en tabla backups:', e);
    }
  }

  // Restore: cierra, reemplaza y reabre
  async restoreFrom(sourcePath: string): Promise<void> {
    await new Promise<void>((resolve) => {
      if (this.db) {
        try { this.db.close(() => resolve()); } catch { resolve(); }
      } else {
        resolve();
      }
    });
    await fsp.copyFile(sourcePath, this.dbPath);
    // Reabrir y luego registrar el restore en la BD restaurada
    await this.reopen();
    try {
      const stat = await fsp.stat(sourcePath);
      await this.run(
        `INSERT INTO backups (file_path, size_bytes, status, triggered_by, operation, notes) VALUES (?, ?, 'completed', 'manual', 'restore', NULL)`,
        [sourcePath, stat.size]
      );
    } catch (e) {
      console.warn('No se pudo registrar restore en tabla backups:', e);
    }
  }

  // Método genérico para ejecutar consultas SELECT
  query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  // Método para ejecutar INSERT, UPDATE, DELETE
  run(sql: string, params: any[] = []): Promise<{ id?: number; changes: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  // Método para obtener un solo registro
  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
export const dbService = new DatabaseService();
