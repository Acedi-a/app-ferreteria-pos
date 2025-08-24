// src/services/cuentas-por-cobrar-service.ts

import { CajasService } from './cajas-service';

export interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  documento?: string;
  tipo_documento: string;
  activo: boolean;
  fecha_creacion: string;
  saldo_pendiente: number;
  total_compras: number;
}

export interface CuentaPorCobrar {
  id: number;
  cliente_id: number;
  venta_id?: number;
  monto: number;
  saldo: number;
  fecha_vencimiento?: string;
  estado: 'pendiente' | 'vencida' | 'pagada';
  observaciones?: string;
  fecha_creacion: string;
  
  // Datos del cliente (JOIN)
  cliente_codigo?: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_telefono?: string;
  
  // Datos calculados
  dias_vencido?: number;
  numero_venta?: string;
}

export interface PagoCuenta {
  id: number;
  cuenta_id: number;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  observaciones?: string;
  
  // Datos del cliente (JOIN)
  cliente_nombre?: string;
  cliente_apellido?: string;
}

export interface FiltrosCuentasPorCobrar {
  cliente?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vencimiento?: 'todos' | 'vencidas' | 'por_vencer';
}

export interface EstadisticasCuentasPorCobrar {
  totalPorCobrar: number;
  totalVencido: number;
  cantidadPendientes: number;
  cantidadVencidas: number;
  cantidadPagadas: number;
  promedioTiempoCobranza: number;
  clientesConDeuda: number;
}

export interface RegistrarPagoData {
  cuenta_id: number;
  monto: number;
  metodo_pago: string;
  observaciones?: string;
}

export class CuentasPorCobrarService {
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

