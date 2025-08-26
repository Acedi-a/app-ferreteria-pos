import Database = require('better-sqlite3');
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { promises as fsp } from 'fs';

type DatabaseInstance = ReturnType<typeof Database>;

export class DatabaseService {
  private db: DatabaseInstance | null = null;
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

    try {
      this.db = new Database(dbPath);
      console.log('Connected to SQLite database');
      // Crear esquema/ajustes de forma idempotente
      this.ensureSchema();
      this.migrate();
    } catch (err) {
      console.error('Error opening database:', err);
    }
  }

  private reopen() {
    if (this.db) {
      try { this.db.close(); } catch {}
    }
    this.db = new Database(this.dbPath);
    this.ensureSchema();
    this.migrate();
  }

  private exec(sql: string): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec(sql);
  }

  private ensureSchema() {
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
  marca TEXT,
  venta_fraccionada INTEGER DEFAULT 0,
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
  genero TEXT,
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
  fecha_modificacion TEXT,
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

-- Gestión de cajas
CREATE TABLE IF NOT EXISTS cajas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_apertura TEXT DEFAULT (datetime('now')),
  fecha_cierre TEXT,
  usuario TEXT,
  monto_inicial REAL NOT NULL,
  estado TEXT DEFAULT 'abierta' CHECK (estado IN ('abierta','cerrada')),
  observaciones TEXT,
  total_ventas REAL DEFAULT 0,
  total_cobros_cxc REAL DEFAULT 0,
  total_gastos REAL DEFAULT 0,
  total_pagos_deuda REAL DEFAULT 0,
  total_ingresos_manuales REAL DEFAULT 0,
  total_egresos_manuales REAL DEFAULT 0,
  saldo_final REAL DEFAULT 0,
  ganancia_perdida REAL DEFAULT 0,
  actualizado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS caja_transacciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caja_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso','egreso','ajuste')),
  monto REAL NOT NULL,
  concepto TEXT,
  referencia TEXT,
  usuario TEXT,
  fecha TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(caja_id) REFERENCES cajas(id)
);

-- Nueva tabla: pagos por venta
CREATE TABLE IF NOT EXISTS venta_pagos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venta_id INTEGER NOT NULL,
  metodo_pago TEXT NOT NULL,
  monto REAL NOT NULL,
  usuario TEXT,
  fecha_pago TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(venta_id) REFERENCES ventas(id)
);

CREATE TABLE IF NOT EXISTS auditoria_cajas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caja_id INTEGER,
  accion TEXT NOT NULL,
  detalle TEXT,
  datos_anteriores TEXT,
  datos_nuevos TEXT,
  usuario TEXT,
  fecha TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(caja_id) REFERENCES cajas(id)
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

-- Vistas auxiliares optimizadas para el módulo de caja
DROP VIEW IF EXISTS inventario_actual;
CREATE VIEW IF NOT EXISTS inventario_actual AS
SELECT
  p.id AS id,
  p.codigo_interno AS codigo_interno,
  p.nombre AS nombre,
  p.marca AS marca,
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

