// Servicio para gestionar las ventas
export interface VentaDetalle {
  id: number;
  venta_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numero_venta: string;
  cliente_id?: number;
  cliente_nombre?: string;
  almacen_id: number;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodo_pago: string;
  estado: string;
  observaciones?: string;
  fecha_venta: string;
  usuario: string;
  detalles?: VentaDetalle[];
}

export interface FiltrosVenta {
  fechaInicio?: string;
  fechaFin?: string;
  cliente?: string;
  metodoPago?: string;
  estado?: string;
  numeroVenta?: string;
}

export class VentasService {
  // Obtener todas las ventas con filtros opcionales
  static async obtenerVentas(filtros: FiltrosVenta = {}, limite: number = 100): Promise<Venta[]> {
    try {
      let query = `
        SELECT 
          v.*,
          c.nombre || ' ' || c.apellido as cliente_nombre
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        WHERE 1=1
      `;

      const params: any[] = [];

      // Aplicar filtros
      if (filtros.fechaInicio) {
        query += ` AND DATE(v.fecha_venta) >= ?`;
        params.push(filtros.fechaInicio);
      }

      if (filtros.fechaFin) {
        query += ` AND DATE(v.fecha_venta) <= ?`;
        params.push(filtros.fechaFin);
      }

      if (filtros.cliente) {
        query += ` AND (c.nombre LIKE ? OR c.apellido LIKE ? OR c.codigo LIKE ?)`;
        const clienteParam = `%${filtros.cliente}%`;
        params.push(clienteParam, clienteParam, clienteParam);
      }

      if (filtros.metodoPago) {
        query += ` AND v.metodo_pago = ?`;
        params.push(filtros.metodoPago);
      }

      if (filtros.estado) {
        query += ` AND v.estado = ?`;
        params.push(filtros.estado);
      }

      if (filtros.numeroVenta) {
        query += ` AND v.numero_venta LIKE ?`;
        params.push(`%${filtros.numeroVenta}%`);
      }

      query += ` ORDER BY v.fecha_venta DESC LIMIT ?`;
      params.push(limite);

      return window.electronAPI.db.query(query, params);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  }

  // Obtener una venta específica por ID
  static async obtenerVentaPorId(id: number): Promise<Venta | null> {
    try {
      const query = `
        SELECT 
          v.*,
          c.nombre || ' ' || c.apellido as cliente_nombre
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        WHERE v.id = ?
      `;

      return window.electronAPI.db.get(query, [id]);
    } catch (error) {
      console.error('Error al obtener venta por ID:', error);
      throw error;
    }
  }

  // Obtener detalles de una venta
  static async obtenerDetallesVenta(ventaId: number): Promise<VentaDetalle[]> {
    try {
      const query = `
        SELECT 
          vd.*,
          COALESCE(p.nombre, 'Producto no encontrado') as producto_nombre
        FROM venta_detalles vd
        LEFT JOIN productos p ON COALESCE(p.id, p.rowid) = vd.producto_id
        WHERE vd.venta_id = ?
        ORDER BY vd.id ASC
      `;

      return window.electronAPI.db.query(query, [ventaId]);
    } catch (error) {
      console.error('Error al obtener detalles de venta:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ventas
  static async obtenerEstadisticasVentas(): Promise<any> {
    try {
      const ventasHoy = await window.electronAPI.db.get(`
        SELECT 
          COUNT(*) as cantidad,
          COALESCE(SUM(total), 0) as total
        FROM ventas 
        WHERE DATE(fecha_venta) = DATE('now')
      `);

      const ventasSemana = await window.electronAPI.db.get(`
        SELECT 
          COUNT(*) as cantidad,
          COALESCE(SUM(total), 0) as total
        FROM ventas 
        WHERE DATE(fecha_venta) >= DATE('now', '-7 days')
      `);

      const ventasMes = await window.electronAPI.db.get(`
        SELECT 
          COUNT(*) as cantidad,
          COALESCE(SUM(total), 0) as total
        FROM ventas 
        WHERE strftime('%Y-%m', fecha_venta) = strftime('%Y-%m', 'now')
      `);

      const topProductos = await window.electronAPI.db.query(`
        SELECT 
          p.nombre,
          SUM(vd.cantidad) as cantidad_vendida,
          SUM(vd.subtotal) as total_vendido
        FROM venta_detalles vd
        LEFT JOIN productos p ON COALESCE(p.id, p.rowid) = vd.producto_id
        LEFT JOIN ventas v ON vd.venta_id = v.id
        WHERE DATE(v.fecha_venta) >= DATE('now', '-30 days')
        GROUP BY vd.producto_id, p.nombre
        ORDER BY cantidad_vendida DESC
        LIMIT 5
      `);

      return {
        ventasHoy: ventasHoy || { cantidad: 0, total: 0 },
        ventasSemana: ventasSemana || { cantidad: 0, total: 0 },
        ventasMes: ventasMes || { cantidad: 0, total: 0 },
        topProductos: topProductos || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener ventas por rango de fechas
  static async obtenerVentasPorRango(fechaInicio: string, fechaFin: string): Promise<Venta[]> {
    try {
      const query = `
        SELECT 
          v.*,
          c.nombre || ' ' || c.apellido as cliente_nombre
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        ORDER BY v.fecha_venta DESC
      `;

      return window.electronAPI.db.query(query, [fechaInicio, fechaFin]);
    } catch (error) {
      console.error('Error al obtener ventas por rango:', error);
      throw error;
    }
  }

  // Cancelar una venta (cambiar estado)
  static async cancelarVenta(ventaId: number, motivo?: string): Promise<void> {
    try {
      const query = `
        UPDATE ventas 
        SET 
          estado = 'cancelada',
          observaciones = COALESCE(observaciones || ' | ', '') || 'Cancelada: ' || ?
        WHERE id = ?
      `;

      await window.electronAPI.db.run(query, [motivo || 'Sin motivo especificado', ventaId]);

      // Restaurar stock de los productos
      const detalles = await this.obtenerDetallesVenta(ventaId);
      for (const detalle of detalles) {
        await window.electronAPI.db.run(`
          UPDATE productos 
          SET stock_actual = stock_actual + ?
          WHERE (id = ? OR rowid = ?)
        `, [detalle.cantidad, detalle.producto_id, detalle.producto_id]);
      }
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      throw error;
    }
  }

  // Métodos de pago disponibles
  static getMetodosPago(): string[] {
    return ['efectivo', 'tarjeta', 'transferencia', 'mixto'];
  }

  // Estados de venta disponibles
  static getEstadosVenta(): string[] {
    return ['completada', 'pendiente', 'cancelada'];
  }
}

export default VentasService;
