import type { TipoMovimiento } from './inventario-service';

export interface MovimientoStock {
  id?: number;
  producto_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  costo_unitario?: number | null;
  proveedor_id?: number | null;
  observaciones?: string | null;
  fecha_movimiento?: string;
  usuario?: string;
}

export interface CompraDetalle {
  producto_id: number;
  cantidad: number;
  costo_unitario: number;
}

export interface Compra {
  proveedor_id: number;
  fecha_compra: string;
  numero_factura?: string;
  observaciones?: string;
  detalles: CompraDetalle[];
}

export class MovimientosService {
  /**
   * Registra una entrada de stock (compra)
   */
  static async registrarEntrada(entrada: {
    producto_id: number;
    cantidad: number;
    costo_unitario: number;
    proveedor_id: number;
    observaciones?: string;
  }): Promise<number> {
    // Obtener stock actual
    const stockItem = await window.electronAPI.db.get(`
      SELECT stock_actual FROM inventario_actual WHERE id = ?
    `, [entrada.producto_id]);
    
    const stockAnterior = stockItem?.stock_actual || 0;
    const stockNuevo = stockAnterior + entrada.cantidad;

    const result = await window.electronAPI.db.run(`
      INSERT INTO movimientos (
        producto_id, almacen_id, tipo_movimiento, cantidad, costo_unitario,
        stock_anterior, stock_nuevo, proveedor_id, observaciones, usuario
      ) VALUES (?, 1, 'entrada', ?, ?, ?, ?, ?, ?, 'POS')
    `, [
      entrada.producto_id,
      entrada.cantidad,
      entrada.costo_unitario,
      stockAnterior,
      stockNuevo,
      entrada.proveedor_id,
      entrada.observaciones || null
    ]);

    return result.id!;
  }

  /**
   * Registra una salida de stock (venta)
   */
  static async registrarSalida(salida: {
    producto_id: number;
    cantidad: number;
    observaciones?: string;
  }): Promise<number> {
    // Obtener stock actual
    const stockItem = await window.electronAPI.db.get(`
      SELECT stock_actual FROM inventario_actual WHERE id = ?
    `, [salida.producto_id]);
    
    const stockAnterior = stockItem?.stock_actual || 0;
    const stockNuevo = stockAnterior - salida.cantidad;

    if (stockNuevo < 0) {
      throw new Error(`Stock insuficiente. Stock actual: ${stockAnterior}, cantidad solicitada: ${salida.cantidad}`);
    }

    const result = await window.electronAPI.db.run(`
      INSERT INTO movimientos (
        producto_id, almacen_id, tipo_movimiento, cantidad,
        stock_anterior, stock_nuevo, observaciones, usuario
      ) VALUES (?, 1, 'salida', ?, ?, ?, ?, 'POS')
    `, [
      salida.producto_id,
      salida.cantidad,
      stockAnterior,
      stockNuevo,
      salida.observaciones || null
    ]);

    return result.id!;
  }

  /**
   * Registra un ajuste de stock (corrección)
   */
  static async registrarAjuste(ajuste: {
    producto_id: number;
    cantidad: number; // puede ser positivo o negativo
    observaciones?: string;
  }): Promise<number> {
    // Obtener stock actual
    const stockItem = await window.electronAPI.db.get(`
      SELECT stock_actual FROM inventario_actual WHERE id = ?
    `, [ajuste.producto_id]);
    
    const stockAnterior = stockItem?.stock_actual || 0;
    const stockNuevo = stockAnterior + ajuste.cantidad;

    const result = await window.electronAPI.db.run(`
      INSERT INTO movimientos (
        producto_id, almacen_id, tipo_movimiento, cantidad,
        stock_anterior, stock_nuevo, observaciones, usuario
      ) VALUES (?, 1, 'ajuste', ?, ?, ?, ?, 'POS')
    `, [
      ajuste.producto_id,
      ajuste.cantidad,
      stockAnterior,
      stockNuevo,
      ajuste.observaciones || null
    ]);

    return result.id!;
  }

  /**
   * Registra una compra completa (múltiples productos)
   */
  static async registrarCompra(compra: Compra): Promise<number[]> {
    const movimientoIds: number[] = [];

    for (const detalle of compra.detalles) {
      const movimientoId = await this.registrarEntrada({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        costo_unitario: detalle.costo_unitario,
        proveedor_id: compra.proveedor_id,
        observaciones: `Compra ${compra.numero_factura || ''} - ${compra.observaciones || ''}`.trim()
      });
      movimientoIds.push(movimientoId);
    }

    return movimientoIds;
  }

  /**
   * Obtiene el historial de movimientos de un producto
   */
  static async obtenerHistorialProducto(productoId: number, limit = 50): Promise<MovimientoStock[]> {
    return window.electronAPI.db.query(`
      SELECT 
        m.*,
        p.nombre as producto_nombre,
        pr.nombre as proveedor_nombre
      FROM movimientos m
      INNER JOIN productos p ON p.id = m.producto_id
      LEFT JOIN proveedores pr ON pr.id = m.proveedor_id
      WHERE m.producto_id = ?
      ORDER BY m.fecha_movimiento DESC, m.id DESC
      LIMIT ?
    `, [productoId, limit]);
  }

  /**
   * Obtiene estadísticas de movimientos
   */
  static async obtenerEstadisticas(): Promise<{
    totalEntradas: number;
    totalSalidas: number;
    totalAjustes: number;
    valorEntradasMes: number;
  }> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        COUNT(CASE WHEN tipo_movimiento = 'entrada' THEN 1 END) as totalEntradas,
        COUNT(CASE WHEN tipo_movimiento = 'salida' THEN 1 END) as totalSalidas,
        COUNT(CASE WHEN tipo_movimiento = 'ajuste' THEN 1 END) as totalAjustes,
        COALESCE(SUM(CASE 
          WHEN tipo_movimiento = 'entrada' 
            AND DATE(fecha_movimiento) >= DATE('now', 'start of month')
          THEN cantidad * COALESCE(costo_unitario, 0)
          ELSE 0 
        END), 0) as valorEntradasMes
      FROM movimientos
    `);

    return {
      totalEntradas: result?.totalEntradas || 0,
      totalSalidas: result?.totalSalidas || 0,
      totalAjustes: result?.totalAjustes || 0,
      valorEntradasMes: result?.valorEntradasMes || 0,
    };
  }
}