-- Vista optimizada para resumen de caja con KPIs
DROP VIEW IF EXISTS caja_resumen_kpis;
CREATE VIEW IF NOT EXISTS caja_resumen_kpis AS
SELECT 
  c.id,
  c.fecha_apertura,
  c.fecha_cierre,
  c.usuario,
  c.monto_inicial,
  c.estado,
  -- Totales de transacciones por tipo (incluyendo todas las transacciones de ingreso)
  COALESCE((
    SELECT SUM(monto) FROM caja_transacciones ct 
    WHERE ct.caja_id = c.id AND ct.tipo = 'ingreso'
  ), 0) AS total_ingresos,
  COALESCE((
    SELECT SUM(monto) FROM caja_transacciones ct 
    WHERE ct.caja_id = c.id AND ct.tipo = 'egreso'
  ), 0) AS total_egresos,
  COALESCE((
    SELECT SUM(monto) FROM caja_transacciones ct 
    WHERE ct.caja_id = c.id AND ct.tipo = 'ajuste'
  ), 0) AS total_ajustes,
  -- Ventas por método de pago desde venta_pagos
  COALESCE((
    SELECT SUM(vp.monto) FROM venta_pagos vp
    INNER JOIN ventas v ON v.id = vp.venta_id
    WHERE v.fecha_venta >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR v.fecha_venta <= c.fecha_cierre)
    AND v.caja_id = c.id
    AND vp.metodo_pago = 'efectivo'
  ), 0) AS ventas_efectivo,
  COALESCE((
    SELECT SUM(vp.monto) FROM venta_pagos vp
    INNER JOIN ventas v ON v.id = vp.venta_id
    WHERE v.fecha_venta >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR v.fecha_venta <= c.fecha_cierre)
    AND v.caja_id = c.id
    AND vp.metodo_pago = 'tarjeta'
  ), 0) AS ventas_tarjeta,
  COALESCE((
    SELECT SUM(vp.monto) FROM venta_pagos vp
    INNER JOIN ventas v ON v.id = vp.venta_id
    WHERE v.fecha_venta >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR v.fecha_venta <= c.fecha_cierre)
    AND v.caja_id = c.id
    AND vp.metodo_pago = 'transferencia'
  ), 0) AS ventas_transferencia,
  COALESCE((
    SELECT SUM(vp.monto) FROM venta_pagos vp
    INNER JOIN ventas v ON v.id = vp.venta_id
    WHERE v.fecha_venta >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR v.fecha_venta <= c.fecha_cierre)
    AND v.caja_id = c.id
    AND vp.metodo_pago = 'mixto'
  ), 0) AS ventas_mixto,
  -- Total de ventas
  COALESCE((
    SELECT SUM(v.total) FROM ventas v
    WHERE v.fecha_venta >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR v.fecha_venta <= c.fecha_cierre)
    AND v.caja_id = c.id
    AND v.estado != 'cancelada'
  ), 0) AS total_ventas,
  -- Cobros de cuentas por cobrar en efectivo
  COALESCE((
    SELECT SUM(pc.monto) FROM pagos_cuentas pc
    INNER JOIN cuentas_por_cobrar cxc ON cxc.id = pc.cuenta_id
    WHERE pc.fecha_pago >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR pc.fecha_pago <= c.fecha_cierre)
    AND pc.metodo_pago = 'efectivo'
  ), 0) AS cobros_cxc_efectivo,
  -- Gastos del período
  COALESCE((
    SELECT SUM(g.monto) FROM gastos g
    WHERE g.fecha_gasto >= date(c.fecha_apertura) 
    AND (c.fecha_cierre IS NULL OR g.fecha_gasto <= date(c.fecha_cierre))
  ), 0) AS total_gastos,
  -- Pagos a proveedores del período
  COALESCE((
    SELECT SUM(pp.monto) FROM pagos_proveedores pp
    WHERE pp.fecha_pago >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR pp.fecha_pago <= c.fecha_cierre)
  ), 0) AS total_pagos_proveedores,
  -- Saldo final calculado: monto inicial + solo ingresos (ventas)
  c.monto_inicial + 
  COALESCE((
    SELECT SUM(monto)
    FROM caja_transacciones ct 
    WHERE ct.caja_id = c.id AND ct.tipo = 'ingreso'
  ), 0) AS saldo_final_calculado,
  -- Ganancia/Pérdida: diferencia entre precio de venta y costo de productos vendidos
  COALESCE((
    SELECT SUM((vd.precio_unitario - COALESCE(p.costo_unitario, 0)) * vd.cantidad)
    FROM venta_detalles vd
    INNER JOIN ventas v ON v.id = vd.venta_id
    INNER JOIN productos p ON p.id = vd.producto_id
    WHERE v.fecha_venta >= c.fecha_apertura 
    AND (c.fecha_cierre IS NULL OR v.fecha_venta <= c.fecha_cierre)
    AND v.caja_id = c.id
    AND v.estado != 'cancelada'
  ), 0) AS ganancia_perdida
FROM cajas c;

-- Vista para transacciones de caja con detalles enriquecidos
DROP VIEW IF EXISTS caja_transacciones_detalladas;
CREATE VIEW IF NOT EXISTS caja_transacciones_detalladas AS
SELECT 
  ct.*,
  c.fecha_apertura,
  c.fecha_cierre,
  c.usuario AS caja_usuario,
  c.estado AS caja_estado,
  -- Información adicional según el tipo de referencia
  CASE 
    WHEN ct.referencia LIKE 'venta_%' THEN (
      SELECT v.numero_venta FROM ventas v 
      WHERE v.id = CAST(REPLACE(ct.referencia, 'venta_', '') AS INTEGER)
    )
    WHEN ct.referencia LIKE 'pago_cxc_%' THEN (
      SELECT 'CxC #' || pc.cuenta_id FROM pagos_cuentas pc 
      WHERE pc.id = CAST(REPLACE(ct.referencia, 'pago_cxc_', '') AS INTEGER)
    )
    ELSE ct.referencia
  END AS referencia_detalle,
  -- Clasificación de la transacción
  CASE 
    WHEN ct.referencia LIKE 'venta_%' THEN 'Venta'
    WHEN ct.referencia LIKE 'pago_cxc_%' THEN 'Cobro CxC'
    WHEN ct.referencia LIKE 'gasto_%' THEN 'Gasto'
    WHEN ct.referencia LIKE 'pago_proveedor_%' THEN 'Pago Proveedor'
    WHEN ct.concepto LIKE '%ingreso%' OR ct.concepto LIKE '%deposito%' THEN 'Ingreso Manual'
    WHEN ct.concepto LIKE '%egreso%' OR ct.concepto LIKE '%retiro%' THEN 'Egreso Manual'
    WHEN ct.tipo = 'ajuste' THEN 'Ajuste'
    ELSE 'Otro'
  END AS categoria_transaccion
