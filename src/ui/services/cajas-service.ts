/**
 * Servicio profesional de gestión de cajas
 * Refactorizado para máxima consistencia, atomicidad y robustez
 */

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface Caja {
  id: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  usuario: string;
  monto_inicial: number;
  estado: 'abierta' | 'cerrada';
  observaciones?: string;
  saldo_final?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CajaTransaccion {
  id: number;
  caja_id: number;
  tipo: 'ingreso' | 'egreso' | 'ajuste';
  monto: number;
  concepto: string;
  referencia?: string;
  usuario: string;
  fecha: string;
  categoria_transaccion?: string;
  referencia_detalle?: string;
}

export interface ResumenCaja {
  // Información básica
  caja_id: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  usuario: string;
  estado: string;
  
  // Montos base
  monto_inicial: number;
  saldo_final_calculado: number;
  
  // Transacciones de caja
  total_ingresos: number;
  total_egresos: number;
  total_ajustes: number;
  
  // Ventas por método de pago
  ventas_efectivo: number;
  ventas_tarjeta: number;
  ventas_transferencia: number;
  ventas_mixto: number;
  total_ventas: number;
  
  // Otros movimientos
  cobros_cxc_efectivo: number;
  total_gastos: number;
  total_pagos_proveedores: number;
  
  // KPIs calculados
  efectivo_disponible: number;
  total_recibido: number;
  diferencia_esperada: number;
  porcentaje_efectivo: number;
  porcentaje_digital: number;
}

export interface AuditoriaCaja {
  id: number;
  caja_id: number;
  accion: string;
  detalle: string;
  usuario: string;
  fecha: string;
  datos_anteriores?: string;
  datos_nuevos?: string;
}

export interface FiltrosCaja {
  fechaDesde?: string;
  fechaHasta?: string;
  usuario?: string;
  estado?: 'abierta' | 'cerrada' | 'todas';
  limite?: number;
}

export interface MovimientoCaja {
  tipo: 'ingreso' | 'egreso' | 'ajuste';
  monto: number;
  concepto: string;
  referencia?: string;
  usuario: string;
}

export interface ResultadoOperacion {
  exito: boolean;
  mensaje: string;
  datos?: any;
  errores?: string[];
}

// Interfaz ArqueoCaja eliminada

// ============================================================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================================================

export class CajasService {
  
  // ==========================================================================
  // GESTIÓN DE CAJAS
  // ==========================================================================
  
  /**
   * Abre una nueva caja con validaciones completas
   */
  static async abrirCaja(montoInicial: number, usuario: string, observaciones?: string): Promise<ResultadoOperacion> {
    try {
      // Validaciones previas
      const validacion = await this.validarAperturaCaja(montoInicial, usuario);
      if (!validacion.exito) {
        return validacion;
      }

      // Verificar que no hay caja abierta
      const cajaActiva = await this.getCajaActiva();
      if (cajaActiva) {
        return {
          exito: false,
          mensaje: `Ya existe una caja abierta (#${cajaActiva.id}) desde ${new Date(cajaActiva.fecha_apertura).toLocaleString()}`,
          errores: ['CAJA_YA_ABIERTA']
        };
      }

      // Crear nueva caja
      const resultado = await window.electronAPI.db.run(`
        INSERT INTO cajas (
          fecha_apertura, usuario, monto_inicial, estado, observaciones
        ) VALUES (datetime('now'), ?, ?, 'abierta', ?)
      `, [usuario, montoInicial, observaciones || '']);

      const cajaId = resultado.id!;

      // No registrar transacción inicial automática para evitar duplicación
      // El monto_inicial ya se cuenta en la vista caja_resumen_kpis

      // Auditoría
      await this.registrarAuditoria({
        caja_id: cajaId,
        accion: 'APERTURA',
        detalle: `Caja abierta con saldo inicial de ${montoInicial}`,
        usuario,
        datos_nuevos: JSON.stringify({ monto_inicial: montoInicial, observaciones })
      });

      return {
        exito: true,
        mensaje: `Caja #${cajaId} abierta exitosamente`,
        datos: { caja_id: cajaId, monto_inicial: montoInicial }
      };

    } catch (error) {
      console.error('Error al abrir caja:', error);
      return {
        exito: false,
        mensaje: 'Error interno al abrir la caja',
        errores: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Cierra la caja activa
   */
  static async cerrarCaja(usuario: string, observaciones?: string): Promise<ResultadoOperacion> {
    try {
      const cajaActiva = await this.getCajaActiva();
      if (!cajaActiva) {
        return {
          exito: false,
          mensaje: 'No hay ninguna caja abierta para cerrar',
          errores: ['NO_HAY_CAJA_ACTIVA']
        };
      }

      // Obtener resumen final
      const resumen = await this.getResumenCaja(cajaActiva.id);
      if (!resumen) {
        return {
          exito: false,
          mensaje: 'Error al calcular el resumen de la caja',
          errores: ['ERROR_RESUMEN']
        };
      }

      const saldoFinal = resumen.saldo_final_calculado;
      const observacionesFinal = observaciones || '';

      // Cerrar la caja
      await window.electronAPI.db.run(`
        UPDATE cajas SET 
          fecha_cierre = datetime('now'),
          estado = 'cerrada',
          saldo_final = ?,
          observaciones = COALESCE(observaciones || '', '') || ?
        WHERE id = ?
      `, [saldoFinal, observacionesFinal, cajaActiva.id]);

      // Auditoría
      await this.registrarAuditoria({
        caja_id: cajaActiva.id,
        accion: 'CIERRE',
        detalle: `Caja cerrada con saldo final de ${saldoFinal}`,
        usuario,
        datos_anteriores: JSON.stringify({ estado: 'abierta' }),
        datos_nuevos: JSON.stringify({ 
          estado: 'cerrada', 
          saldo_final: saldoFinal
        })
      });

      return {
        exito: true,
        mensaje: `Caja #${cajaActiva.id} cerrada exitosamente`,
        datos: { 
          caja_id: cajaActiva.id, 
          saldo_final: saldoFinal
        }
      };

    } catch (error) {
      console.error('Error al cerrar caja:', error);
      return {
        exito: false,
        mensaje: 'Error interno al cerrar la caja',
        errores: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Reabre una caja cerrada por error
   */
  static async reabrirCaja(cajaId: number, usuario: string, observaciones?: string): Promise<ResultadoOperacion> {
    try {
      // Verificar si hay una caja abierta y cerrarla automáticamente
      const cajaActiva = await this.getCajaActiva();
      if (cajaActiva && cajaActiva.id !== cajaId) {
        // Cerrar la caja activa automáticamente antes de reabrir la histórica
        const resultadoCierre = await this.cerrarCaja(
          usuario,
          `Cierre automático para reapertura de caja #${cajaId}`
        );
        
        if (!resultadoCierre.exito) {
          return {
            exito: false,
            mensaje: `No se pudo cerrar la caja activa (#${cajaActiva.id}) para reabrir la caja #${cajaId}: ${resultadoCierre.mensaje}`,
            errores: ['ERROR_CIERRE_AUTOMATICO']
          };
        }
      }

      // Verificar que la caja existe y está cerrada
      const caja = await window.electronAPI.db.get(`
        SELECT * FROM cajas WHERE id = ?
      `, [cajaId]);

      if (!caja) {
        return {
          exito: false,
          mensaje: 'La caja especificada no existe',
          errores: ['CAJA_NO_ENCONTRADA']
        };
      }

      if (caja.estado !== 'cerrada') {
        return {
          exito: false,
          mensaje: 'Solo se pueden reabrir cajas que estén cerradas',
          errores: ['CAJA_NO_CERRADA']
        };
      }

      // Reabrir la caja
      await window.electronAPI.db.run(`
        UPDATE cajas SET 
          fecha_cierre = NULL,
          estado = 'abierta',
          observaciones = COALESCE(observaciones || '', '') || ?
        WHERE id = ?
      `, [`\nREABIERTA: ${observaciones || 'Reabierta por corrección'}`, cajaId]);

      // Auditoría
      await this.registrarAuditoria({
        caja_id: cajaId,
        accion: 'REAPERTURA',
        detalle: `Caja reabierta por corrección. Motivo: ${observaciones || 'No especificado'}`,
        usuario,
        datos_anteriores: JSON.stringify({ estado: 'cerrada', fecha_cierre: caja.fecha_cierre }),
        datos_nuevos: JSON.stringify({ estado: 'abierta', fecha_cierre: null })
      });

      return {
        exito: true,
        mensaje: `Caja #${cajaId} reabierta exitosamente`,
        datos: { caja_id: cajaId }
      };

    } catch (error) {
      console.error('Error al reabrir caja:', error);
      return {
        exito: false,
        mensaje: 'Error interno al reabrir la caja',
        errores: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  // ==========================================================================
  // TRANSACCIONES
  // ==========================================================================

  /**
   * Registra una transacción en la caja activa
   */
  static async registrarMovimiento(movimiento: MovimientoCaja): Promise<ResultadoOperacion> {
    try {
      const cajaActiva = await this.getCajaActiva();
      if (!cajaActiva) {
        return {
          exito: false,
          mensaje: 'No hay caja abierta para registrar el movimiento',
          errores: ['NO_HAY_CAJA_ACTIVA']
        };
      }

      // Validaciones
      const validacion = this.validarMovimiento(movimiento);
      if (!validacion.exito) {
        return validacion;
      }

      // Registrar transacción
      const transaccionId = await this.registrarTransaccionInterno({
        caja_id: cajaActiva.id,
        ...movimiento
      });

      // Auditoría
      await this.registrarAuditoria({
        caja_id: cajaActiva.id,
        accion: 'MOVIMIENTO',
        detalle: `${movimiento.tipo.toUpperCase()}: ${movimiento.concepto} - ${movimiento.monto}`,
        usuario: movimiento.usuario,
        datos_nuevos: JSON.stringify(movimiento)
      });

      return {
        exito: true,
        mensaje: `Movimiento registrado exitosamente`,
        datos: { transaccion_id: transaccionId, caja_id: cajaActiva.id }
      };

    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      return {
        exito: false,
        mensaje: 'Error interno al registrar el movimiento',
        errores: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Método interno para registrar transacciones (sin validaciones externas)
   */
  private static async registrarTransaccionInterno(datos: {
    caja_id: number;
    tipo: 'ingreso' | 'egreso' | 'ajuste';
    monto: number;
    concepto: string;
    referencia?: string;
    usuario: string;
  }): Promise<number> {
    const resultado = await window.electronAPI.db.run(`
      INSERT INTO caja_transacciones (
        caja_id, tipo, monto, concepto, referencia, usuario, fecha
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [datos.caja_id, datos.tipo, datos.monto, datos.concepto, datos.referencia || null, datos.usuario]);
    
    return resultado.id!;
  }

  // ==========================================================================
  // CONSULTAS Y REPORTES
  // ==========================================================================

  /**
   * Obtiene la caja activa
   */
  static async getCajaActiva(): Promise<Caja | null> {
    try {
      const caja = await window.electronAPI.db.get(`
        SELECT * FROM cajas WHERE estado = 'abierta' ORDER BY fecha_apertura DESC LIMIT 1
      `);
      return caja || null;
    } catch (error) {
      console.error('Error al obtener caja activa:', error);
      return null;
    }
  }

  /**
   * Obtiene el resumen completo de una caja usando las vistas optimizadas
   */
  static async getResumenCaja(cajaId: number): Promise<ResumenCaja | null> {
    try {
      const resumen = await window.electronAPI.db.get(`
        SELECT * FROM caja_resumen_kpis WHERE id = ?
      `, [cajaId]);

      if (!resumen) return null;

      // Calcular KPIs adicionales
      // Efectivo disponible = ventas en efectivo + cobros CxC en efectivo
      const efectivoDisponible = resumen.ventas_efectivo + resumen.cobros_cxc_efectivo;
      // Total recibido = total_ingresos (que ya incluye ventas y otros ingresos)
      const totalRecibido = resumen.total_ingresos;
      const totalDigital = resumen.ventas_tarjeta + resumen.ventas_transferencia;
      const totalVentasEfectivas = resumen.ventas_efectivo + totalDigital;
      
      return {
        caja_id: resumen.id,
        fecha_apertura: resumen.fecha_apertura,
        fecha_cierre: resumen.fecha_cierre,
        usuario: resumen.usuario,
        estado: resumen.estado,
        monto_inicial: resumen.monto_inicial,
        saldo_final_calculado: resumen.saldo_final_calculado,
        total_ingresos: resumen.total_ingresos,
        total_egresos: resumen.total_egresos,
        total_ajustes: resumen.total_ajustes,
        ventas_efectivo: resumen.ventas_efectivo,
        ventas_tarjeta: resumen.ventas_tarjeta,
        ventas_transferencia: resumen.ventas_transferencia,
        ventas_mixto: resumen.ventas_mixto,
        total_ventas: resumen.total_ventas,
        cobros_cxc_efectivo: resumen.cobros_cxc_efectivo,
        total_gastos: resumen.total_gastos,
        total_pagos_proveedores: resumen.total_pagos_proveedores,
        efectivo_disponible: efectivoDisponible,
        total_recibido: totalRecibido,
        diferencia_esperada: 0, // Se calcula en el arqueo
        porcentaje_efectivo: totalVentasEfectivas > 0 ? (resumen.ventas_efectivo / totalVentasEfectivas) * 100 : 0,
        porcentaje_digital: totalVentasEfectivas > 0 ? (totalDigital / totalVentasEfectivas) * 100 : 0
      };
    } catch (error) {
      console.error('Error al obtener resumen de caja:', error);
      return null;
    }
  }

  /**
   * Obtiene las transacciones de una caja con detalles enriquecidos
   */
  static async getTransaccionesCaja(cajaId: number, limite: number = 100): Promise<CajaTransaccion[]> {
    try {
      return await window.electronAPI.db.query(`
        SELECT * FROM caja_transacciones_detalladas 
        WHERE caja_id = ? 
        ORDER BY fecha DESC 
        LIMIT ?
      `, [cajaId, limite]);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      return [];
    }
  }

  /**
   * Lista cajas con filtros
   */
  static async listarCajas(filtros: FiltrosCaja = {}): Promise<Caja[]> {
    try {
      let query = 'SELECT * FROM cajas WHERE 1=1';
      const params: any[] = [];

      if (filtros.fechaDesde) {
        query += ' AND date(fecha_apertura) >= ?';
        params.push(filtros.fechaDesde);
      }

      if (filtros.fechaHasta) {
        query += ' AND date(fecha_apertura) <= ?';
        params.push(filtros.fechaHasta);
      }

      if (filtros.usuario) {
        query += ' AND usuario LIKE ?';
        params.push(`%${filtros.usuario}%`);
      }

      if (filtros.estado && filtros.estado !== 'todas') {
        query += ' AND estado = ?';
        params.push(filtros.estado);
      }

      query += ' ORDER BY fecha_apertura DESC';
      
      if (filtros.limite) {
        query += ' LIMIT ?';
        params.push(filtros.limite);
      }

      return await window.electronAPI.db.query(query, params);
    } catch (error) {
      console.error('Error al listar cajas:', error);
      return [];
    }
  }

  // ==========================================================================
  // AUDITORÍA
  // ==========================================================================

  /**
   * Registra una entrada de auditoría
   */
  private static async registrarAuditoria(datos: Omit<AuditoriaCaja, 'id' | 'fecha'>): Promise<void> {
    try {
      await window.electronAPI.db.run(`
        INSERT INTO auditoria_cajas (
          caja_id, accion, detalle, usuario, datos_anteriores, datos_nuevos, fecha
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        datos.caja_id,
        datos.accion,
        datos.detalle,
        datos.usuario,
        datos.datos_anteriores || null,
        datos.datos_nuevos || null
      ]);
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      // No lanzamos error para no afectar la operación principal
    }
  }

  /**
   * Obtiene el historial de auditoría de una caja
   */
  static async getAuditoriaCaja(cajaId: number): Promise<AuditoriaCaja[]> {
    try {
      return await window.electronAPI.db.query(`
        SELECT * FROM auditoria_cajas 
        WHERE caja_id = ? 
        ORDER BY fecha DESC
      `, [cajaId]);
    } catch (error) {
      console.error('Error al obtener auditoría:', error);
      return [];
    }
  }

  // ==========================================================================
  // VALIDACIONES
  // ==========================================================================

  /**
   * Valida los datos para abrir una caja
   */
  private static async validarAperturaCaja(montoInicial: number, usuario: string): Promise<ResultadoOperacion> {
    const errores: string[] = [];

    if (!usuario || usuario.trim().length === 0) {
      errores.push('El usuario es requerido');
    }

    if (montoInicial < 0) {
      errores.push('El monto inicial no puede ser negativo');
    }

    if (montoInicial > 1000000) {
      errores.push('El monto inicial es excesivamente alto');
    }

    return {
      exito: errores.length === 0,
      mensaje: errores.length === 0 ? 'Validación exitosa' : 'Errores de validación',
      errores
    };
  }

  /**
   * Valida un movimiento de caja
   */
  private static validarMovimiento(movimiento: MovimientoCaja): ResultadoOperacion {
    const errores: string[] = [];

    if (!movimiento.usuario || movimiento.usuario.trim().length === 0) {
      errores.push('El usuario es requerido');
    }

    if (!movimiento.concepto || movimiento.concepto.trim().length === 0) {
      errores.push('El concepto es requerido');
    }

    if (movimiento.monto <= 0) {
      errores.push('El monto debe ser mayor a cero');
    }

    if (movimiento.monto > 1000000) {
      errores.push('El monto es excesivamente alto');
    }

    if (!['ingreso', 'egreso', 'ajuste'].includes(movimiento.tipo)) {
      errores.push('Tipo de movimiento inválido');
    }

    return {
      exito: errores.length === 0,
      mensaje: errores.length === 0 ? 'Validación exitosa' : 'Errores de validación',
      errores
    };
  }

  // ==========================================================================
  // MÉTODOS DE COMPATIBILIDAD (LEGACY)
  // ==========================================================================

  /**
   * Método legacy para compatibilidad
   */
  static async registrarTransaccion(datos: {
    caja_id: number;
    tipo: 'ingreso' | 'egreso' | 'ajuste';
    monto: number;
    concepto: string;
    referencia?: string;
    usuario: string;
  }): Promise<void> {
    await this.registrarTransaccionInterno(datos);
  }

  /**
   * Método legacy para resumen financiero
   */
  static async resumenFinanciero(cajaId: number): Promise<any> {
    const resumen = await this.getResumenCaja(cajaId);
    if (!resumen) return null;

    // El saldo final ya está correctamente calculado en la vista de base de datos
    // Fórmula: monto_inicial + total_ingresos - total_egresos + total_ajustes
    // No necesitamos recalcularlo aquí para evitar inconsistencias

    // Formato que espera el modal (nombres de propiedades corregidos)
    return {
      monto_inicial: resumen.monto_inicial,
      ventas_efectivo: resumen.ventas_efectivo,
      ventas_tarjeta: resumen.ventas_tarjeta,
      ventas_transferencia: resumen.ventas_transferencia,
      total_ventas: resumen.total_ventas,
      cobros_cxc_efectivo: resumen.cobros_cxc_efectivo,
      total_recibido: resumen.total_recibido,
      total_egresos: resumen.total_egresos,
      saldo_final_calculado: resumen.saldo_final_calculado,
      // Propiedades legacy para compatibilidad
      saldo_inicial: resumen.monto_inicial,
      ventas_total: resumen.total_ventas,
      saldo_final: resumen.saldo_final_calculado,
      ganancia_perdida_estimada: 0 // Deprecado
    };
  }
}

export default CajasService;