import { getBoliviaISOString } from '../lib/utils';
import CajasService from './cajas-service';

export interface DashboardStats {
  ventasHoyTotal: number;
  productosEnStock: number;
  clientesActivos: number;
  cuentasPorCobrarTotal: number;
}

export interface VentaReciente {
  id: string;
  cliente: string | null;
  total: number;
  fecha: string;
}

export interface StockBajoItem {
  nombre: string;
  stock: number;
  minimo: number;
}

export class DashboardService {
  static async obtenerStats(): Promise<DashboardStats> {
    if (!window.electronAPI?.db) {
      throw new Error('ElectronAPI no está disponible');
    }
    
    // Obtener caja activa
    const cajaActiva = await CajasService.getCajaActiva();
    
    const fechaHoy = getBoliviaISOString().split('T')[0];
    let ventasHoy;
    
    if (cajaActiva) {
      // Filtrar ventas por caja activa
      ventasHoy = await window.electronAPI.db.get(`
        SELECT COALESCE(SUM(v.total), 0) as total
        FROM ventas v
        WHERE DATE(v.fecha_venta) = DATE(?)
        AND v.estado != 'cancelada'
        AND v.caja_id = ?
      `, [fechaHoy, cajaActiva.id]);
    } else {
      // Si no hay caja activa, mostrar 0
      ventasHoy = { total: 0 };
    }

    const productosEnStock = await window.electronAPI.db.get(`
      SELECT COUNT(*) as total
      FROM inventario_actual
      WHERE stock_actual > 0
    `);

    const clientesActivos = await window.electronAPI.db.get(`
      SELECT COUNT(*) as total
      FROM clientes
      WHERE activo = 1
    `);

    const cxc = await window.electronAPI.db.get(`
      SELECT COALESCE(SUM(saldo), 0) as total
      FROM cuentas_por_cobrar
      WHERE estado = 'pendiente'
    `);

    return {
      ventasHoyTotal: ventasHoy?.total || 0,
      productosEnStock: productosEnStock?.total || 0,
      clientesActivos: clientesActivos?.total || 0,
      cuentasPorCobrarTotal: cxc?.total || 0,
    };
  }

  static async obtenerVentasRecientes(limit = 5): Promise<VentaReciente[]> {
    if (!window.electronAPI?.db) {
      throw new Error('ElectronAPI no está disponible');
    }
    
    // Obtener caja activa
    const cajaActiva = await CajasService.getCajaActiva();
    
    if (!cajaActiva) {
      return []; // Si no hay caja activa, no mostrar ventas
    }
    
    return window.electronAPI.db.query(`
      SELECT 
        v.numero_venta as id,
        (c.nombre || ' ' || COALESCE(c.apellido, '')) as cliente,
        v.total,
        v.fecha_venta as fecha
      FROM ventas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE v.estado != 'cancelada'
      AND v.caja_id = ?
      ORDER BY v.fecha_venta DESC
      LIMIT ?
    `, [cajaActiva.id, limit]);
  }

  static async obtenerStockBajo(limit = 5): Promise<StockBajoItem[]> {
    if (!window.electronAPI?.db) {
      throw new Error('ElectronAPI no está disponible');
    }
    
    return window.electronAPI.db.query(`
      SELECT nombre, stock_actual as stock, stock_minimo as minimo
      FROM inventario_actual
      WHERE stock_minimo IS NOT NULL AND stock_actual <= stock_minimo
      ORDER BY (stock_minimo - stock_actual) DESC
      LIMIT ?
    `, [limit]);
  }
}
