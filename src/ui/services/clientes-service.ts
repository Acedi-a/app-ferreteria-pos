// Servicio para manejar los clientes
export interface Cliente {
  id?: number;
  codigo: string;
  nombre: string;
  apellido?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'no_especificado';
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  documento?: string;
  tipo_documento: "cedula" | "nit" | "pasaporte";
  activo: boolean;
  fecha_creacion?: string;
  saldo_pendiente: number;
  total_compras: number;
}

export class ClientesService {
  private static verificarElectronAPI() {
    if (!window.electronAPI?.db) {
      throw new Error('La aplicación Electron no está disponible. Por favor, ejecute la aplicación desde Electron.');
    }
  }

  // Obtener todos los clientes
  static async obtenerTodos(): Promise<Cliente[]> {
    this.verificarElectronAPI();
    return window.electronAPI.db.query(`
      SELECT 
        c.id, c.codigo, c.nombre, c.apellido, c.genero, c.telefono, c.email, c.direccion, c.ciudad,
        c.documento, c.tipo_documento, c.activo, c.fecha_creacion,
        COALESCE(c.saldo_pendiente, 0) as saldo_pendiente,
        COALESCE(
          (SELECT SUM(vd.precio_unitario * vd.cantidad) 
           FROM ventas v 
           JOIN venta_detalles vd ON v.id = vd.venta_id 
           WHERE v.cliente_id = c.id), 0
        ) as total_compras
      FROM clientes c
      ORDER BY c.nombre, c.apellido
    `);
  }

  // Obtener un cliente por ID
  static async obtenerPorId(id: number): Promise<Cliente | null> {
    this.verificarElectronAPI();
    const result = await window.electronAPI.db.get(`
      SELECT 
        c.id, c.codigo, c.nombre, c.apellido, c.genero, c.telefono, c.email, c.direccion, c.ciudad,
        c.documento, c.tipo_documento, c.activo, c.fecha_creacion,
        COALESCE(c.saldo_pendiente, 0) as saldo_pendiente,
        COALESCE(
          (SELECT SUM(vd.precio_unitario * vd.cantidad) 
           FROM ventas v 
           JOIN venta_detalles vd ON v.id = vd.venta_id 
           WHERE v.cliente_id = c.id), 0
        ) as total_compras
      FROM clientes c
      WHERE c.id = ?
    `, [id]);
    return result || null;
  }

  // Obtener cliente por código
  static async obtenerPorCodigo(codigo: string): Promise<Cliente | null> {
    this.verificarElectronAPI();
    const result = await window.electronAPI.db.get(`
      SELECT 
        c.id, c.codigo, c.nombre, c.apellido, c.genero, c.telefono, c.email, c.direccion, c.ciudad,
        c.documento, c.tipo_documento, c.activo, c.fecha_creacion,
        COALESCE(c.saldo_pendiente, 0) as saldo_pendiente,
        COALESCE(
          (SELECT SUM(vd.precio_unitario * vd.cantidad) 
           FROM ventas v 
           JOIN venta_detalles vd ON v.id = vd.venta_id 
           WHERE v.cliente_id = c.id), 0
        ) as total_compras
      FROM clientes c
      WHERE c.codigo = ?
    `, [codigo]);
    return result || null;
  }

  // Buscar clientes
  static async buscar(termino: string): Promise<Cliente[]> {
    const terminoLike = `%${termino}%`;
    return window.electronAPI.db.query(`
      SELECT 
        c.id, c.codigo, c.nombre, c.apellido, c.genero, c.telefono, c.email, c.direccion, c.ciudad,
        c.documento, c.tipo_documento, c.activo, c.fecha_creacion,
        COALESCE(c.saldo_pendiente, 0) as saldo_pendiente,
        COALESCE(
          (SELECT SUM(vd.precio_unitario * vd.cantidad) 
           FROM ventas v 
           JOIN venta_detalles vd ON v.id = vd.venta_id 
           WHERE v.cliente_id = c.id), 0
        ) as total_compras
      FROM clientes c
      WHERE c.nombre LIKE ? OR c.apellido LIKE ? OR c.codigo LIKE ? OR c.documento LIKE ?
      ORDER BY c.nombre, c.apellido
    `, [terminoLike, terminoLike, terminoLike, terminoLike]);
  }