FROM caja_transacciones ct
INNER JOIN cajas c ON c.id = ct.caja_id;

-- Vista para análisis de métodos de pago
DROP VIEW IF EXISTS metodos_pago_analisis;
CREATE VIEW IF NOT EXISTS metodos_pago_analisis AS
SELECT 
  DATE(v.fecha_venta) AS fecha,
  vp.metodo_pago,
  COUNT(DISTINCT v.id) AS cantidad_ventas,
  SUM(vp.monto) AS total_monto,
  AVG(vp.monto) AS promedio_monto,
  MIN(vp.monto) AS monto_minimo,
  MAX(vp.monto) AS monto_maximo
FROM venta_pagos vp
INNER JOIN ventas v ON v.id = vp.venta_id
WHERE v.estado != 'cancelada'
GROUP BY DATE(v.fecha_venta), vp.metodo_pago
ORDER BY fecha DESC, vp.metodo_pago;
`;

    this.exec(schema);

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
      this.run(
        `INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, fecha_modificacion) VALUES (?, ?, ?, datetime('now'))`,
        [clave, valor, descripcion]
      );
    }
  }

  private migrate() {
    // Agregar columna costo_unitario a productos si no existe
    try {
      const hasCol: any[] = this.query(
        "PRAGMA table_info('productos')"
      );
      const exists = hasCol.some((c: any) => c.name === 'costo_unitario');
      if (!exists) {
        console.log('Migrating: adding productos.costo_unitario ...');
        this.run(
          "ALTER TABLE productos ADD COLUMN costo_unitario DECIMAL(10,2) DEFAULT 0"
        );
        console.log('Migration done: productos.costo_unitario');
      }
    } catch (e) {
      console.error('Migration check/add costo_unitario failed:', e);
    }

    // Crear tabla cuentas_por_pagar si no existe
    try {
      this.run(`
        CREATE TABLE IF NOT EXISTS cuentas_por_pagar (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proveedor_id INTEGER NOT NULL,
          compra_id INTEGER,
          monto DECIMAL(10,2) NOT NULL,
          saldo DECIMAL(10,2) NOT NULL,
          fecha_vencimiento DATE,
          estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'vencida', 'pagada')),
          observaciones TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
        )
      `);
      console.log('Migration done: cuentas_por_pagar table created');
    } catch (e) {
      console.error('Migration create cuentas_por_pagar failed:', e);
    }

    // Crear tabla pagos_proveedores si no existe
    try {
      this.run(`
        CREATE TABLE IF NOT EXISTS pagos_proveedores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cuenta_id INTEGER NOT NULL,
          monto DECIMAL(10,2) NOT NULL,
          metodo_pago TEXT NOT NULL,
          fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
          observaciones TEXT,
          FOREIGN KEY (cuenta_id) REFERENCES cuentas_por_pagar(id)
        )
      `);
      console.log('Migration done: pagos_proveedores table created');
    } catch (e) {
      console.error('Migration create pagos_proveedores failed:', e);
    }

    // Agregar columna saldo_pendiente a proveedores si no existe
    try {
      const hasProvCol: any[] = this.query(
        "PRAGMA table_info('proveedores')"
      );
      const existsProv = hasProvCol.some((c: any) => c.name === 'saldo_pendiente');
      if (!existsProv) {
        console.log('Migrating: adding proveedores.saldo_pendiente ...');
        this.run(
          "ALTER TABLE proveedores ADD COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0"
        );
        console.log('Migration done: proveedores.saldo_pendiente');
      }
    } catch (e) {
      console.error('Migration check/add saldo_pendiente to proveedores failed:', e);
    }

    // Agregar columna imagen_url a productos si no existe
    try {
      const cols: any[] = this.query("PRAGMA table_info('productos')");
      const hasImagen = cols.some((c: any) => c.name === 'imagen_url');
      if (!hasImagen) {
        console.log('Migrating: adding productos.imagen_url ...');
        this.run("ALTER TABLE productos ADD COLUMN imagen_url TEXT");
        console.log('Migration done: productos.imagen_url');
      }
    } catch (e) {
      console.error('Migration check/add imagen_url failed:', e);
    }

    // Agregar columna marca a productos si no existe
    try {
      const cols: any[] = this.query("PRAGMA table_info('productos')");
      const hasMarca = cols.some((c: any) => c.name === 'marca');
      if (!hasMarca) {
        console.log('Migrating: adding productos.marca ...');
        this.run("ALTER TABLE productos ADD COLUMN marca TEXT");
        console.log('Migration done: productos.marca');
        // Recrear la vista inventario_actual para incluir la nueva columna
        this.exec(`
