export interface RangoFechas {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

export class ReportesService {
  static async ventasPorDia(rango: RangoFechas) {
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
}
