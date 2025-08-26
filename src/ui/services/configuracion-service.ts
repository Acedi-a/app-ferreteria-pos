// Servicio para manejar la configuración del sistema
export interface ConfiguracionItem {
  id?: number;
  clave: string;
  valor: string;
  descripcion?: string;
  fecha_modificacion?: string;
}

export class ConfiguracionService {
  // Obtener todas las configuraciones
  static async obtenerTodas(): Promise<ConfiguracionItem[]> {
    return window.electronAPI.db.query('SELECT * FROM configuracion ORDER BY clave');
  }

  // Obtener una configuración específica por clave
  static async obtenerPorClave(clave: string): Promise<string | null> {
    const result = await window.electronAPI.db.get(
      'SELECT valor FROM configuracion WHERE clave = ?', 
      [clave]
    );
    return result?.valor || null;
  }

  // Obtener múltiples configuraciones por claves
  static async obtenerMultiples(claves: string[]): Promise<Record<string, string>> {
    const placeholders = claves.map(() => '?').join(',');
    const results = await window.electronAPI.db.query(
      `SELECT clave, valor FROM configuracion WHERE clave IN (${placeholders})`,
      claves
    );
    
    const config: Record<string, string> = {};
    results.forEach((row: any) => {
      config[row.clave] = row.valor;
    });
    
    return config;
  }