DROP VIEW IF EXISTS inventario_actual;
CREATE VIEW IF NOT EXISTS inventario_actual AS
SELECT
  p.id AS id,
  p.codigo_interno AS codigo_interno,
  p.nombre AS nombre,
  p.marca AS marca,
  c.nombre AS categoria,
  p.stock_minimo AS stock_minimo,
  p.unidad_medida AS unidad_medida,
  tu.nombre AS tipo_unidad_nombre,
  tu.abreviacion AS tipo_unidad_abrev,
  p.precio_venta AS precio_venta,
  COALESCE((
    SELECT SUM(CASE 
      WHEN m2.tipo_movimiento = 'entrada' THEN m2.cantidad
      WHEN m2.tipo_movimiento = 'salida' THEN -m2.cantidad
      WHEN m2.tipo_movimiento = 'ajuste' THEN m2.cantidad
      ELSE 0 END)
    FROM movimientos m2 WHERE m2.producto_id = p.id
  ), 0) AS stock_actual,
  COALESCE((
    SELECT cd.costo_unitario
    FROM compra_detalles cd
    INNER JOIN compras c2 ON c2.id = cd.compra_id
    WHERE cd.producto_id = p.id
    ORDER BY c2.fecha_compra DESC, cd.id DESC
    LIMIT 1
  ), p.costo_unitario, 0) AS costo_unitario_ultimo,
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
  (SELECT MAX(m4.fecha_movimiento) FROM movimientos m4 WHERE m4.producto_id = p.id) AS ultimo_movimiento,
  (SELECT m5.tipo_movimiento FROM movimientos m5 WHERE m5.producto_id = p.id ORDER BY m5.fecha_movimiento DESC, m5.id DESC LIMIT 1) AS tipo_ultimo_movimiento
