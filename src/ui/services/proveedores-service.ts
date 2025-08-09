// Servicio para manejar los proveedores
export interface Proveedor {
  id?: number;
  codigo: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  documento?: string;
  activo: boolean;
  fecha_creacion?: string;
  // Campos derivados/estadísticos (si se integran compras más adelante)
  total_compras?: number;
  ultima_compra?: string | null;
}

export class ProveedoresService {
  // Listar proveedores (por defecto todos, activos primero)
  static async obtenerTodos(): Promise<Proveedor[]> {
    return window.electronAPI.db.query(`
      SELECT 
        id, codigo, nombre, contacto, telefono, email, direccion, ciudad, documento, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      ORDER BY activo DESC, nombre
    `);
  }

  static async obtenerPorId(id: number): Promise<Proveedor | null> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        id, codigo, nombre, contacto, telefono, email, direccion, ciudad, documento, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      WHERE id = ?
    `, [id]);
    return result || null;
  }

  static async obtenerPorCodigo(codigo: string): Promise<Proveedor | null> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        id, codigo, nombre, contacto, telefono, email, direccion, ciudad, documento, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      WHERE codigo = ?
    `, [codigo]);
    return result || null;
  }

  static async buscar(termino: string): Promise<Proveedor[]> {
    const like = `%${termino}%`;
    return window.electronAPI.db.query(`
      SELECT 
        id, codigo, nombre, contacto, telefono, email, direccion, ciudad, documento, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      WHERE nombre LIKE ? OR codigo LIKE ? OR contacto LIKE ? OR documento LIKE ?
      ORDER BY activo DESC, nombre
    `, [like, like, like, like]);
  }

  static async crear(proveedor: Omit<Proveedor, 'id' | 'fecha_creacion' | 'total_compras' | 'ultima_compra'>): Promise<number> {
    const result = await window.electronAPI.db.run(`
      INSERT INTO proveedores (
        codigo, nombre, contacto, telefono, email, direccion, ciudad, documento, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      proveedor.codigo,
      proveedor.nombre,
      proveedor.contacto || '',
      proveedor.telefono || '',
      proveedor.email || '',
      proveedor.direccion || '',
      proveedor.ciudad || '',
      proveedor.documento || '',
      proveedor.activo ? 1 : 0
    ]);
    return result.id!;
  }

  static async actualizar(id: number, proveedor: Partial<Omit<Proveedor, 'id' | 'fecha_creacion' | 'total_compras' | 'ultima_compra'>>): Promise<void> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (proveedor.codigo !== undefined) { campos.push('codigo = ?'); valores.push(proveedor.codigo); }
    if (proveedor.nombre !== undefined) { campos.push('nombre = ?'); valores.push(proveedor.nombre); }
    if (proveedor.contacto !== undefined) { campos.push('contacto = ?'); valores.push(proveedor.contacto); }
    if (proveedor.telefono !== undefined) { campos.push('telefono = ?'); valores.push(proveedor.telefono); }
    if (proveedor.email !== undefined) { campos.push('email = ?'); valores.push(proveedor.email); }
    if (proveedor.direccion !== undefined) { campos.push('direccion = ?'); valores.push(proveedor.direccion); }
    if (proveedor.ciudad !== undefined) { campos.push('ciudad = ?'); valores.push(proveedor.ciudad); }
    if (proveedor.documento !== undefined) { campos.push('documento = ?'); valores.push(proveedor.documento); }
    if (proveedor.activo !== undefined) { campos.push('activo = ?'); valores.push(proveedor.activo ? 1 : 0); }

    if (campos.length === 0) return;
    valores.push(id);

    await window.electronAPI.db.run(`
      UPDATE proveedores 
      SET ${campos.join(', ')}
      WHERE id = ?
    `, valores);
  }

  static async eliminar(id: number): Promise<void> {
    await window.electronAPI.db.run('UPDATE proveedores SET activo = 0 WHERE id = ?', [id]);
  }

  static async existeCodigo(codigo: string, idExcluir?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) as count FROM proveedores WHERE codigo = ?';
    const params: any[] = [codigo];
    if (idExcluir) {
      query += ' AND id != ?';
      params.push(idExcluir);
    }
    const result = await window.electronAPI.db.get(query, params);
    return (result?.count || 0) > 0;
  }

  static async generarCodigo(): Promise<string> {
    const result = await window.electronAPI.db.get(`
      SELECT codigo FROM proveedores 
      WHERE codigo LIKE 'P%'
      ORDER BY CAST(SUBSTR(codigo, 2) AS INTEGER) DESC 
      LIMIT 1
    `);

    if (!result) return 'P001';
    const numeroActual = parseInt(result.codigo.substring(1));
    const siguiente = numeroActual + 1;
    return `P${siguiente.toString().padStart(3, '0')}`;
  }

  static async obtenerEstadisticas(): Promise<{
    totalProveedores: number;
    proveedoresActivos: number;
  }> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        COUNT(*) as totalProveedores,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as proveedoresActivos
      FROM proveedores
    `);
    return {
      totalProveedores: result?.totalProveedores || 0,
      proveedoresActivos: result?.proveedoresActivos || 0,
    };
  }
}
