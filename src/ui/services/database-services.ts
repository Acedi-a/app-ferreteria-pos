// Servicios específicos para cada módulo de la aplicación
// Estos servicios encapsulan las operaciones CRUD para cada entidad
import { getBoliviaISOString } from '../lib/utils';

export interface Producto {
  id?: number;
  codigo_barras?: string;
  codigo_interno?: string;
  nombre: string;
  descripcion?: string;
  costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  venta_fraccionada?: boolean;
  unidad_medida?: string;
  categoria?: string;
  proveedor_id?: number;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface Cliente {
  id?: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  nit?: string;
  ci?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  nit?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface Venta {
  id?: number;
  numero_factura?: string;
  cliente_id?: number;
  subtotal: number;
  descuento?: number;
  impuestos?: number;
  total: number;
  metodo_pago?: string;
  estado?: string;
  usuario_id?: number;
  fecha_venta?: string;
}

export interface DetalleVenta {
  id?: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  subtotal: number;
}

export interface CuentaPorCobrar {
  id?: number;
  venta_id: number;
  cliente_id: number;
  monto_total: number;
  monto_pagado?: number;
  monto_pendiente: number;
  fecha_vencimiento?: string;
  estado?: string;
  fecha_creacion?: string;
}

// Clase para servicios de productos
export class ProductoService {
  static async obtenerTodos(): Promise<Producto[]> {
    return window.electronAPI.db.query('SELECT * FROM productos WHERE activo = 1 ORDER BY nombre');
  }

  static async obtenerPorId(id: number): Promise<Producto | null> {
    return window.electronAPI.db.get('SELECT * FROM productos WHERE id = ?', [id]);
  }

  static async buscar(termino: string): Promise<Producto[]> {
    const sql = `
      SELECT * FROM productos 
      WHERE activo = 1 AND (
        nombre LIKE ? OR 
        codigo_barras LIKE ? OR 
        codigo_interno LIKE ? OR
        descripcion LIKE ?
      )
      ORDER BY nombre
    `;
    const params = [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`];
    return window.electronAPI.db.query(sql, params);
  }

  static async crear(producto: Omit<Producto, 'id'>): Promise<{ id: number }> {
    const sql = `
      INSERT INTO productos (
        codigo_barras, codigo_interno, nombre, descripcion, costo, 
        precio_venta, stock_actual, stock_minimo, venta_fraccionada,
        unidad_medida, categoria, proveedor_id, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      producto.codigo_barras || null,
      producto.codigo_interno || null,
      producto.nombre,
      producto.descripcion || null,
      producto.costo,
      producto.precio_venta,
      producto.stock_actual,
      producto.stock_minimo,
      producto.venta_fraccionada || false,
      producto.unidad_medida || 'unidad',
      producto.categoria || null,
      producto.proveedor_id || null,
      producto.activo !== false ? 1 : 0
    ];
    
    const result = await window.electronAPI.db.run(sql, params);
    return { id: result.id! };
  }

  static async actualizar(id: number, producto: Partial<Producto>): Promise<void> {
    const campos = Object.keys(producto).filter(key => key !== 'id');
    const sql = `
      UPDATE productos SET 
      ${campos.map(campo => `${campo} = ?`).join(', ')},
      fecha_modificacion = ?
      WHERE id = ?
    `;
    const valores = campos.map(campo => (producto as any)[campo]);
    valores.push(getBoliviaISOString());
    valores.push(id);
    
    await window.electronAPI.db.run(sql, valores);
  }

  static async eliminar(id: number): Promise<void> {
    await window.electronAPI.db.run('UPDATE productos SET activo = 0 WHERE id = ?', [id]);
  }

  static async obtenerStockBajo(): Promise<Producto[]> {
    return window.electronAPI.db.query(
      'SELECT p.*, ia.stock_actual FROM productos p JOIN inventario_actual ia ON p.id = ia.id WHERE p.activo = 1 AND ia.stock_actual <= p.stock_minimo ORDER BY ia.stock_actual'
    );
  }
}

// Clase para servicios de clientes
export class ClienteService {
  static async obtenerTodos(): Promise<Cliente[]> {
    return window.electronAPI.db.query('SELECT * FROM clientes WHERE activo = 1 ORDER BY nombre, apellido');
  }

  static async obtenerPorId(id: number): Promise<Cliente | null> {
    return window.electronAPI.db.get('SELECT * FROM clientes WHERE id = ?', [id]);
  }

  static async buscar(termino: string): Promise<Cliente[]> {
    const sql = `
      SELECT * FROM clientes 
      WHERE activo = 1 AND (
        nombre LIKE ? OR 
        apellido LIKE ? OR 
        email LIKE ? OR
        telefono LIKE ? OR
        nit LIKE ? OR
        ci LIKE ?
      )
      ORDER BY nombre, apellido
    `;
    const params = Array(6).fill(`%${termino}%`);
    return window.electronAPI.db.query(sql, params);
  }

  static async crear(cliente: Omit<Cliente, 'id'>): Promise<{ id: number }> {
    const sql = `
      INSERT INTO clientes (
        nombre, apellido, email, telefono, direccion, nit, ci, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      cliente.nombre,
      cliente.apellido || null,
      cliente.email || null,
      cliente.telefono || null,
      cliente.direccion || null,
      cliente.nit || null,
      cliente.ci || null,
      cliente.activo !== false ? 1 : 0
    ];
    
    const result = await window.electronAPI.db.run(sql, params);
    return { id: result.id! };
  }

  static async actualizar(id: number, cliente: Partial<Cliente>): Promise<void> {
    const campos = Object.keys(cliente).filter(key => key !== 'id');
    const sql = `
      UPDATE clientes SET 
      ${campos.map(campo => `${campo} = ?`).join(', ')},
      fecha_modificacion = ?
      WHERE id = ?
    `;
    const valores = campos.map(campo => (cliente as any)[campo]);
    valores.push(getBoliviaISOString());
    valores.push(id);
    
    await window.electronAPI.db.run(sql, valores);
  }

  static async eliminar(id: number): Promise<void> {
    await window.electronAPI.db.run('UPDATE clientes SET activo = 0 WHERE id = ?', [id]);
  }
}

// Clase para servicios de ventas
export class VentaService {
  static async obtenerTodas(): Promise<Venta[]> {
    return window.electronAPI.db.query(`
      SELECT v.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.estado != 'cancelada'
      ORDER BY v.fecha_venta DESC
    `);
  }

  static async obtenerPorId(id: number): Promise<Venta | null> {
    return window.electronAPI.db.get('SELECT * FROM ventas WHERE id = ?', [id]);
  }

  static async obtenerDetalleVenta(ventaId: number): Promise<DetalleVenta[]> {
    return window.electronAPI.db.query(`
      SELECT dv.*, p.nombre as producto_nombre, p.codigo_interno
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `, [ventaId]);
  }

  static async crear(venta: Omit<Venta, 'id'>, detalles: Omit<DetalleVenta, 'id' | 'venta_id'>[]): Promise<{ id: number }> {
    // Crear la venta
    const ventaSql = `
      INSERT INTO ventas (
        numero_factura, cliente_id, subtotal, descuento, impuestos, 
        total, metodo_pago, estado, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const ventaParams = [
      venta.numero_factura || null,
      venta.cliente_id || null,
      venta.subtotal,
      venta.descuento || 0,
      venta.impuestos || 0,
      venta.total,
      venta.metodo_pago || 'efectivo',
      venta.estado || 'completada',
      venta.usuario_id || null
    ];
    
    const ventaResult = await window.electronAPI.db.run(ventaSql, ventaParams);
    const ventaId = ventaResult.id!;

    // Crear los detalles de venta
    for (const detalle of detalles) {
      const detalleSql = `
        INSERT INTO detalle_ventas (
          venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const detalleParams = [
        ventaId,
        detalle.producto_id,
        detalle.cantidad,
        detalle.precio_unitario,
        detalle.descuento || 0,
        detalle.subtotal
      ];
      
      await window.electronAPI.db.run(detalleSql, detalleParams);

      // Actualizar stock del producto
      await window.electronAPI.db.run(
        'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
        [detalle.cantidad, detalle.producto_id]
      );
    }

    return { id: ventaId };
  }

  static async obtenerVentasPorFecha(fechaInicio: string, fechaFin: string): Promise<Venta[]> {
    return window.electronAPI.db.query(`
      SELECT v.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ? AND v.estado != 'cancelada'
      ORDER BY v.fecha_venta DESC
    `, [fechaInicio, fechaFin]);
  }
}

// Clase para cuentas por cobrar
export class CuentaPorCobrarService {
  static async obtenerTodas(): Promise<CuentaPorCobrar[]> {
    return window.electronAPI.db.query(`
      SELECT cpc.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido,
             v.numero_factura
      FROM cuentas_por_cobrar cpc
      JOIN clientes c ON cpc.cliente_id = c.id
      JOIN ventas v ON cpc.venta_id = v.id
      WHERE cpc.estado != 'pagado'
      ORDER BY cpc.fecha_vencimiento ASC
    `);
  }

  static async obtenerVencidas(): Promise<CuentaPorCobrar[]> {
    const fechaHoy = getBoliviaISOString().split('T')[0];
    return window.electronAPI.db.query(`
      SELECT cpc.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
      FROM cuentas_por_cobrar cpc
      JOIN clientes c ON cpc.cliente_id = c.id
      WHERE cpc.estado = 'vencido' OR (cpc.estado = 'pendiente' AND cpc.fecha_vencimiento < DATE(?))
      ORDER BY cpc.fecha_vencimiento ASC
    `, [fechaHoy]);
  }

  static async registrarPago(cuentaId: number, monto: number, metodoPago = 'efectivo'): Promise<void> {
    // Registrar el pago
    await window.electronAPI.db.run(`
      INSERT INTO pagos (cuenta_por_cobrar_id, monto, metodo_pago)
      VALUES (?, ?, ?)
    `, [cuentaId, monto, metodoPago]);

    // Actualizar el monto pagado y pendiente
    await window.electronAPI.db.run(`
      UPDATE cuentas_por_cobrar 
      SET monto_pagado = monto_pagado + ?,
          monto_pendiente = monto_pendiente - ?,
          estado = CASE 
            WHEN monto_pendiente - ? <= 0 THEN 'pagado'
            ELSE estado
          END
      WHERE id = ?
    `, [monto, monto, monto, cuentaId]);
  }
}
