export interface CategoriaForm {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface TipoUnidadForm {
  id?: number;
  nombre: string;
  abreviacion: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface CategoriaStats {
  totalCategorias: number;
  categoriasActivas: number;
  productosAsignados: number;
}

export interface TipoUnidadStats {
  totalTipos: number;
  tiposActivos: number;
  productosAsignados: number;
}

class CategoriaTipoService {
  // Categorías CRUD
  async obtenerCategorias(): Promise<CategoriaForm[]> {
    const result = await window.electronAPI.db.query(`
      SELECT * FROM categorias 
      ORDER BY nombre ASC
    `);
    return result || [];
  }

  async crearCategoria(categoria: Omit<CategoriaForm, 'id'>): Promise<number> {
    const result = await window.electronAPI.db.run(`
      INSERT INTO categorias (nombre, descripcion, activo)
      VALUES (?, ?, ?)
    `, [categoria.nombre, categoria.descripcion || null, categoria.activo ? 1 : 0]);
    return result.id || 0;
  }

  async actualizarCategoria(id: number, categoria: Partial<CategoriaForm>): Promise<boolean> {
    const campos = [];
    const valores = [];

    if (categoria.nombre) {
      campos.push('nombre = ?');
      valores.push(categoria.nombre);
    }
    if (categoria.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(categoria.descripcion || null);
    }
    if (categoria.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(categoria.activo ? 1 : 0);
    }

    campos.push('fecha_modificacion = CURRENT_TIMESTAMP');
    valores.push(id);

    const result = await window.electronAPI.db.run(`
      UPDATE categorias 
      SET ${campos.join(', ')}
      WHERE id = ?
    `, valores);
    return result.changes > 0;
  }

  async eliminarCategoria(id: number): Promise<boolean> {
    // Verificar si hay productos asignados
    const productosAsignados = await window.electronAPI.db.get(
      'SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?',
      [id]
    );

    if (productosAsignados.count > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asignados');
    }

    const result = await window.electronAPI.db.run(
      'DELETE FROM categorias WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async obtenerEstadisticasCategorias(): Promise<CategoriaStats> {
    const stats = await window.electronAPI.db.get(`
      SELECT 
        COUNT(*) as totalCategorias,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as categoriasActivas,
        (SELECT COUNT(DISTINCT categoria_id) FROM productos WHERE categoria_id IS NOT NULL) as productosAsignados
      FROM categorias
    `);

    return {
      totalCategorias: stats?.totalCategorias || 0,
      categoriasActivas: stats?.categoriasActivas || 0,
      productosAsignados: stats?.productosAsignados || 0
    };
  }

  // Tipos de Unidad CRUD
  async obtenerTiposUnidad(): Promise<TipoUnidadForm[]> {
    const result = await window.electronAPI.db.query(`
      SELECT * FROM tipos_unidad 
      ORDER BY nombre ASC
    `);
    return result || [];
  }

  async crearTipoUnidad(tipo: Omit<TipoUnidadForm, 'id'>): Promise<number> {
    const result = await window.electronAPI.db.run(`
      INSERT INTO tipos_unidad (nombre, abreviacion, descripcion, activo)
      VALUES (?, ?, ?, ?)
    `, [tipo.nombre, tipo.abreviacion, tipo.descripcion || null, tipo.activo ? 1 : 0]);
    return result.id || 0;
  }

  async actualizarTipoUnidad(id: number, tipo: Partial<TipoUnidadForm>): Promise<boolean> {
    const campos = [];
    const valores = [];

    if (tipo.nombre) {
      campos.push('nombre = ?');
      valores.push(tipo.nombre);
    }
    if (tipo.abreviacion) {
      campos.push('abreviacion = ?');
      valores.push(tipo.abreviacion);
    }
    if (tipo.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(tipo.descripcion || null);
    }
    if (tipo.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(tipo.activo ? 1 : 0);
    }

    campos.push('fecha_modificacion = CURRENT_TIMESTAMP');
    valores.push(id);

    const result = await window.electronAPI.db.run(`
      UPDATE tipos_unidad 
      SET ${campos.join(', ')}
      WHERE id = ?
    `, valores);
    return result.changes > 0;
  }

  async eliminarTipoUnidad(id: number): Promise<boolean> {
    // Verificar si hay productos asignados
    const productosAsignados = await window.electronAPI.db.get(
      'SELECT COUNT(*) as count FROM productos WHERE tipo_unidad_id = ?',
      [id]
    );

    if (productosAsignados.count > 0) {
      throw new Error('No se puede eliminar el tipo de unidad porque tiene productos asignados');
    }

    const result = await window.electronAPI.db.run(
      'DELETE FROM tipos_unidad WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async obtenerEstadisticasTipos(): Promise<TipoUnidadStats> {
    const stats = await window.electronAPI.db.get(`
      SELECT 
        COUNT(*) as totalTipos,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as tiposActivos,
        (SELECT COUNT(DISTINCT tipo_unidad_id) FROM productos WHERE tipo_unidad_id IS NOT NULL) as productosAsignados
      FROM tipos_unidad
    `);

    return {
      totalTipos: stats?.totalTipos || 0,
      tiposActivos: stats?.tiposActivos || 0,
      productosAsignados: stats?.productosAsignados || 0
    };
  }

  // Validaciones
  async validarNombreCategoria(nombre: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM categorias WHERE nombre = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM categorias WHERE nombre = ?';
    
    const params = excludeId ? [nombre, excludeId] : [nombre];
    const result = await window.electronAPI.db.get(query, params);
    return result.count === 0;
  }

  async validarNombreTipoUnidad(nombre: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM tipos_unidad WHERE nombre = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM tipos_unidad WHERE nombre = ?';
    
    const params = excludeId ? [nombre, excludeId] : [nombre];
    const result = await window.electronAPI.db.get(query, params);
    return result.count === 0;
  }

  async validarAbreviacionTipoUnidad(abreviacion: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? 'SELECT COUNT(*) as count FROM tipos_unidad WHERE abreviacion = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM tipos_unidad WHERE abreviacion = ?';
    
    const params = excludeId ? [abreviacion, excludeId] : [abreviacion];
    const result = await window.electronAPI.db.get(query, params);
    return result.count === 0;
  }
}

export const categoriaTipoService = new CategoriaTipoService();
