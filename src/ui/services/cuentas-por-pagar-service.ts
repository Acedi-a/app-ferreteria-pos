// src/services/cuentas-por-pagar-service.ts
import { CajasService } from './cajas-service';
import { getBoliviaISOString } from '../lib/utils';

export interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  activo: boolean;
  fecha_creacion: string;
  saldo_pendiente: number;
  total_compras: number;
}

export interface CuentaPorPagar {
  id: number;
  proveedor_id: number;
  compra_id?: number;
  monto: number;
  saldo: number;
  fecha_vencimiento?: string;
  estado: 'pendiente' | 'vencida' | 'pagada';
  observaciones?: string;
  fecha_creacion: string;
  
  // Datos del proveedor (JOIN)
  proveedor_nombre?: string;
  proveedor_telefono?: string;
  
  // Datos calculados
  dias_vencido?: number;
  numero_compra?: string;
}

export interface PagoProveedor {
  id: number;
  cuenta_id: number;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  observaciones?: string;
  
  // Datos del proveedor (JOIN)
  proveedor_nombre?: string;
  proveedor_telefono?: string;
  
  // Datos de la cuenta (JOIN/calculados)
  numero_compra?: string;
}

export interface FiltrosCuentasPorPagar {
  proveedor?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vencimiento?: 'todos' | 'vencidas' | 'por_vencer';
}

export interface EstadisticasCuentasPorPagar {
  totalPorPagar: number;
  totalVencido: number;
  cantidadPendientes: number;
  cantidadVencidas: number;
  cantidadPagadas: number;
  promedioTiempoPago: number;
  proveedoresConDeuda: number;
}

export interface RegistrarPagoProveedorData {
  cuenta_id: number;
  monto: number;
  metodo_pago: string;
  observaciones?: string;
}

export class CuentasPorPagarService {
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