  // Guardar o actualizar una configuración
  static async guardar(clave: string, valor: string, descripcion?: string): Promise<void> {
    // Primero intentar actualizar
    const updateResult = await window.electronAPI.db.run(`
      UPDATE configuracion 
      SET valor = ?, descripcion = COALESCE(?, descripcion), fecha_modificacion = CURRENT_TIMESTAMP
      WHERE clave = ?
    `, [valor, descripcion, clave]);
    
    // Si no se actualizó ningún registro, insertar uno nuevo
    if (updateResult.changes === 0) {
      await window.electronAPI.db.run(`
        INSERT INTO configuracion (clave, valor, descripcion, fecha_modificacion)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [clave, valor, descripcion || null]);
    }
  }

  // Guardar múltiples configuraciones
  static async guardarMultiples(configuraciones: Record<string, string>): Promise<void> {
    for (const [clave, valor] of Object.entries(configuraciones)) {
      await this.guardar(clave, valor);
    }
  }

  // Configuraciones específicas de la empresa
  static async obtenerConfiguracionEmpresa() {
    const claves = [
      'nombre_empresa', 'nit_empresa', 'direccion_empresa', 
      'telefono_empresa', 'email_empresa', 'ciudad_empresa', 'descripcion_empresa'
    ];
    return this.obtenerMultiples(claves);
  }

  static async guardarConfiguracionEmpresa(data: {
    nombre_empresa: string;
    nit_empresa?: string;
    direccion_empresa?: string;
    telefono_empresa?: string;
    email_empresa?: string;
    ciudad_empresa?: string;
    descripcion_empresa?: string;
  }): Promise<void> {
    await this.guardarMultiples(data);
  }

  // Configuraciones de tickets
  static async obtenerConfiguracionTickets() {
    const claves = [
  'ticket_ancho', 'ticket_impresora', 'ticket_encabezado', 
  'ticket_pie_pagina', 'ticket_mostrar_logo', 'ticket_auto_imprimir', 
  'ticket_mostrar_barcode', 'ticket_logo_path', 'ticket_logo_width', 'ticket_tipo_comprobante'
    ];
    return this.obtenerMultiples(claves);
  }

  static async guardarConfiguracionTickets(data: Record<string, string>): Promise<void> {
    await this.guardarMultiples(data);
  }

  // Configuraciones de impuestos
  static async obtenerConfiguracionImpuestos() {
    const claves = [
      'iva_general', 'iva_reducido', 'retencion_fuente', 
      'aplicar_iva_defecto', 'mostrar_impuestos_ticket', 'calcular_impuestos_auto'
    ];
    return this.obtenerMultiples(claves);
  }

  static async guardarConfiguracionImpuestos(data: Record<string, string>): Promise<void> {
    await this.guardarMultiples(data);
  }

  // Configuraciones del sistema
  static async obtenerConfiguracionSistema() {
    const claves = [
      'auto_backup', 'log_activity', 'debug_mode', 'ultimo_backup'
    ];
    return this.obtenerMultiples(claves);
  }

  static async guardarConfiguracionSistema(data: Record<string, string>): Promise<void> {
    await this.guardarMultiples(data);
  }

  // Crear un respaldo (simplificado - solo actualiza la fecha)
  static async crearRespaldo(): Promise<void> {
    await this.guardar('ultimo_backup', new Date().toISOString(), 'Fecha del último respaldo');
  }

  // Inicializar configuraciones por defecto si no existen
  static async inicializarConfiguracionDefecto(): Promise<void> {
    const configuracionDefecto = [
      { clave: 'nombre_empresa', valor: 'Mi Ferretería', descripcion: 'Nombre de la empresa' },
      { clave: 'nit_empresa', valor: '', descripcion: 'NIT de la empresa' },
      { clave: 'direccion_empresa', valor: '', descripcion: 'Dirección de la empresa' },
      { clave: 'telefono_empresa', valor: '', descripcion: 'Teléfono de la empresa' },
      { clave: 'email_empresa', valor: '', descripcion: 'Email de la empresa' },
      { clave: 'ciudad_empresa', valor: '', descripcion: 'Ciudad de la empresa' },
      { clave: 'descripcion_empresa', valor: '', descripcion: 'Descripción del negocio' },
      { clave: 'ticket_ancho', valor: '74', descripcion: 'Ancho del ticket en mm' },
      { clave: 'ticket_impresora', valor: '', descripcion: 'Impresora seleccionada' },
      { clave: 'ticket_encabezado', valor: '¡Gracias por su compra!', descripcion: 'Mensaje del encabezado' },
      { clave: 'ticket_pie_pagina', valor: 'Vuelva pronto', descripcion: 'Mensaje del pie de página' },
      { clave: 'ticket_mostrar_logo', valor: 'true', descripcion: 'Mostrar logo en ticket' },
      { clave: 'ticket_auto_imprimir', valor: 'true', descripcion: 'Imprimir automáticamente' },
      { clave: 'ticket_mostrar_barcode', valor: 'false', descripcion: 'Mostrar código de barras' },
  { clave: 'ticket_logo_path', valor: '', descripcion: 'Ruta/URL del logo para el ticket' },
  { clave: 'ticket_logo_width', valor: '60', descripcion: 'Ancho del logo en px para el ticket' },
  { clave: 'ticket_tipo_comprobante', valor: 'recibo', descripcion: 'Tipo de comprobante por defecto: recibo o factura' },
      { clave: 'iva_general', valor: '19.00', descripcion: 'IVA general en porcentaje' },
      { clave: 'iva_reducido', valor: '5.00', descripcion: 'IVA reducido en porcentaje' },
      { clave: 'retencion_fuente', valor: '2.50', descripcion: 'Retención en la fuente' },
      { clave: 'aplicar_iva_defecto', valor: 'true', descripcion: 'Aplicar IVA por defecto' },
      { clave: 'mostrar_impuestos_ticket', valor: 'false', descripcion: 'Mostrar impuestos en ticket' },
      { clave: 'calcular_impuestos_auto', valor: 'true', descripcion: 'Calcular impuestos automáticamente' },
      { clave: 'auto_backup', valor: 'true', descripcion: 'Respaldos automáticos' },
      { clave: 'log_activity', valor: 'true', descripcion: 'Registrar actividad' },
      { clave: 'debug_mode', valor: 'false', descripcion: 'Modo de desarrollo' },
      { clave: 'ultimo_backup', valor: '', descripcion: 'Fecha del último respaldo' }
    ];

    for (const config of configuracionDefecto) {
      await window.electronAPI.db.run(`
        INSERT OR IGNORE INTO configuracion (clave, valor, descripcion)
        VALUES (?, ?, ?)
      `, [config.clave, config.valor, config.descripcion]);
    }
  }
}
