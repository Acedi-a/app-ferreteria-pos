// src/services/gastos-service.ts
import { CajasService } from './cajas-service';

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria?: string;
  metodo_pago?: string;
  fecha_gasto: string;
  observaciones?: string;
}

export interface RegistrarGastoData {
  descripcion: string;
  monto: number;
  categoria?: string;
  metodo_pago: string;
  observaciones?: string;
  usuario?: string;
}

export interface FiltrosGastos {
  fechaDesde?: string;
  fechaHasta?: string;
  categoria?: string;
  metodo_pago?: string;
}

export class GastosService {
  private static async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.db.query(query, params);
    }
    throw new Error('ElectronAPI no está disponible');
  }

  private static async executeRun(query: string, params: any[] = []): Promise<{ id?: number; changes: number }> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.db.run(query, params);
    }
    throw new Error('ElectronAPI no está disponible');
  }

  private static async executeGet(query: string, params: any[] = []): Promise<any> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.db.get(query, params);
    }
    throw new Error('ElectronAPI no está disponible');
  }

  // Obtener todos los gastos con filtros
  static async obtenerGastos(
    filtros: FiltrosGastos = {},
    limite?: number
  ): Promise<Gasto[]> {
    try {
      let whereClause = '';
      const whereClauses: string[] = [];
      const params: any[] = [];

      // Filtro por fecha
      if (filtros.fechaDesde) {
        whereClauses.push('DATE(fecha_gasto) >= ?');
        params.push(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        whereClauses.push('DATE(fecha_gasto) <= ?');
        params.push(filtros.fechaHasta);
      }

      // Filtro por categoría
      if (filtros.categoria && filtros.categoria.trim() !== '') {
        whereClauses.push('categoria LIKE ?');
        params.push(`%${filtros.categoria}%`);
      }

      // Filtro por método de pago
      if (filtros.metodo_pago && filtros.metodo_pago !== '') {
        whereClauses.push('metodo_pago = ?');
        params.push(filtros.metodo_pago);
      }

      if (whereClauses.length > 0) {
        whereClause = 'WHERE ' + whereClauses.join(' AND ');
      }

      const limitClause = limite ? `LIMIT ${limite}` : '';

      const query = `
        SELECT *
        FROM gastos
        ${whereClause}
        ORDER BY fecha_gasto DESC, id DESC
        ${limitClause}
      `;

      return await this.executeQuery(query, params);
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      throw error;
    }
  }

  // Registrar un nuevo gasto
  static async registrarGasto(datosGasto: RegistrarGastoData): Promise<{ success: boolean; gasto_id?: number }> {
    try {
      // Validaciones
      if (!datosGasto.descripcion || datosGasto.descripcion.trim() === '') {
        throw new Error('La descripción del gasto es requerida');
      }

      if (!datosGasto.monto || datosGasto.monto <= 0) {
        throw new Error('El monto del gasto debe ser mayor a 0');
      }

      if (!datosGasto.metodo_pago || datosGasto.metodo_pago.trim() === '') {
        throw new Error('El método de pago es requerido');
      }

      // Registrar el gasto en la base de datos
      const insertGastoQuery = `
        INSERT INTO gastos (descripcion, monto, categoria, metodo_pago, observaciones)
        VALUES (?, ?, ?, ?, ?)
      `;

      const resultGasto = await this.executeRun(insertGastoQuery, [
        datosGasto.descripcion.trim(),
        datosGasto.monto,
        datosGasto.categoria?.trim() || null,
        datosGasto.metodo_pago,
        datosGasto.observaciones?.trim() || null
      ]);

      // Registrar egreso en caja activa
      try {
        const resultadoCaja = await CajasService.registrarMovimiento({
          tipo: 'egreso',
          monto: datosGasto.monto,
          concepto: `Gasto: ${datosGasto.descripcion}`,
          // metodo_pago no existe en MovimientoCaja, se elimina esta línea
          usuario: datosGasto.usuario || 'Sistema',
          // observaciones no existe en MovimientoCaja, se elimina esta línea
          referencia: `GASTO_${resultGasto.id}`
        });

        if (!resultadoCaja.exito) {
          console.warn('Error al registrar gasto en caja:', resultadoCaja.errores);
        }
      } catch (error) {
        console.warn('Error al registrar gasto en caja:', error);
        // No fallar la operación principal por errores en caja
      }

      return {
        success: true,
        gasto_id: resultGasto.id
      };
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      throw error;
    }
  }

  // Obtener estadísticas de gastos
  static async obtenerEstadisticas(fechaDesde?: string, fechaHasta?: string): Promise<{
    totalGastos: number;
    cantidadGastos: number;
    gastoPromedio: number;
    gastosPorCategoria: { categoria: string; total: number; cantidad: number }[];
    gastosPorMetodoPago: { metodo_pago: string; total: number; cantidad: number }[];
  }> {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (fechaDesde || fechaHasta) {
        const whereClauses: string[] = [];
        if (fechaDesde) {
          whereClauses.push('DATE(fecha_gasto) >= ?');
          params.push(fechaDesde);
        }
        if (fechaHasta) {
          whereClauses.push('DATE(fecha_gasto) <= ?');
          params.push(fechaHasta);
        }
        whereClause = 'WHERE ' + whereClauses.join(' AND ');
      }

      // Estadísticas generales
      const statsQuery = `
        SELECT 
          COALESCE(SUM(monto), 0) as total_gastos,
          COUNT(*) as cantidad_gastos,
          COALESCE(AVG(monto), 0) as gasto_promedio
        FROM gastos
        ${whereClause}
      `;

      const stats = await this.executeGet(statsQuery, params);

      // Gastos por categoría
      const categoriaQuery = `
        SELECT 
          COALESCE(categoria, 'Sin categoría') as categoria,
          SUM(monto) as total,
          COUNT(*) as cantidad
        FROM gastos
        ${whereClause}
        GROUP BY categoria
        ORDER BY total DESC
      `;

      const gastosPorCategoria = await this.executeQuery(categoriaQuery, params);

      // Gastos por método de pago
      const metodoPagoQuery = `
        SELECT 
          metodo_pago,
          SUM(monto) as total,
          COUNT(*) as cantidad
        FROM gastos
        ${whereClause}
        GROUP BY metodo_pago
        ORDER BY total DESC
      `;

      const gastosPorMetodoPago = await this.executeQuery(metodoPagoQuery, params);

      return {
        totalGastos: stats?.total_gastos || 0,
        cantidadGastos: stats?.cantidad_gastos || 0,
        gastoPromedio: stats?.gasto_promedio || 0,
        gastosPorCategoria: gastosPorCategoria || [],
        gastosPorMetodoPago: gastosPorMetodoPago || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de gastos:', error);
      throw error;
    }
  }

  // Obtener gastos recientes
  static async obtenerGastosRecientes(limite: number = 10): Promise<Gasto[]> {
    try {
      const query = `
        SELECT *
        FROM gastos
        ORDER BY fecha_gasto DESC, id DESC
        LIMIT ?
      `;

      return await this.executeQuery(query, [limite]);
    } catch (error) {
      console.error('Error al obtener gastos recientes:', error);
      throw error;
    }
  }

  // Eliminar un gasto (solo si no afecta el cierre de caja)
  static async eliminarGasto(gastoId: number): Promise<{ success: boolean }> {
    try {
      // Verificar si existe el gasto
      const gastoQuery = `SELECT * FROM gastos WHERE id = ?`;
      const gasto = await this.executeGet(gastoQuery, [gastoId]);

      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      // TODO: Verificar si el gasto está en una caja cerrada
      // Por ahora solo eliminamos el gasto
      const deleteQuery = `DELETE FROM gastos WHERE id = ?`;
      const result = await this.executeRun(deleteQuery, [gastoId]);

      if (result.changes === 0) {
        throw new Error('No se pudo eliminar el gasto');
      }

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      throw error;
    }
  }
}