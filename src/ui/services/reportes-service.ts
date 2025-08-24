export interface RangoFechas {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

export class ReportesService {
  private static verificarElectronAPI() {
    if (!window.electronAPI?.db) {
      throw new Error('La aplicación Electron no está disponible. Por favor, ejecute la aplicación desde Electron.');
    }
  }

  static async ventasPorDia(rango: RangoFechas) {
    this.verificarElectronAPI();
    
    const filtroFecha = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    return window.electronAPI.db.query(`
      SELECT 
        DATE(v.fecha_venta) as fecha,
        COUNT(*) as ventas,
        COALESCE(SUM(v.total), 0) as total,
        CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(SUM(v.total) * 1.0 / COUNT(*), 2) END as promedio
      FROM ventas v
      WHERE ${filtroFecha}
      GROUP BY DATE(v.fecha_venta)
      ORDER BY fecha DESC
      LIMIT 31
    `, params);
  }

  static async topProductos(rango: RangoFechas, limite = 10) {
    this.verificarElectronAPI();
    
    const filtroFecha = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);
    params.push(limite);

    return window.electronAPI.db.query(`
      SELECT 
        p.nombre,
        SUM(vd.cantidad) as vendidos,
        SUM(vd.subtotal) as ingresos
      FROM venta_detalles vd
      INNER JOIN ventas v ON v.id = vd.venta_id
      INNER JOIN productos p ON p.id = vd.producto_id
      WHERE ${filtroFecha}
      GROUP BY p.id, p.nombre
      ORDER BY ingresos DESC
      LIMIT ?
    `, params);
  }

  static async mejoresClientes(rango: RangoFechas, limite = 10) {
    this.verificarElectronAPI();
    
    const filtroFecha = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);
    params.push(limite);

    return window.electronAPI.db.query(`
      SELECT 
        (c.nombre || ' ' || COALESCE(c.apellido, '')) as nombre,
        COUNT(v.id) as compras,
        SUM(v.total) as total,
        MAX(DATE(v.fecha_venta)) as ultima
      FROM ventas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE ${filtroFecha}
      GROUP BY c.id, nombre
      ORDER BY total DESC
      LIMIT ?
    `, params);
  }

  static async inventarioPorCategoria() {
    this.verificarElectronAPI();
    
    return window.electronAPI.db.query(`
      SELECT 
        COALESCE(ia.categoria, 'Sin categoría') as categoria,
        COUNT(*) as productos,
        COALESCE(SUM(ia.valor_total), 0) as valor,
        SUM(CASE WHEN ia.stock_minimo IS NOT NULL AND ia.stock_actual <= ia.stock_minimo THEN 1 ELSE 0 END) as stock_bajo
      FROM inventario_actual ia
      GROUP BY ia.categoria
      ORDER BY valor DESC
    `);
  }

  static async resumenFinanciero(rango: RangoFechas) {
    this.verificarElectronAPI();
    
    const filtroVentas = rango.desde && rango.hasta
      ? `DATE(fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(fecha_venta) <= DATE(?)`
      : `1=1`;

    const filtroCompras = filtroVentas.replaceAll('fecha_venta', 'fecha_compra');
    const filtroGastos = filtroVentas.replaceAll('fecha_venta', 'fecha_gasto');

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    const ingresos = await window.electronAPI.db.get(`
      SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE ${filtroVentas}
    `, params);

    const costos = await window.electronAPI.db.get(`
      SELECT COALESCE(SUM(cd.subtotal), 0) as total FROM compra_detalles cd 
      INNER JOIN compras c ON c.id = cd.compra_id
      WHERE ${filtroCompras}
    `, params);

    const gastos = await window.electronAPI.db.get(`
      SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE ${filtroGastos}
    `, params);

    const utilidad_bruta = (ingresos?.total || 0) - (costos?.total || 0);
    const utilidad_neta = utilidad_bruta - (gastos?.total || 0);

    const margen_bruto = ingresos?.total ? Number(((utilidad_bruta / ingresos.total) * 100).toFixed(2)) : 0;
    const margen_neto = ingresos?.total ? Number(((utilidad_neta / ingresos.total) * 100).toFixed(2)) : 0;

    return {
      ingresos: ingresos?.total || 0,
      costos: costos?.total || 0,
      utilidad_bruta,
      gastos: gastos?.total || 0,
      utilidad_neta,
      margen_bruto,
      margen_neto,
    };
  }

  // --- Reportes detallados ---
  static async ventasCabecera(rango: RangoFechas) {
    this.verificarElectronAPI();
    
    const filtro = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    return window.electronAPI.db.query(`
      SELECT
        v.id,
        v.numero_venta,
        DATE(v.fecha_venta) AS fecha,
        COALESCE(c.nombre || ' ' || COALESCE(c.apellido,''), 'Consumidor final') AS cliente,
        v.metodo_pago,
        v.subtotal,
        v.descuento,
        v.impuestos,
        v.total,
        (SELECT COUNT(1) FROM venta_detalles vd WHERE vd.venta_id = v.id) AS items
      FROM ventas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE ${filtro}
      ORDER BY v.fecha_venta DESC, v.id DESC
      LIMIT 500
    `, params);
  }

  static async ventasItems(rango: RangoFechas) {
    const filtro = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    return window.electronAPI.db.query(`
      SELECT 
        DATE(v.fecha_venta) AS fecha,
        v.numero_venta,
        p.nombre AS producto,
        COALESCE(tu.abreviacion, p.unidad_medida) AS unidad,
        vd.cantidad,
        vd.precio_unitario,
        vd.descuento,
        vd.subtotal,
        COALESCE(c.nombre || ' ' || COALESCE(c.apellido,''), 'Consumidor final') AS cliente
      FROM venta_detalles vd
      INNER JOIN ventas v ON v.id = vd.venta_id
      INNER JOIN productos p ON p.id = vd.producto_id
      LEFT JOIN tipos_unidad tu ON tu.id = p.tipo_unidad_id
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE ${filtro}
      ORDER BY v.fecha_venta DESC, v.id DESC, vd.id ASC
      LIMIT 1000
    `, params);
  }

  static async comprasItems(rango: RangoFechas) {
    const filtro = rango.desde && rango.hasta
      ? `DATE(c.fecha_compra) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(c.fecha_compra) >= DATE(?)`
      : rango.hasta
      ? `DATE(c.fecha_compra) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    return window.electronAPI.db.query(`
      SELECT
        DATE(c.fecha_compra) AS fecha,
        c.numero_compra,
        p.nombre AS producto,
        COALESCE(tu.abreviacion, p.unidad_medida) AS unidad,
        cd.cantidad,
        cd.costo_unitario,
        cd.descuento,
        cd.subtotal,
        pr.nombre AS proveedor
      FROM compra_detalles cd
      INNER JOIN compras c ON c.id = cd.compra_id
      INNER JOIN productos p ON p.id = cd.producto_id
      LEFT JOIN tipos_unidad tu ON tu.id = p.tipo_unidad_id
      INNER JOIN proveedores pr ON pr.id = c.proveedor_id
      WHERE ${filtro}
      ORDER BY c.fecha_compra DESC, c.id DESC, cd.id ASC
      LIMIT 1000
    `, params);
  }

  static async cxcDetalle(rango: RangoFechas) {
    const filtro = rango.desde && rango.hasta
      ? `DATE(cc.fecha_creacion) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(cc.fecha_creacion) >= DATE(?)`
      : rango.hasta
      ? `DATE(cc.fecha_creacion) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    return window.electronAPI.db.query(`
      SELECT
        cc.id,
        DATE(cc.fecha_creacion) AS fecha,
        COALESCE(c.nombre || ' ' || COALESCE(c.apellido,''), 'N/D') AS cliente,
        cc.monto,
        cc.saldo,
        cc.estado,
        cc.fecha_vencimiento,
        COALESCE((SELECT COALESCE(SUM(pc.monto),0) FROM pagos_cuentas pc WHERE pc.cuenta_id = cc.id), 0) AS pagado,
        CASE WHEN cc.fecha_vencimiento IS NOT NULL THEN 
          CAST((JULIANDAY('now') - JULIANDAY(cc.fecha_vencimiento)) AS INTEGER)
        ELSE NULL END AS dias_vencido,
        v.numero_venta
      FROM cuentas_por_cobrar cc
      LEFT JOIN clientes c ON c.id = cc.cliente_id
      LEFT JOIN ventas v ON v.id = cc.venta_id
      WHERE ${filtro}
      ORDER BY 
        cc.estado DESC,
        CASE WHEN cc.fecha_vencimiento IS NULL THEN 1 ELSE 0 END,
        cc.fecha_vencimiento ASC,
        cc.id DESC
      LIMIT 1000
    `, params);
  }

  static async ventasPorUsuario(rango: RangoFechas) {
    const filtro = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);

    return window.electronAPI.db.query(`
      SELECT
        COALESCE(v.usuario, 'N/D') AS usuario,
        COUNT(*) AS ventas,
        COALESCE(SUM(v.total), 0) AS total,
        COALESCE(AVG(v.total), 0) AS promedio
      FROM ventas v
      WHERE ${filtro}
      GROUP BY COALESCE(v.usuario, 'N/D')
      ORDER BY total DESC
      LIMIT 50
    `, params);
  }

  static async margenPorProducto(rango: RangoFechas, limite = 50) {
    // Costo promedio ponderado global (o en rango de compras) y margen sobre ventas del rango
    const filtroV = rango.desde && rango.hasta
      ? `DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)`
      : rango.desde
      ? `DATE(v.fecha_venta) >= DATE(?)`
      : rango.hasta
      ? `DATE(v.fecha_venta) <= DATE(?)`
      : `1=1`;

    const params: any[] = [];
    if (rango.desde) params.push(rango.desde);
    if (rango.hasta) params.push(rango.hasta);
    params.push(limite);

    return window.electronAPI.db.query(`
      WITH costo_promedio AS (
        SELECT 
          cd.producto_id,
          CASE WHEN SUM(cd.cantidad) > 0 THEN ROUND(SUM(cd.subtotal) * 1.0 / SUM(cd.cantidad), 4) ELSE 0 END AS costo_avg
        FROM compra_detalles cd
        GROUP BY cd.producto_id
      ),
      ventas_prod AS (
        SELECT vd.producto_id, 
               SUM(vd.cantidad) AS cant_vendida,
               SUM(vd.subtotal) AS ingresos
        FROM venta_detalles vd
        INNER JOIN ventas v ON v.id = vd.venta_id
        WHERE ${filtroV}
        GROUP BY vd.producto_id
      )
      SELECT 
        p.nombre AS producto,
        COALESCE(tu.abreviacion, p.unidad_medida) AS unidad,
        COALESCE(vp.cant_vendida, 0) AS vendidos,
        COALESCE(vp.ingresos, 0) AS ingresos,
        ROUND(COALESCE(cp.costo_avg, 0), 4) AS costo_promedio,
        ROUND(COALESCE(vp.cant_vendida, 0) * COALESCE(cp.costo_avg, 0), 2) AS costo_estimado,
        ROUND(COALESCE(vp.ingresos, 0) - (COALESCE(vp.cant_vendida, 0) * COALESCE(cp.costo_avg, 0)), 2) AS margen,
        CASE WHEN COALESCE(vp.ingresos, 0) > 0 THEN 
          ROUND( (COALESCE(vp.ingresos, 0) - (COALESCE(vp.cant_vendida, 0) * COALESCE(cp.costo_avg, 0))) * 100.0 / COALESCE(vp.ingresos, 1), 2)
        ELSE 0 END AS margen_pct
      FROM productos p
      LEFT JOIN ventas_prod vp ON vp.producto_id = p.id
      LEFT JOIN costo_promedio cp ON cp.producto_id = p.id
      LEFT JOIN tipos_unidad tu ON tu.id = p.tipo_unidad_id
      WHERE COALESCE(vp.cant_vendida, 0) > 0
      ORDER BY margen DESC
      LIMIT ?
    `, params);
  }
}