  // Crear un nuevo cliente
  static async crear(cliente: Omit<Cliente, 'id' | 'fecha_creacion' | 'total_compras'>): Promise<number> {
    const result = await window.electronAPI.db.run(`
      INSERT INTO clientes (
        codigo, nombre, apellido, genero, telefono, email, direccion, ciudad,
        documento, tipo_documento, activo, saldo_pendiente
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cliente.codigo,
      cliente.nombre,
      cliente.apellido || '',
      cliente.genero || 'no_especificado',
      cliente.telefono || '',
      cliente.email || '',
      cliente.direccion || '',
      cliente.ciudad || '',
      cliente.documento || '',
      cliente.tipo_documento,
      cliente.activo ? 1 : 0,
      cliente.saldo_pendiente || 0
    ]);
    
    return result.id!;
  }

  // Actualizar un cliente existente
  static async actualizar(id: number, cliente: Partial<Omit<Cliente, 'id' | 'fecha_creacion' | 'total_compras'>>): Promise<void> {
    // Construir dinámicamente la consulta UPDATE solo con los campos proporcionados
    const campos = [];
    const valores = [];
    
    if (cliente.codigo !== undefined) {
      campos.push('codigo = ?');
      valores.push(cliente.codigo);
    }
    if (cliente.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(cliente.nombre);
    }
    if (cliente.apellido !== undefined) {
      campos.push('apellido = ?');
      valores.push(cliente.apellido);
    }
    if (cliente.genero !== undefined) {
      campos.push('genero = ?');
      valores.push(cliente.genero);
    }
    if (cliente.telefono !== undefined) {
      campos.push('telefono = ?');
      valores.push(cliente.telefono);
    }
    if (cliente.email !== undefined) {
      campos.push('email = ?');
      valores.push(cliente.email);
    }
    if (cliente.direccion !== undefined) {
      campos.push('direccion = ?');
      valores.push(cliente.direccion);
    }
    if (cliente.ciudad !== undefined) {
      campos.push('ciudad = ?');
      valores.push(cliente.ciudad);
    }
    if (cliente.documento !== undefined) {
      campos.push('documento = ?');
      valores.push(cliente.documento);
    }
    if (cliente.tipo_documento !== undefined) {
      campos.push('tipo_documento = ?');
      valores.push(cliente.tipo_documento);
    }
    if (cliente.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(cliente.activo ? 1 : 0);
    }
    if (cliente.saldo_pendiente !== undefined) {
      campos.push('saldo_pendiente = ?');
      valores.push(cliente.saldo_pendiente);
    }
    
    if (campos.length === 0) {
      return; // No hay campos para actualizar
    }
    
    valores.push(id); // Agregar el ID al final para la cláusula WHERE
    
    await window.electronAPI.db.run(`
      UPDATE clientes 
      SET ${campos.join(', ')}
      WHERE id = ?
    `, valores);
  }

  // Eliminar un cliente
  static async eliminar(id: number): Promise<void> {
    await window.electronAPI.db.run('UPDATE clientes SET activo = 0 WHERE id = ?', [id]);
  }

  // Verificar si un código ya existe
  static async existeCodigo(codigo: string, idExcluir?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) as count FROM clientes WHERE codigo = ?';
    let params: any[] = [codigo];
    
    if (idExcluir) {
      query += ' AND id != ?';
      params.push(idExcluir);
    }
    
    const result = await window.electronAPI.db.get(query, params);
    return result.count > 0;
  }

  // Generar el próximo código de cliente
  static async generarCodigo(): Promise<string> {
    const result = await window.electronAPI.db.get(`
      SELECT codigo FROM clientes 
      WHERE codigo LIKE 'C%' 
      ORDER BY CAST(SUBSTR(codigo, 2) AS INTEGER) DESC 
      LIMIT 1
    `);
    
    if (!result) {
      return 'C001';
    }
    
    const numeroActual = parseInt(result.codigo.substring(1));
    const siguienteNumero = numeroActual + 1;
    return `C${siguienteNumero.toString().padStart(3, '0')}`;
  }

  // Obtener estadísticas de clientes
  static async obtenerEstadisticas(): Promise<{
    totalClientes: number;
    clientesActivos: number;
    conSaldoPendiente: number;
    totalPorCobrar: number;
  }> {
    const result = await window.electronAPI.db.get(`
      SELECT 
        COUNT(*) as totalClientes,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as clientesActivos,
        SUM(CASE WHEN saldo_pendiente > 0 THEN 1 ELSE 0 END) as conSaldoPendiente,
        SUM(COALESCE(saldo_pendiente, 0)) as totalPorCobrar
      FROM clientes
    `);
    
    return {
      totalClientes: result.totalClientes || 0,
      clientesActivos: result.clientesActivos || 0,
      conSaldoPendiente: result.conSaldoPendiente || 0,
      totalPorCobrar: result.totalPorCobrar || 0
    };
  }
}
