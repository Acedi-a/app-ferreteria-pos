// Interfaces para Punto de Venta
import { CajasService } from '../ui/services/cajas-service';

export interface Producto {
  id: number;
  codigo_barras?: string;
  codigo_interno?: string;
  nombre: string;
  descripcion?: string;
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


export class PuntoVentaService {
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
          p.precio_venta,
          ia.stock_actual,
          ia.stock_minimo,
          p.venta_fraccionada,
          p.activo,
          p.fecha_creacion,
          c.nombre as categoria_nombre
        FROM inventario_actual ia
        INNER JOIN productos p ON p.id = ia.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = 1
        ORDER BY p.nombre ASC
      `;
      
      return window.electronAPI.db.query(query);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  static async obtenerProductoPorId(id: number): Promise<Producto | null> {
    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ? AND p.activo = 1
      `;
      
      return window.electronAPI.db.get(query, [id]);
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }
  }

  static async buscarProductos(termino: string): Promise<Producto[]> {
    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = 1 
        AND (
          p.nombre LIKE ? OR 
          p.codigo_barras LIKE ? OR 
          p.codigo_interno LIKE ? OR
          p.descripcion LIKE ?
        )
        ORDER BY p.nombre ASC
      `;
      
      const termSearch = `%${termino}%`;
      return window.electronAPI.db.query(query, [termSearch, termSearch, termSearch, termSearch]);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }

  static async obtenerProductosPorCategoria(categoriaId: number): Promise<Producto[]> {
    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.categoria_id = ? AND p.activo = 1
        ORDER BY p.nombre ASC
      `;
      
      return window.electronAPI.db.query(query, [categoriaId]);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
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

  static async buscarClientes(termino: string): Promise<Cliente[]> {
    try {
      const query = `
        SELECT * FROM clientes 
        WHERE activo = 1 
        AND (
          nombre LIKE ? OR 
          apellido LIKE ? OR 
          codigo LIKE ? OR
          documento LIKE ?
        )
        ORDER BY nombre ASC, apellido ASC
      `;
      
      const termSearch = `%${termino}%`;
      return window.electronAPI.db.query(query, [termSearch, termSearch, termSearch, termSearch]);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw error;
    }
  }

  // Ventas
  static async crearVenta(venta: NuevaVenta): Promise<number> {
    try {
      // Verificar que hay una caja abierta
      const cajaActiva = await CajasService.getCajaActiva();
      if (!cajaActiva) {
        throw new Error('No hay una caja abierta. Debe abrir una caja antes de realizar ventas.');
      }

      // Generar número de venta
      const numeroVenta = await this.generarNumeroVenta();

      // Insertar venta principal
      const ventaQuery = `
        INSERT INTO ventas (
          numero_venta, cliente_id, fecha_venta, metodo_pago, 
          subtotal, descuento, total, estado, observaciones,
          fecha_creacion, fecha_modificacion
        ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, 'completada', ?, datetime('now'), datetime('now'))
      `;

      const ventaResult = await window.electronAPI.db.run(ventaQuery, [
        numeroVenta,
        venta.cliente_id || null,
        venta.metodo_pago,
        venta.subtotal,
        venta.descuento,
        venta.total,
        venta.observaciones || null
      ]);

      const ventaId = ventaResult.id!;

      // Insertar detalles de venta
      for (const detalle of venta.detalles) {
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
      }

      // Nota: El registro en caja se maneja en el servicio frontend (UI)
      // que tiene la lógica completa para ventas a crédito y pago inicial

      // Nota: el stock se actualiza mediante movimientos en la capa UI
      return ventaId;

    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  }

  private static async generarNumeroVenta(): Promise<string> {
    try {
      const query = `
        SELECT COUNT(*) as total 
        FROM ventas 
        WHERE DATE(fecha_venta) = DATE('now')
      `;
      
      const result = await window.electronAPI.db.get(query);
      const ventasHoy = result?.total || 0;
      
      const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const numero = String(ventasHoy + 1).padStart(4, '0');
      
      return `V${fecha}${numero}`;
    } catch (error) {
      console.error('Error al generar número de venta:', error);
      throw error;
    }
  }

  // El stock se gestiona por movimientos e inventario_actual

  static async obtenerVentas(limite: number = 50): Promise<Venta[]> {
    try {
      const query = `
        SELECT 
          v.*,
          c.nombre || ' ' || c.apellido as cliente_nombre
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.fecha_venta DESC
        LIMIT ?
      `;
      
      return window.electronAPI.db.query(query, [limite]);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  }

  static async obtenerDetallesVenta(ventaId: number): Promise<VentaDetalle[]> {
    try {
      const query = `
        SELECT 
          vd.*,
          p.nombre as producto_nombre
        FROM venta_detalles vd
        INNER JOIN productos p ON vd.producto_id = p.id
        WHERE vd.venta_id = ?
        ORDER BY vd.id ASC
      `;
      
      return window.electronAPI.db.query(query, [ventaId]);
    } catch (error) {
      console.error('Error al obtener detalles de venta:', error);
      throw error;
    }
  }

  // Estadísticas y reportes
  static async obtenerEstadisticasVentas(): Promise<any> {
    try {
      const ventasHoy = await window.electronAPI.db.get(`
        SELECT 
          COUNT(*) as cantidad,
          COALESCE(SUM(total), 0) as total
        FROM ventas 
        WHERE DATE(fecha_venta) = DATE('now')
      `);

      const ventasMes = await window.electronAPI.db.get(`
        SELECT 
          COUNT(*) as cantidad,
          COALESCE(SUM(total), 0) as total
        FROM ventas 
        WHERE strftime('%Y-%m', fecha_venta) = strftime('%Y-%m', 'now')
      `);

      const bajoStock = await window.electronAPI.db.get(`
        SELECT COUNT(*) as cantidad
        FROM productos 
        WHERE activo = 1 
        AND stock_actual <= stock_minimo
      `);

      return {
        ventasHoy: ventasHoy || { cantidad: 0, total: 0 },
        ventasMes: ventasMes || { cantidad: 0, total: 0 },
        productosConBajoStock: bajoStock?.cantidad || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

export default PuntoVentaService;
