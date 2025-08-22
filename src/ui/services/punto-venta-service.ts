// Interfaces para Punto de Venta
export interface Producto {
  id: number;
  codigo_barras?: string;
  codigo_interno?: string;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  categoria_id?: number;
  categoria_nombre?: string;
  precio_venta: number;
  precio_compra?: number;
  precio_venta_fraccionada?: number;
  stock_actual: number;
  stock_minimo?: number;
  venta_fraccionada?: boolean;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

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
  tipo_documento?: string;
  activo: boolean;
  fecha_creacion: string;
  saldo_pendiente?: number;
  total_compras?: number;
}

export interface VentaDetalle {
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  es_fraccionado?: boolean;
}

export interface NuevaVenta {
  cliente_id?: number;
  metodo_pago: string;
  subtotal: number;
  descuento: number;
  total: number;
  observaciones?: string;
  detalles: VentaDetalle[];
  es_credito?: boolean;
  pago_inicial?: number;
}

export interface Venta {
  id: number;
  numero_venta: string;
  cliente_id?: number;
  cliente_nombre?: string;
  fecha_venta: string;
  metodo_pago: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_modificacion?: string;
  detalles?: VentaDetalle[];
}

import { InventarioService } from './inventario-service';

export class PuntoVentaService {
  static async obtenerProductoPorCodigo(codigo: string): Promise<Producto | null> {
    try {
      const query = `
        SELECT 
          p.id,
          p.codigo_barras,
          p.codigo_interno,
          p.nombre,
          p.descripcion,
          p.venta_fraccionada,
          p.precio_venta,
          ia.stock_actual,
          ia.stock_minimo,
          p.activo,
          p.fecha_creacion,
          c.nombre as categoria_nombre
        FROM inventario_actual ia
        INNER JOIN productos p ON p.id = ia.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = 1 AND (p.codigo_barras = ? OR p.codigo_interno = ?)
        LIMIT 1
      `;
      const row = await window.electronAPI.db.get(query, [codigo, codigo]);
      return row || null;
    } catch (error) {
      console.error('Error al obtener producto por código:', error);
      throw error;
    }
  }
  // Productos
  static async obtenerProductos(): Promise<Producto[]> {
    try {
      const query = `
        SELECT 
          p.id,
          p.codigo_barras,
          p.codigo_interno,
          p.nombre,
          p.descripcion,
          p.imagen_url,
          p.venta_fraccionada,
          p.precio_venta,
          ia.stock_actual,
          ia.stock_minimo,
          p.activo,
          p.fecha_creacion,
          c.nombre as categoria_nombre
        FROM inventario_actual ia
        INNER JOIN productos p ON p.id = ia.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = 1 AND p.nombre IS NOT NULL
        ORDER BY p.nombre ASC
      `;
      
      return window.electronAPI.db.query(query);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  // Búsqueda por nombre o código para POS (autocompletado)
  static async buscarProductos(termino: string, limit = 10): Promise<Producto[]> {
    try {
      const like = `%${termino}%`;
      const query = `
        SELECT 
          p.id,
          p.codigo_barras,
          p.codigo_interno,
          p.nombre,
          p.descripcion,
          p.imagen_url,
          p.venta_fraccionada,
          p.precio_venta,
          ia.stock_actual,
          ia.stock_minimo,
          p.activo,
          p.fecha_creacion,
          c.nombre as categoria_nombre
        FROM inventario_actual ia
        INNER JOIN productos p ON p.id = ia.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = 1 AND (
          p.nombre LIKE ? OR p.codigo_interno LIKE ? OR p.codigo_barras LIKE ?
        )
        ORDER BY p.nombre ASC
        LIMIT ?
      `;
      return await window.electronAPI.db.query(query, [like, like, like, limit]);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }

  // Categorías
  static async obtenerCategorias(): Promise<Categoria[]> {
    try {
      const query = `
        SELECT * FROM categorias 
        WHERE activo = 1 
        ORDER BY nombre ASC
      `;
      
      return window.electronAPI.db.query(query);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  // Clientes
  static async obtenerClientes(): Promise<Cliente[]> {
    try {
      const query = `
        SELECT * FROM clientes 
        WHERE activo = 1 
        ORDER BY nombre ASC, apellido ASC
      `;
      
      return window.electronAPI.db.query(query);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  }

  // Ventas
  static async crearVenta(venta: NuevaVenta): Promise<number> {
    try {
      console.log('Datos de venta recibidos en servicio:', venta);
      
      // Determinar estado de la venta
      const estadoVenta = venta.es_credito ? 'credito' : 'completada';

      // Insertar venta principal primero sin numero_venta
      const ventaQuery = `
        INSERT INTO ventas (
          numero_venta, cliente_id, almacen_id, fecha_venta, metodo_pago, 
          subtotal, descuento, total, estado, observaciones, usuario
        ) VALUES (?, ?, 1, datetime('now'), ?, ?, ?, ?, ?, ?, 'POS')
      `;

      // Generar número temporal para obtener el ID
      const numeroTemporal = 'TEMP';

      const ventaResult = await window.electronAPI.db.run(ventaQuery, [
        numeroTemporal,
        venta.cliente_id || null,
        venta.metodo_pago,
        venta.subtotal,
        venta.descuento,
        venta.total,
        estadoVenta,
        venta.observaciones || null
      ]);

      const ventaId = ventaResult.id!;
      console.log('Venta creada con ID:', ventaId);

      // Ahora generar el número de venta único usando el ID
      const numeroVenta = this.generarNumeroVentaConId(ventaId);

      // Actualizar la venta con el número correcto
      await window.electronAPI.db.run(
        'UPDATE ventas SET numero_venta = ? WHERE id = ?',
        [numeroVenta, ventaId]
      );

      console.log('Número de venta asignado:', numeroVenta);

  // Insertar detalles de venta
      for (const detalle of venta.detalles) {
        console.log('Insertando detalle:', detalle);
        
        if (!detalle.producto_id) {
          throw new Error(`Producto sin ID válido: ${JSON.stringify(detalle)}`);
        }
        
        const detalleQuery = `
          INSERT INTO venta_detalles (
            venta_id, producto_id, cantidad, precio_unitario, subtotal
          ) VALUES (?, ?, ?, ?, ?)
        `;

        await window.electronAPI.db.run(detalleQuery, [
          ventaId,
          detalle.producto_id,
          detalle.cantidad,
          detalle.precio_unitario,
          detalle.subtotal
        ]);

        // Registrar salida de inventario como movimiento
        await InventarioService.registrarMovimiento({
          producto_id: detalle.producto_id,
          tipo_movimiento: 'salida',
          cantidad: detalle.cantidad,
          observaciones: `Venta ${numeroVenta}`,
        });
      }

      // Si es venta a crédito, crear cuenta por cobrar
      if (venta.es_credito && venta.cliente_id) {
        await this.crearCuentaPorCobrar(ventaId, venta, numeroVenta);
      }

      return ventaId;

    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  }

  // Crear cuenta por cobrar para ventas a crédito
  private static async crearCuentaPorCobrar(ventaId: number, venta: NuevaVenta, numeroVenta: string) {
    try {
      const pagoInicial = venta.pago_inicial || 0;
      const montoAdeudado = venta.total - pagoInicial;

      // Solo crear cuenta por cobrar si hay monto adeudado
      if (montoAdeudado > 0) {
        const cuentaQuery = `
          INSERT INTO cuentas_por_cobrar (
            cliente_id, venta_id, monto, saldo, fecha_vencimiento, estado, observaciones
          ) VALUES (?, ?, ?, ?, date('now', '+30 days'), 'pendiente', ?)
        `;

        const observacionesCuenta = `Venta a crédito - ${numeroVenta}` + 
          (pagoInicial > 0 ? ` (Pago inicial: Bs ${pagoInicial.toFixed(2)})` : '');

        await window.electronAPI.db.run(cuentaQuery, [
          venta.cliente_id,
          ventaId,
          venta.total,        // El monto total de la venta
          montoAdeudado,      // El saldo pendiente (total - pago inicial)
          observacionesCuenta
        ]);

        console.log(`Cuenta por cobrar creada:
          - Monto total: Bs ${venta.total.toFixed(2)}
          - Pago inicial: Bs ${pagoInicial.toFixed(2)}
          - Saldo pendiente: Bs ${montoAdeudado.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error al crear cuenta por cobrar:', error);
      throw error;
    }
  }

  private static generarNumeroVentaConId(ventaId: number): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    
    return `V-${año}${mes}${dia}-${ventaId}`;
  }

  // El stock ahora se gestiona mediante la vista inventario_actual y la tabla movimientos

  // Actualizar estado de venta cuando se complete el pago
  static async actualizarEstadoVentaSiCompletada(cuentaId: number): Promise<void> {
    try {
      // Obtener información de la cuenta por cobrar
      const cuenta = await window.electronAPI.db.get(`
        SELECT venta_id, saldo 
        FROM cuentas_por_cobrar 
        WHERE id = ?
      `, [cuentaId]);

      if (cuenta && cuenta.saldo <= 0) {
        // Si el saldo es 0 o negativo, marcar la venta como completada
        await window.electronAPI.db.run(`
          UPDATE ventas 
          SET estado = 'completada'
          WHERE id = ?
        `, [cuenta.venta_id]);

        // También actualizar el estado de la cuenta por cobrar
        await window.electronAPI.db.run(`
          UPDATE cuentas_por_cobrar 
          SET estado = 'pagada'
          WHERE id = ?
        `, [cuentaId]);

        console.log(`Venta ${cuenta.venta_id} marcada como completada - Crédito totalmente pagado`);
      }
    } catch (error) {
      console.error('Error al actualizar estado de venta:', error);
      throw error;
    }
  }

  // Registrar pago y actualizar saldo
  static async registrarPagoCredito(cuentaId: number, montoPago: number, metodoPago: string, observaciones?: string): Promise<void> {
    try {
      // Registrar el pago
      await window.electronAPI.db.run(`
        INSERT INTO pagos_cuentas (cuenta_id, monto, metodo_pago, observaciones)
        VALUES (?, ?, ?, ?)
      `, [cuentaId, montoPago, metodoPago, observaciones || '']);

      // Actualizar el saldo de la cuenta
      await window.electronAPI.db.run(`
        UPDATE cuentas_por_cobrar 
        SET saldo = saldo - ?
        WHERE id = ?
      `, [montoPago, cuentaId]);

      // Verificar si la venta debe marcarse como completada
      await this.actualizarEstadoVentaSiCompletada(cuentaId);

      console.log(`Pago registrado: Bs ${montoPago.toFixed(2)} para cuenta ${cuentaId}`);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  }
}

export default PuntoVentaService;