  // Obtener todas las cuentas por cobrar con filtros
  static async obtenerCuentasPorCobrar(
    filtros: FiltrosCuentasPorCobrar = {},
    limite?: number
  ): Promise<CuentaPorCobrar[]> {
    try {
      let whereClause = '';
      const whereClauses: string[] = [];
      const params: any[] = [];

      // Filtro por cliente
      if (filtros.cliente && filtros.cliente.trim() !== '') {
        whereClauses.push(`(
          c.nombre LIKE ? OR 
          c.apellido LIKE ? OR 
          c.codigo LIKE ?
        )`);
        const clienteParam = `%${filtros.cliente}%`;
        params.push(clienteParam, clienteParam, clienteParam);
      }

      // Filtro por estado
      if (filtros.estado && filtros.estado !== '') {
        whereClauses.push('cpc.estado = ?');
        params.push(filtros.estado);
      }

      // Filtro por fecha de creación
      if (filtros.fechaDesde) {
        whereClauses.push('DATE(cpc.fecha_creacion) >= ?');
        params.push(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        whereClauses.push('DATE(cpc.fecha_creacion) <= ?');
        params.push(filtros.fechaHasta);
      }

      // Filtro por vencimiento
      if (filtros.vencimiento) {
        if (filtros.vencimiento === 'vencidas') {
          whereClauses.push('cpc.fecha_vencimiento < DATE("now") AND cpc.estado != "pagada"');
        } else if (filtros.vencimiento === 'por_vencer') {
          whereClauses.push('cpc.fecha_vencimiento >= DATE("now") AND cpc.estado != "pagada"');
        }
      }

      if (whereClauses.length > 0) {
        whereClause = 'WHERE ' + whereClauses.join(' AND ');
      }

      const limitClause = limite ? `LIMIT ${limite}` : '';

      const query = `
        SELECT 
          cpc.*,
          c.codigo as cliente_codigo,
          c.nombre as cliente_nombre,
          c.apellido as cliente_apellido,
          c.telefono as cliente_telefono,
          COALESCE(v.numero_venta, 'VENTA-' || cpc.venta_id) as numero_venta,
          CASE 
            WHEN cpc.fecha_vencimiento < DATE('now') AND cpc.estado != 'pagada' 
            THEN JULIANDAY('now') - JULIANDAY(cpc.fecha_vencimiento)
            ELSE 0 
          END as dias_vencido
        FROM cuentas_por_cobrar cpc
        INNER JOIN clientes c ON cpc.cliente_id = c.id
        LEFT JOIN ventas v ON cpc.venta_id = v.id
        ${whereClause}
        ORDER BY 
          CASE cpc.estado 
            WHEN 'vencida' THEN 1
            WHEN 'pendiente' THEN 2
            WHEN 'pagada' THEN 3
          END,
          cpc.fecha_vencimiento ASC
        ${limitClause}
      `;

      const result = await this.executeQuery(query, params);

      return result.map((row: any) => ({
        ...row,
        dias_vencido: Math.max(0, Math.floor(row.dias_vencido || 0))
      }));
    } catch (error) {
      console.error('Error al obtener cuentas por cobrar:', error);
      throw error;
    }
  }

  // Obtener estadísticas de cuentas por cobrar
  static async obtenerEstadisticas(): Promise<EstadisticasCuentasPorCobrar> {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(CASE WHEN estado != 'pagada' THEN saldo ELSE 0 END), 0) as total_por_cobrar,
          COALESCE(SUM(CASE WHEN fecha_vencimiento < DATE('now') AND estado != 'pagada' THEN saldo ELSE 0 END), 0) as total_vencido,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as cantidad_pendientes,
          COUNT(CASE WHEN estado = 'vencida' THEN 1 END) as cantidad_vencidas,
          COUNT(CASE WHEN estado = 'pagada' THEN 1 END) as cantidad_pagadas,
          COUNT(DISTINCT CASE WHEN saldo > 0 THEN cliente_id END) as clientes_con_deuda
        FROM cuentas_por_cobrar
      `;

      const stats = await this.executeGet(query);

      return {
        totalPorCobrar: stats?.total_por_cobrar || 0,
        totalVencido: stats?.total_vencido || 0,
        cantidadPendientes: stats?.cantidad_pendientes || 0,
        cantidadVencidas: stats?.cantidad_vencidas || 0,
        cantidadPagadas: stats?.cantidad_pagadas || 0,
        promedioTiempoCobranza: 0, // Se puede calcular más tarde si es necesario
        clientesConDeuda: stats?.clientes_con_deuda || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener pagos recientes
  static async obtenerPagosRecientes(limite: number = 10): Promise<PagoCuenta[]> {
    try {
      const query = `
        SELECT 
          pc.*,
          c.nombre as cliente_nombre,
          c.apellido as cliente_apellido
        FROM pagos_cuentas pc
        INNER JOIN cuentas_por_cobrar cpc ON pc.cuenta_id = cpc.id
        INNER JOIN clientes c ON cpc.cliente_id = c.id
        ORDER BY pc.fecha_pago DESC
        LIMIT ?
      `;

      return await this.executeQuery(query, [limite]);
    } catch (error) {
      console.error('Error al obtener pagos recientes:', error);
      throw error;
    }
  }

  // Registrar un pago
  static async registrarPago(datosPago: RegistrarPagoData): Promise<{ success: boolean; pago_id?: number }> {
    try {
      // Primero obtener la cuenta por cobrar para validar
      const cuentaQuery = `
        SELECT id, saldo, monto, estado, cliente_id
        FROM cuentas_por_cobrar 
        WHERE id = ?
      `;
      
      const cuenta = await this.executeGet(cuentaQuery, [datosPago.cuenta_id]);

      if (!cuenta) {
        throw new Error('Cuenta por cobrar no encontrada');
      }

      if (cuenta.estado === 'pagada') {
        throw new Error('La cuenta ya está pagada');
      }

      if (datosPago.monto > cuenta.saldo) {
        throw new Error('El monto del pago no puede ser mayor al saldo pendiente');
      }

      // Registrar el pago
      const insertPagoQuery = `
        INSERT INTO pagos_cuentas (cuenta_id, monto, metodo_pago, observaciones)
        VALUES (?, ?, ?, ?)
      `;

      const resultPago = await this.executeRun(insertPagoQuery, [
        datosPago.cuenta_id,
        datosPago.monto,
        datosPago.metodo_pago,
        datosPago.observaciones || null
      ]);

      // Actualizar el saldo de la cuenta
      const nuevoSaldo = cuenta.saldo - datosPago.monto;
      const nuevoEstado = nuevoSaldo <= 0 ? 'pagada' : cuenta.estado;

      const updateCuentaQuery = `
        UPDATE cuentas_por_cobrar 
        SET saldo = ?, estado = ?
        WHERE id = ?
      `;

      await this.executeRun(updateCuentaQuery, [nuevoSaldo, nuevoEstado, datosPago.cuenta_id]);

      // Si la cuenta se completó, actualizar el estado de la venta
      if (nuevoSaldo <= 0) {
        // Obtener la venta asociada
        const ventaQuery = `
          SELECT venta_id 
          FROM cuentas_por_cobrar 
          WHERE id = ?
        `;
        
        const ventaInfo = await this.executeGet(ventaQuery, [datosPago.cuenta_id]);
        
        if (ventaInfo && ventaInfo.venta_id) {
          // Actualizar estado de venta a completada
          const updateVentaQuery = `
            UPDATE ventas 
            SET estado = 'completada'
            WHERE id = ?
          `;
          
          await this.executeRun(updateVentaQuery, [ventaInfo.venta_id]);
          console.log(`Venta ${ventaInfo.venta_id} marcada como completada - Crédito totalmente pagado`);
        }
      }

      // Actualizar saldo pendiente del cliente
      const updateClienteQuery = `
        UPDATE clientes 
        SET saldo_pendiente = (
          SELECT COALESCE(SUM(saldo), 0) 
          FROM cuentas_por_cobrar 
          WHERE cliente_id = ? AND estado != 'pagada'
        )
        WHERE id = ?
      `;

      await this.executeRun(updateClienteQuery, [cuenta.cliente_id, cuenta.cliente_id]);

      // Registrar el pago como ingreso en la caja activa
      try {
        const resultadoCaja = await CajasService.registrarMovimiento({
          tipo: 'ingreso',
          monto: datosPago.monto,
          concepto: `Pago cuenta por cobrar #${datosPago.cuenta_id}`,
          usuario: 'Sistema' // Propiedad requerida en MovimientoCaja
          // metodo_pago y observaciones no existen en MovimientoCaja
        });

        if (!resultadoCaja.exito) {
          console.warn('No se pudo registrar el pago en caja:', resultadoCaja.errores);
        }
      } catch (error) {
        console.error('Error al registrar pago en caja:', error);
        // No lanzamos el error para no afectar el registro del pago
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

  // Crear nueva cuenta por cobrar
  static async crearCuentaPorCobrar(datos: {
    cliente_id: number;
    venta_id?: number;
    monto: number;
    fecha_vencimiento?: string;
    observaciones?: string;
  }): Promise<{ success: boolean; cuenta_id?: number }> {
    try {
      const query = `
        INSERT INTO cuentas_por_cobrar 
        (cliente_id, venta_id, monto, saldo, fecha_vencimiento, observaciones)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await this.executeRun(query, [
        datos.cliente_id,
        datos.venta_id || null,
        datos.monto,
        datos.monto, // saldo inicial = monto
        datos.fecha_vencimiento || null,
        datos.observaciones || null
      ]);

      // Actualizar saldo pendiente del cliente
      const updateClienteQuery = `
        UPDATE clientes 
        SET saldo_pendiente = saldo_pendiente + ?
        WHERE id = ?
      `;

      await this.executeRun(updateClienteQuery, [datos.monto, datos.cliente_id]);

      return {
        success: true,
        cuenta_id: result.id
      };
    } catch (error) {
      console.error('Error al crear cuenta por cobrar:', error);
      throw error;
    }
  }

  // Actualizar estado de cuentas vencidas
  static async actualizarEstadosVencidas(): Promise<{ cuentas_actualizadas: number }> {
    try {
      const query = `
        UPDATE cuentas_por_cobrar 
        SET estado = 'vencida'
        WHERE fecha_vencimiento < DATE('now') 
        AND estado = 'pendiente'
      `;

      const result = await this.executeRun(query);

      return {
        cuentas_actualizadas: result.changes || 0
      };
    } catch (error) {
      console.error('Error al actualizar estados vencidas:', error);
      throw error;
    }
  }

  // Obtener histórico de pagos de una cuenta
  static async obtenerHistoricoPagos(cuentaId: number): Promise<PagoCuenta[]> {
    try {
      const query = `
        SELECT 
          pc.*,
          c.nombre as cliente_nombre,
          c.apellido as cliente_apellido
        FROM pagos_cuentas pc
        INNER JOIN cuentas_por_cobrar cpc ON pc.cuenta_id = cpc.id
        INNER JOIN clientes c ON cpc.cliente_id = c.id
        WHERE pc.cuenta_id = ?
        ORDER BY pc.fecha_pago DESC
      `;

      return await this.executeQuery(query, [cuentaId]);
    } catch (error) {
      console.error('Error al obtener histórico de pagos:', error);
      throw error;
    }
  }
}
