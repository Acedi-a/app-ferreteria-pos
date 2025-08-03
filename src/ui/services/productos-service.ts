export interface Producto {
  id?: number;
  codigo_barras?: string;
  codigo_interno: string;
  nombre: string;
  descripcion?: string;
  costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  venta_fraccionada: boolean;
  categoria_id?: number;
  tipo_unidad_id?: number;
  activo: boolean;
  fotos?: string;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  // Campos calculados/join
  categoria_nombre?: string;
  tipo_unidad_nombre?: string;
  tipo_unidad_abreviacion?: string;
}

export interface ProductoStats {
  totalProductos: number;
  stockBajo: number;
  valorInventario: number;
  productosActivos: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface TipoUnidad {
  id: number;
  nombre: string;
  abreviacion: string;
  descripcion?: string;
  activo: boolean;
}

class ProductosService {
  // Productos CRUD
  async obtenerProductos(): Promise<Producto[]> {
    const result = await window.electronAPI.db.query(`
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        tu.nombre as tipo_unidad_nombre,
        tu.abreviacion as tipo_unidad_abreviacion
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN tipos_unidad tu ON p.tipo_unidad_id = tu.id
      ORDER BY p.nombre ASC
    `);
    return result || [];
  }

  async buscarProductos(termino: string): Promise<Producto[]> {
    const result = await window.electronAPI.db.query(`
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        tu.nombre as tipo_unidad_nombre,
        tu.abreviacion as tipo_unidad_abreviacion
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN tipos_unidad tu ON p.tipo_unidad_id = tu.id
      WHERE 
        p.nombre LIKE ? OR 
        p.codigo_interno LIKE ? OR 
        p.codigo_barras LIKE ? OR
        p.descripcion LIKE ? OR
        c.nombre LIKE ?
      ORDER BY p.nombre ASC
    `, [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`]);
    return result || [];
  }

  async crearProducto(producto: Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_modificacion'>): Promise<number> {
    const campos = [];
    const valores = [];
    const placeholders = [];

    // Construir query dinámicamente
    if (producto.codigo_barras) {
      campos.push('codigo_barras');
      valores.push(producto.codigo_barras);
      placeholders.push('?');
    }

    campos.push('codigo_interno', 'nombre', 'costo', 'precio_venta', 'stock_actual', 'stock_minimo', 'venta_fraccionada', 'activo');
    valores.push(
      producto.codigo_interno,
      producto.nombre,
      producto.costo,
      producto.precio_venta,
      producto.stock_actual,
      producto.stock_minimo,
      producto.venta_fraccionada ? 1 : 0,
      producto.activo ? 1 : 0
    );
    placeholders.push('?', '?', '?', '?', '?', '?', '?', '?');

    if (producto.descripcion) {
      campos.push('descripcion');
      valores.push(producto.descripcion);
      placeholders.push('?');
    }

    if (producto.categoria_id) {
      campos.push('categoria_id');
      valores.push(producto.categoria_id);
      placeholders.push('?');
    }

    if (producto.tipo_unidad_id) {
      campos.push('tipo_unidad_id');
      valores.push(producto.tipo_unidad_id);
      placeholders.push('?');
    }

    if (producto.fotos) {
      campos.push('fotos');
      valores.push(producto.fotos);
      placeholders.push('?');
    }

    const query = `
      INSERT INTO productos (${campos.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;

    const result = await window.electronAPI.db.run(query, valores);
    return result.id || 0;
  }

  async actualizarProducto(id: number, producto: Partial<Producto>): Promise<boolean> {
    const campos = [];
    const valores = [];

    // Construir dinámicamente la consulta UPDATE solo con los campos proporcionados
    if (producto.codigo_barras !== undefined) {
      campos.push('codigo_barras = ?');
      valores.push(producto.codigo_barras || null);
    }
    if (producto.codigo_interno !== undefined) {
      campos.push('codigo_interno = ?');
      valores.push(producto.codigo_interno);
    }
    if (producto.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(producto.nombre);
    }
    if (producto.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(producto.descripcion || null);
    }
    if (producto.costo !== undefined) {
      campos.push('costo = ?');
      valores.push(producto.costo);
    }
    if (producto.precio_venta !== undefined) {
      campos.push('precio_venta = ?');
      valores.push(producto.precio_venta);
    }
    if (producto.stock_actual !== undefined) {
      campos.push('stock_actual = ?');
      valores.push(producto.stock_actual);
    }
    if (producto.stock_minimo !== undefined) {
      campos.push('stock_minimo = ?');
      valores.push(producto.stock_minimo);
    }
    if (producto.venta_fraccionada !== undefined) {
      campos.push('venta_fraccionada = ?');
      valores.push(producto.venta_fraccionada ? 1 : 0);
    }
    if (producto.categoria_id !== undefined) {
      campos.push('categoria_id = ?');
      valores.push(producto.categoria_id || null);
    }
    if (producto.tipo_unidad_id !== undefined) {
      campos.push('tipo_unidad_id = ?');
      valores.push(producto.tipo_unidad_id || null);
    }
    if (producto.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(producto.activo ? 1 : 0);
    }
    //if (producto.fotos !== undefined) {
      //campos.push('fotos = ?');
      //valores.push(producto.fotos || null);
    //}

    if (campos.length === 0) {
      return false; // No hay campos para actualizar
    }

    valores.push(id); // Agregar el ID al final para la cláusula WHERE

    const result = await window.electronAPI.db.run(`
      UPDATE productos 
      SET ${campos.join(', ')}
      WHERE id = ?
    `, valores);
    
    return result.changes > 0;
  }

  async eliminarProducto(id: number): Promise<boolean> {
    const result = await window.electronAPI.db.run(
      'DELETE FROM productos WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async obtenerEstadisticas(): Promise<ProductoStats> {
    const statsResult = await window.electronAPI.db.get(`
      SELECT 
        COUNT(*) as totalProductos,
        COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as stockBajo,
        SUM(costo * stock_actual) as valorInventario,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as productosActivos
      FROM productos
    `);

    return {
      totalProductos: statsResult?.totalProductos || 0,
      stockBajo: statsResult?.stockBajo || 0,
      valorInventario: statsResult?.valorInventario || 0,
      productosActivos: statsResult?.productosActivos || 0
    };
  }

  // Categorías CRUD
  async obtenerCategorias(): Promise<Categoria[]> {
    const result = await window.electronAPI.db.query(`
      SELECT * FROM categorias 
      WHERE activo = 1 
      ORDER BY nombre ASC
    `);
    return result || [];
  }

  // Tipos de Unidad CRUD
  async obtenerTiposUnidad(): Promise<TipoUnidad[]> {
    const result = await window.electronAPI.db.query(`
      SELECT * FROM tipos_unidad 
      WHERE activo = 1 
      ORDER BY nombre ASC
    `);
    return result || [];
  }

  // Validaciones
  async validarCodigoInterno(codigo: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM productos WHERE codigo_interno = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM productos WHERE codigo_interno = ?';
    
    const params = excludeId ? [codigo, excludeId] : [codigo];
    const result = await window.electronAPI.db.get(query, params);
    return result.count === 0;
  }

  async validarCodigoBarras(codigo: string, excludeId?: number): Promise<boolean> {
    if (!codigo) return true; // Código de barras es opcional
    
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM productos WHERE codigo_barras = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM productos WHERE codigo_barras = ?';
    
    const params = excludeId ? [codigo, excludeId] : [codigo];
    const result = await window.electronAPI.db.get(query, params);
    return result.count === 0;
  }
}

export const productosService = new ProductosService();
