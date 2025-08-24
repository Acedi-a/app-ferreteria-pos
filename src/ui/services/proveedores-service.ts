// Servicio para manejar los proveedores
export interface Proveedor {
  id?: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  activo: boolean;
  fecha_creacion?: string;
  // Campos derivados/estadísticos (si se integran compras más adelante)
  total_compras?: number;
  ultima_compra?: string | null;
}

export class ProveedoresService {
  private static verificarElectronAPI() {
    if (!window.electronAPI?.db) {
      throw new Error('La aplicación Electron no está disponible. Por favor, ejecute la aplicación desde Electron.');
    }
  }

  // Listar proveedores (por defecto todos, activos primero)
  static async obtenerTodos(): Promise<Proveedor[]> {
    this.verificarElectronAPI();
    return window.electronAPI.db.query(`
      SELECT 
        id, nombre, telefono, email, direccion, ciudad, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      ORDER BY activo DESC, nombre
    `);
  }

  static async obtenerPorId(id: number): Promise<Proveedor | null> {
    this.verificarElectronAPI();
    const result = await window.electronAPI.db.get(`
      SELECT 
        id, nombre, telefono, email, direccion, ciudad, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      WHERE id = ?
    `, [id]);
    return result || null;
  }

  static async obtenerPorCodigo(_codigo: string): Promise<Proveedor | null> {
    // Esta función ya no es relevante ya que no tenemos código
    // La mantenemos por compatibilidad pero retorna null
    return null;
  }

  static async buscar(termino: string): Promise<Proveedor[]> {
    const like = `%${termino}%`;
    return window.electronAPI.db.query(`
      SELECT 
        id, nombre, telefono, email, direccion, ciudad, 
        activo, fecha_creacion,
        0 as total_compras,
        NULL as ultima_compra
      FROM proveedores 
      WHERE nombre LIKE ? OR telefono LIKE ? OR email LIKE ?
      ORDER BY activo DESC, nombre
    `, [like, like, like]);
  }

  static async crear(proveedor: Omit<Proveedor, 'id' | 'fecha_creacion' | 'total_compras' | 'ultima_compra'>): Promise<number> {
    const result = await window.electronAPI.db.run(`
      INSERT INTO proveedores (
        nombre, telefono, email, direccion, ciudad, activo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      proveedor.nombre,
      proveedor.telefono || '',
      proveedor.email || '',
      proveedor.direccion || '',
      proveedor.ciudad || '',
      proveedor.activo ? 1 : 0
    ]);
    return result.id!;
  }

  static async actualizar(id: number, proveedor: Partial<Omit<Proveedor, 'id' | 'fecha_creacion' | 'total_compras' | 'ultima_compra'>>): Promise<void> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (proveedor.nombre !== undefined) { campos.push('nombre = ?'); valores.push(proveedor.nombre); }
    if (proveedor.telefono !== undefined) { campos.push('telefono = ?'); valores.push(proveedor.telefono); }
    if (proveedor.email !== undefined) { campos.push('email = ?'); valores.push(proveedor.email); }
    if (proveedor.direccion !== undefined) { campos.push('direccion = ?'); valores.push(proveedor.direccion); }
    if (proveedor.ciudad !== undefined) { campos.push('ciudad = ?'); valores.push(proveedor.ciudad); }
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

  static async existeCodigo(_codigo: string, _idExcluir?: number): Promise<boolean> {
    // Esta función ya no es relevante ya que no tenemos código
    // La mantenemos por compatibilidad pero siempre retorna false
    return false;
  }

  static async generarCodigo(): Promise<string> {
    // Esta función ya no es relevante ya que no tenemos código
    // La mantenemos por compatibilidad pero retorna un string vacío
    return '';
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
