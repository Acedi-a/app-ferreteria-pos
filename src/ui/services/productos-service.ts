export interface Producto {
  id?: number;
  codigo_barras?: string;
  codigo_interno: string;
  nombre: string;
  descripcion?: string;
  costo_unitario?: number; // nuevo: costo base en maestro
  precio_venta: number; // precio de venta sugerido
  stock_minimo: number;
  categoria_id?: number;
  tipo_unidad_id?: number;
  unidad_medida?: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  imagen_url?: string; // nueva columna para imagen
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
  // Productos CRUD - Solo datos maestros
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

  async crearProducto(producto: Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<number> {
    const campos = [];
    const valores = [];
    const placeholders = [];

    // Construir query dinámicamente solo con campos de datos maestros
    if (producto.codigo_barras) {
      campos.push('codigo_barras');
      valores.push(producto.codigo_barras);
      placeholders.push('?');
    }

    campos.push('codigo_interno', 'nombre', 'precio_venta', 'stock_minimo', 'activo');
    valores.push(
      producto.codigo_interno,
      producto.nombre,
      producto.precio_venta,
      producto.stock_minimo,
      producto.activo ? 1 : 0
    );
    placeholders.push('?', '?', '?', '?', '?');

    if (producto.costo_unitario !== undefined) {
      campos.push('costo_unitario');
      valores.push(producto.costo_unitario);
      placeholders.push('?');
    }

    if (producto.imagen_url) {
      campos.push('imagen_url');
      valores.push(producto.imagen_url);
      placeholders.push('?');
    }

    if (producto.descripcion) {
      campos.push('descripcion');
      valores.push(producto.descripcion);
      placeholders.push('?');
    }

    if (producto.unidad_medida) {
      campos.push('unidad_medida');
      valores.push(producto.unidad_medida);
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

    const query = `INSERT INTO productos (${campos.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const result = await window.electronAPI.db.run(query, valores);
    return result.id || 0;
  }

  async actualizarProducto(id: number, producto: Partial<Producto>): Promise<boolean> {
    const campos = [];
    const valores = [];

    // Construir dinámicamente la consulta UPDATE solo con campos de datos maestros
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
    if (producto.precio_venta !== undefined) {
      campos.push('precio_venta = ?');
      valores.push(producto.precio_venta);
    }
    if (producto.costo_unitario !== undefined) {
      campos.push('costo_unitario = ?');
      valores.push(producto.costo_unitario);
    }
    if (producto.imagen_url !== undefined) {
      campos.push('imagen_url = ?');
      valores.push(producto.imagen_url || null);
    }
    if (producto.stock_minimo !== undefined) {
      campos.push('stock_minimo = ?');
      valores.push(producto.stock_minimo);
    }
    if (producto.unidad_medida !== undefined) {
      campos.push('unidad_medida = ?');
      valores.push(producto.unidad_medida || null);
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

    if (campos.length === 0) {
      return false; // No hay campos para actualizar
    }

    // Siempre actualizar fecha_actualizacion
    campos.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    valores.push(id);

    const query = `UPDATE productos SET ${campos.join(', ')} WHERE id = ?`;
    const result = await window.electronAPI.db.run(query, valores);
    return result.changes > 0;
  }

  async eliminarProducto(id: number): Promise<boolean> {
    const result = await window.electronAPI.db.run(
      'UPDATE productos SET activo = 0, imagen_url = NULL WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async obtenerProductoPorId(id: number): Promise<Producto | null> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        tu.nombre as tipo_unidad_nombre,
        tu.abreviacion as tipo_unidad_abreviacion
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN tipos_unidad tu ON p.tipo_unidad_id = tu.id
      WHERE p.id = ?
    `, [id]);
    return result || null;
  }

  async obtenerProductoPorCodigo(codigo: string): Promise<Producto | null> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        tu.nombre as tipo_unidad_nombre,
        tu.abreviacion as tipo_unidad_abreviacion
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN tipos_unidad tu ON p.tipo_unidad_id = tu.id
      WHERE p.codigo_interno = ? OR p.codigo_barras = ?
    `, [codigo, codigo]);
    return result || null;
  }

  async obtenerEstadisticas(): Promise<ProductoStats> {
    // Obtener estadísticas desde la vista inventario_actual
    const result = await window.electronAPI.db.get(`
      SELECT 
  COUNT(*) as totalProductos,
  COUNT(CASE WHEN ia.stock_actual <= p.stock_minimo THEN 1 END) as stockBajo,
  COALESCE(SUM(ia.valor_total), 0) as valorInventario,
  COUNT(CASE WHEN p.activo = 1 THEN 1 END) as productosActivos
      FROM inventario_actual ia
      JOIN productos p ON p.id = ia.id
    `);
    
    return {
      totalProductos: result?.totalProductos || 0,
      stockBajo: result?.stockBajo || 0,
      valorInventario: result?.valorInventario || 0,
      productosActivos: result?.productosActivos || 0,
    };
  }

  // Categorías CRUD
  async obtenerCategorias(): Promise<Categoria[]> {
    const result = await window.electronAPI.db.query(
      'SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre ASC'
    );
    return result || [];
  }

  async crearCategoria(categoria: Omit<Categoria, 'id'>): Promise<number> {
    const result = await window.electronAPI.db.run(
      'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, ?)',
      [categoria.nombre, categoria.descripcion || null, categoria.activo ? 1 : 0]
    );
    return result.id || 0;
  }

  // Tipos de unidad CRUD
  async obtenerTiposUnidad(): Promise<TipoUnidad[]> {
    const result = await window.electronAPI.db.query(
      'SELECT * FROM tipos_unidad WHERE activo = 1 ORDER BY nombre ASC'
    );
    return result || [];
  }

  async crearTipoUnidad(tipo: Omit<TipoUnidad, 'id'>): Promise<number> {
    const result = await window.electronAPI.db.run(
      'INSERT INTO tipos_unidad (nombre, abreviacion, descripcion, activo) VALUES (?, ?, ?, ?)',
      [tipo.nombre, tipo.abreviacion, tipo.descripcion || null, tipo.activo ? 1 : 0]
    );
    return result.id || 0;
  }
}

export const productosService = new ProductosService();
export default ProductosService;