  // Obtener todas las cuentas por pagar con filtros
  static async obtenerCuentasPorPagar(
    filtros: FiltrosCuentasPorPagar = {},
    limite?: number
  ): Promise<CuentaPorPagar[]> {
    try {
      const fechaHoy = getBoliviaISOString().split('T')[0];
      let whereClause = '';
      const whereClauses: string[] = [];
      const params: any[] = [];

      // Filtro por proveedor
      if (filtros.proveedor && filtros.proveedor.trim() !== '') {
        whereClauses.push(`(
          p.nombre LIKE ? OR 
          p.telefono LIKE ? OR 
          p.email LIKE ?
        )`);
        const proveedorParam = `%${filtros.proveedor}%`;
        params.push(proveedorParam, proveedorParam, proveedorParam);
      }

      // Filtro por estado
      if (filtros.estado && filtros.estado !== '') {
        whereClauses.push('cpp.estado = ?');
        params.push(filtros.estado);
      }

      // Filtro por fecha de creación
      if (filtros.fechaDesde) {
        whereClauses.push('DATE(cpp.fecha_creacion) >= ?');
        params.push(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        whereClauses.push('DATE(cpp.fecha_creacion) <= ?');
        params.push(filtros.fechaHasta);
      }

      // Filtro por vencimiento
      if (filtros.vencimiento) {
        if (filtros.vencimiento === 'vencidas') {
          whereClauses.push('cpp.fecha_vencimiento < DATE("now") AND cpp.estado != "pagada"');
        } else if (filtros.vencimiento === 'por_vencer') {
          whereClauses.push('cpp.fecha_vencimiento >= DATE("now") AND cpp.estado != "pagada"');
        }
      }

      if (whereClauses.length > 0) {
        whereClause = 'WHERE ' + whereClauses.join(' AND ');
      }

      const limitClause = limite ? `LIMIT ${limite}` : '';

      const query = `
        SELECT 
          cpp.*,
          p.nombre as proveedor_nombre,
          p.telefono as proveedor_telefono,
          COALESCE('COMPRA-' || cpp.compra_id, 'CUENTA-' || cpp.id) as numero_compra,
          CASE 
            WHEN cpp.fecha_vencimiento < DATE(?) AND cpp.estado != 'pagada' 
            THEN JULIANDAY(?) - JULIANDAY(cpp.fecha_vencimiento)
            ELSE 0 
          END as dias_vencido
        FROM cuentas_por_pagar cpp
        INNER JOIN proveedores p ON cpp.proveedor_id = p.id
        ${whereClause}
        ORDER BY 
          CASE cpp.estado 
            WHEN 'vencida' THEN 1
            WHEN 'pendiente' THEN 2
            WHEN 'pagada' THEN 3
          END,
          cpp.fecha_vencimiento ASC
        ${limitClause}
      `;

      // Añadir parámetros para el cálculo de días vencidos
      const queryParams = [...params, fechaHoy, fechaHoy];
      const result = await this.executeQuery(query, queryParams);

      return result.map((row: any) => ({
        ...row,
        dias_vencido: Math.max(0, Math.floor(row.dias_vencido || 0))
      }));
    } catch (error) {
      console.error('Error al obtener cuentas por pagar:', error);
      throw error;
    }
  }

  // Obtener estadísticas de cuentas por pagar
  static async obtenerEstadisticas(): Promise<EstadisticasCuentasPorPagar> {
    try {
      const fechaHoy = getBoliviaISOString().split('T')[0];
      const query = `
        SELECT 
          COALESCE(SUM(CASE WHEN estado != 'pagada' THEN saldo ELSE 0 END), 0) as total_por_pagar,
          COALESCE(SUM(CASE WHEN fecha_vencimiento < DATE(?) AND estado != 'pagada' THEN saldo ELSE 0 END), 0) as total_vencido,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as cantidad_pendientes,
          COUNT(CASE WHEN estado = 'vencida' THEN 1 END) as cantidad_vencidas,
          COUNT(CASE WHEN estado = 'pagada' THEN 1 END) as cantidad_pagadas,
          COUNT(DISTINCT CASE WHEN saldo > 0 THEN proveedor_id END) as proveedores_con_deuda
        FROM cuentas_por_pagar
      `;

      const stats = await this.executeGet(query, [fechaHoy]);

      return {
        totalPorPagar: stats?.total_por_pagar || 0,
        totalVencido: stats?.total_vencido || 0,
        cantidadPendientes: stats?.cantidad_pendientes || 0,
        cantidadVencidas: stats?.cantidad_vencidas || 0,
        cantidadPagadas: stats?.cantidad_pagadas || 0,
        promedioTiempoPago: 0, // Se puede calcular más tarde si es necesario
        proveedoresConDeuda: stats?.proveedores_con_deuda || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener pagos recientes
  static async obtenerPagosRecientes(limite: number = 10): Promise<PagoProveedor[]> {
    try {
      const query = `
        SELECT 
          pp.*,
          p.nombre as proveedor_nombre,
          p.telefono as proveedor_telefono,
          COALESCE('COMPRA-' || cpp.compra_id, 'CUENTA-' || cpp.id) as numero_compra
        FROM pagos_proveedores pp
        INNER JOIN cuentas_por_pagar cpp ON pp.cuenta_id = cpp.id
        INNER JOIN proveedores p ON cpp.proveedor_id = p.id
        ORDER BY pp.fecha_pago DESC
        LIMIT ?
      `;

      return await this.executeQuery(query, [limite]);
    } catch (error) {
      console.error('Error al obtener pagos recientes:', error);
      throw error;
    }
  }

  // Registrar un pago
  static async registrarPago(datosPago: RegistrarPagoProveedorData): Promise<{ success: boolean; pago_id?: number }> {
    try {
      // Primero obtener la cuenta por pagar para validar
      const cuentaQuery = `
        SELECT id, saldo, monto, estado, proveedor_id
        FROM cuentas_por_pagar 
        WHERE id = ?
      `;
      
      const cuenta = await this.executeGet(cuentaQuery, [datosPago.cuenta_id]);

      if (!cuenta) {
        throw new Error('Cuenta por pagar no encontrada');
      }

      if (cuenta.estado === 'pagada') {
        throw new Error('La cuenta ya está pagada');
      }

      if (datosPago.monto > cuenta.saldo) {
        throw new Error('El monto del pago no puede ser mayor al saldo pendiente');
      }

      // Registrar el pago con fecha de Bolivia
      const fechaHoy = getBoliviaISOString();
      const insertPagoQuery = `
        INSERT INTO pagos_proveedores (cuenta_id, monto, metodo_pago, observaciones, fecha_pago)
        VALUES (?, ?, ?, ?, ?)
      `;

      const resultPago = await this.executeRun(insertPagoQuery, [
        datosPago.cuenta_id,
        datosPago.monto,
        datosPago.metodo_pago,
        datosPago.observaciones || null,
        fechaHoy
      ]);

      // Actualizar el saldo de la cuenta
      const nuevoSaldo = cuenta.saldo - datosPago.monto;
      const nuevoEstado = nuevoSaldo <= 0 ? 'pagada' : cuenta.estado;

      const updateCuentaQuery = `
        UPDATE cuentas_por_pagar 
        SET saldo = ?, estado = ?
        WHERE id = ?
      `;

      await this.executeRun(updateCuentaQuery, [nuevoSaldo, nuevoEstado, datosPago.cuenta_id]);

      // Actualizar saldo pendiente del proveedor
      const updateProveedorQuery = `
        UPDATE proveedores 
        SET saldo_pendiente = (
          SELECT COALESCE(SUM(saldo), 0) 
          FROM cuentas_por_pagar 
          WHERE proveedor_id = ? AND estado != 'pagada'
        )
        WHERE id = ?
      `;

      await this.executeRun(updateProveedorQuery, [cuenta.proveedor_id, cuenta.proveedor_id]);

      // Registrar egreso en caja activa
      try {
        const resultadoCaja = await CajasService.registrarMovimiento({
          tipo: 'egreso',
          monto: datosPago.monto,
          concepto: `Pago a proveedor - Cuenta #${datosPago.cuenta_id}`,
          // metodo_pago no existe en MovimientoCaja, se elimina esta línea
          usuario: 'Sistema', // TODO: obtener usuario actual
          // observaciones no existe en MovimientoCaja, se elimina esta línea
          referencia: `PAGO_PROV_${resultPago.id}`
        });

        if (!resultadoCaja.exito) {
          console.warn('Error al registrar pago en caja:', resultadoCaja.errores);
        }
      } catch (error) {
        console.warn('Error al registrar pago en caja:', error);
        // No fallar la operación principal por errores en caja
      }

      return {
        success: true,
        pago_id: resultPago.id
      };
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  }

  // Crear nueva cuenta por pagar
  static async crearCuentaPorPagar(datos: {
    proveedor_id: number;
    compra_id?: number;
    monto: number;
    fecha_vencimiento?: string;
    observaciones?: string;
  }): Promise<{ success: boolean; cuenta_id?: number }> {
    try {
      const query = `
        INSERT INTO cuentas_por_pagar 
        (proveedor_id, compra_id, monto, saldo, fecha_vencimiento, observaciones)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await this.executeRun(query, [
        datos.proveedor_id,
        datos.compra_id || null,
        datos.monto,
        datos.monto, // saldo inicial = monto
        datos.fecha_vencimiento || null,
        datos.observaciones || null
      ]);

      // Actualizar saldo pendiente del proveedor
      const updateProveedorQuery = `
        UPDATE proveedores 
        SET saldo_pendiente = saldo_pendiente + ?
        WHERE id = ?
      `;

      await this.executeRun(updateProveedorQuery, [datos.monto, datos.proveedor_id]);

      return {
        success: true,
        cuenta_id: result.id
      };
    } catch (error) {
      console.error('Error al crear cuenta por pagar:', error);
      throw error;
    }
  }

  // Actualizar estado de cuentas vencidas
  static async actualizarEstadosVencidas(): Promise<{ cuentas_actualizadas: number }> {
    try {
      const fechaHoy = getBoliviaISOString().split('T')[0];
      const query = `
        UPDATE cuentas_por_pagar 
        SET estado = 'vencida'
        WHERE fecha_vencimiento < DATE(?) 
        AND estado = 'pendiente'
      `;

      const result = await this.executeRun(query, [fechaHoy]);

      return {
        cuentas_actualizadas: result.changes || 0
      };
    } catch (error) {
      console.error('Error al actualizar estados vencidas:', error);
      throw error;
    }
  }

  // Obtener histórico de pagos de una cuenta
  static async obtenerHistoricoPagos(cuentaId: number): Promise<PagoProveedor[]> {
    try {
      const query = `
        SELECT 
          pp.*,
          p.nombre as proveedor_nombre,
          p.telefono as proveedor_telefono
        FROM pagos_proveedores pp
        INNER JOIN cuentas_por_pagar cpp ON pp.cuenta_id = cpp.id
        INNER JOIN proveedores p ON cpp.proveedor_id = p.id
        WHERE pp.cuenta_id = ?
        ORDER BY pp.fecha_pago DESC
      `;

      return await this.executeQuery(query, [cuentaId]);
    } catch (error) {
      console.error('Error al obtener histórico de pagos:', error);
      throw error;
    }
  }
}