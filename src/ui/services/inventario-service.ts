export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface InventarioItem {
  id: number;
  codigo_interno: string | null;
  nombre: string;
  categoria: string | null;
  stock_minimo: number | null;
  unidad_medida: string | null;
  tipo_unidad_nombre: string | null;
  tipo_unidad_abrev: string | null;
  precio_venta: number;
  stock_actual: number;
  costo_unitario_ultimo: number | null;
  valor_total: number;
  ultimo_movimiento: string | null;
  tipo_ultimo_movimiento: TipoMovimiento | null;
}

export interface Movimiento {
  id?: number;
  producto_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  proveedor_id?: number | null; // opcional para entradas
  observaciones?: string | null;
}

export class InventarioService {
  static async listarInventario(): Promise<InventarioItem[]> {
    return window.electronAPI.db.query(`
      SELECT * FROM inventario_actual ORDER BY nombre
    `);
  }

  static async obtenerItem(productoId: number): Promise<InventarioItem | null> {
    const row = await window.electronAPI.db.get(`
      SELECT * FROM inventario_actual WHERE id = ?
    `, [productoId]);
    return row || null;
  }

  static async listarMovimientos(limit = 50): Promise<any[]> {
    return window.electronAPI.db.query(`
      SELECT 
  m.id, m.producto_id, m.almacen_id, m.tipo_movimiento, m.cantidad,
  m.stock_anterior, m.stock_nuevo, m.proveedor_id, m.observaciones, m.usuario, m.fecha_movimiento,
        p.nombre AS producto, 
        pr.nombre AS proveedor, 
        tu.abreviacion AS tipo_unidad_abrev,
        tu.nombre AS tipo_unidad_nombre
      FROM movimientos m
      INNER JOIN productos p ON p.id = m.producto_id
      LEFT JOIN proveedores pr ON pr.id = m.proveedor_id
      LEFT JOIN tipos_unidad tu ON tu.id = p.tipo_unidad_id
      ORDER BY m.fecha_movimiento DESC, m.id DESC
      LIMIT ?
    `, [limit]);
  }

  static async calcularComprasRecientes(dias = 30): Promise<number> {
    // Ahora se calcula desde compras/compra_detalles en el periodo
    const result = await window.electronAPI.db.get(`
      SELECT COALESCE(SUM(cd.subtotal), 0) as total_compras
      FROM compra_detalles cd
      INNER JOIN compras c ON c.id = cd.compra_id
      WHERE DATE(c.fecha_compra) >= DATE('now', '-' || ? || ' days')
    `, [dias]);
    return result?.total_compras || 0;
  }

  static async registrarMovimiento(data: Movimiento): Promise<number> {
    // Obtener stock actual para calcular anterior/nuevo
    const item = await this.obtenerItem(data.producto_id);
    const stockAnterior = item?.stock_actual ?? 0;

    // Determinar delta según tipo
    let delta = data.cantidad;
    if (data.tipo_movimiento === 'salida') delta = -Math.abs(data.cantidad);
    if (data.tipo_movimiento === 'entrada') delta = Math.abs(data.cantidad);
    // en 'ajuste' se permite positivo/negativo directo

    const stockNuevo = stockAnterior + delta;

    const result = await window.electronAPI.db.run(`
      INSERT INTO movimientos (
        producto_id, almacen_id, tipo_movimiento, cantidad, costo_unitario, 
        stock_anterior, stock_nuevo, proveedor_id, observaciones, usuario
      ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, 'POS')
    `, [
      data.producto_id,
      data.tipo_movimiento,
      Math.abs(data.cantidad),
      null,
      stockAnterior,
      stockNuevo,
      data.proveedor_id ?? null,
      data.observaciones || null
    ]);

    return result.id!;
  }
}