FROM productos p
LEFT JOIN categorias c ON c.id = p.categoria_id
LEFT JOIN tipos_unidad tu ON tu.id = p.tipo_unidad_id;
        `);
      }
    } catch (e) {
      console.error('Migration check/add marca failed:', e);
    }
    
    // Agregar columna venta_fraccionada a productos si no existe
    try {
      const cols2: any[] = this.query("PRAGMA table_info('productos')");
      const hasFrac = cols2.some((c: any) => c.name === 'venta_fraccionada');
      if (!hasFrac) {
        console.log('Migrating: adding productos.venta_fraccionada ...');
        this.run("ALTER TABLE productos ADD COLUMN venta_fraccionada INTEGER DEFAULT 0");
        console.log('Migration done: productos.venta_fraccionada');
      }
    } catch (e) {
      console.error('Migration check/add venta_fraccionada failed:', e);
    }

    // Agregar columna genero a clientes si no existe
    try {
      const colsCli: any[] = this.query("PRAGMA table_info('clientes')");
      const hasGenero = colsCli.some((c: any) => c.name === 'genero');
      if (!hasGenero) {
        console.log('Migrating: adding clientes.genero ...');
        this.run("ALTER TABLE clientes ADD COLUMN genero TEXT");
        console.log('Migration done: clientes.genero');
      }
    } catch (e) {
      console.error('Migration check/add genero failed:', e);
    }

    // Agregar columna fecha_modificacion a ventas si no existe
    try {
      const ventasCols: any[] = this.query("PRAGMA table_info('ventas')");
      const hasFechaModificacion = ventasCols.some((c: any) => c.name === 'fecha_modificacion');
      if (!hasFechaModificacion) {
        console.log('Migrating: adding ventas.fecha_modificacion ...');
        this.run("ALTER TABLE ventas ADD COLUMN fecha_modificacion TEXT");
        console.log('Migration done: ventas.fecha_modificacion');
      }
    } catch (e) {
      console.error('Migration check/add fecha_modificacion failed:', e);
    }

    // Crear tabla venta_pagos si no existe
    try {
      this.run(`
        CREATE TABLE IF NOT EXISTS venta_pagos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          venta_id INTEGER NOT NULL,
          metodo_pago TEXT NOT NULL,
          monto REAL NOT NULL,
          usuario TEXT,
          fecha_pago TEXT DEFAULT (datetime('now')),
          FOREIGN KEY(venta_id) REFERENCES ventas(id)
        )
      `);
      console.log('Migration done: venta_pagos table created');
    } catch (e) {
      console.error('Migration create venta_pagos failed:', e);
    }

    // Agregar columnas datos_anteriores y datos_nuevos a auditoria_cajas si no existen
    try {
      const auditoriaCols: any[] = this.query("PRAGMA table_info('auditoria_cajas')");
      const hasDatosAnteriores = auditoriaCols.some((c: any) => c.name === 'datos_anteriores');
      const hasDatosNuevos = auditoriaCols.some((c: any) => c.name === 'datos_nuevos');
      
      if (!hasDatosAnteriores) {
        console.log('Migrating: adding auditoria_cajas.datos_anteriores ...');
        this.run("ALTER TABLE auditoria_cajas ADD COLUMN datos_anteriores TEXT");
        console.log('Migration done: auditoria_cajas.datos_anteriores');
      }
      
      if (!hasDatosNuevos) {
        console.log('Migrating: adding auditoria_cajas.datos_nuevos ...');
        this.run("ALTER TABLE auditoria_cajas ADD COLUMN datos_nuevos TEXT");
        console.log('Migration done: auditoria_cajas.datos_nuevos');
      }
    } catch (e) {
      console.error('Migration check/add auditoria_cajas columns failed:', e);
    }

    // Agregar columna caja_id a ventas si no existe
    try {
      const ventasCols: any[] = this.query("PRAGMA table_info('ventas')");
      const hasCajaId = ventasCols.some((c: any) => c.name === 'caja_id');
      if (!hasCajaId) {
        console.log('Migrating: adding ventas.caja_id ...');
        this.run("ALTER TABLE ventas ADD COLUMN caja_id INTEGER");
        console.log('Migration done: ventas.caja_id');
        
        // Actualizar ventas existentes con la primera caja disponible
        const primeracaja = this.get("SELECT id FROM cajas ORDER BY id LIMIT 1");
        if (primeracaja) {
          this.run("UPDATE ventas SET caja_id = ? WHERE caja_id IS NULL", [primeracaja.id]);
          console.log('Migration done: updated existing ventas with caja_id');
        }
      }
    } catch (e) {
      console.error('Migration check/add ventas.caja_id failed:', e);
    }
  }

  // Backup: cierra, copia y reabre
  async backupTo(destPath: string, triggeredBy: 'manual' | 'auto' = 'manual'): Promise<void> {
    await new Promise<void>((resolve) => {
      if (this.db) {
        try { this.db.close(); resolve(); } catch { resolve(); }
      } else {
        resolve();
      }
    });
    await fsp.copyFile(this.dbPath, destPath);
    // Reabrir y luego registrar el backup
    this.reopen();
    try {
      const stat = await fsp.stat(destPath);
      this.run(
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
        try { this.db.close(); resolve(); } catch { resolve(); }
      } else {
        resolve();
      }
    });
    await fsp.copyFile(sourcePath, this.dbPath);
    // Reabrir y luego registrar el restore en la BD restaurada
    this.reopen();
    try {
      const stat = await fsp.stat(sourcePath);
      this.run(
        `INSERT INTO backups (file_path, size_bytes, status, triggered_by, operation, notes) VALUES (?, ?, 'completed', 'manual', 'restore', NULL)`,
        [sourcePath, stat.size]
      );
    } catch (e) {
      console.warn('No se pudo registrar restore en tabla backups:', e);
    }
  }

  // Método genérico para ejecutar consultas SELECT
  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare(sql);
    return stmt.all(params) as T[];
  }

  // Método para ejecutar INSERT, UPDATE, DELETE
  run(sql: string, params: any[] = []): { id?: number; changes: number } {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare(sql);
    const result = stmt.run(params);
    return {
      id: result.lastInsertRowid as number,
      changes: result.changes
    };
  }

  // Método para obtener un solo registro
  get<T = any>(sql: string, params: any[] = []): T | undefined {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const stmt = this.db.prepare(sql);
    return stmt.get(params) as T;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
export const dbService = new DatabaseService();
