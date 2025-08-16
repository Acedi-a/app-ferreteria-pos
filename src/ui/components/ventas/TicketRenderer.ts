import type { Venta, VentaDetalle } from "../../services/ventas-service";
import { ConfiguracionService } from "../../services/configuracion-service";

export interface TicketOptions {
  widthMm?: number; // default from config ticket_ancho
  deviceName?: string; // default from config ticket_impresora
  showTaxes?: boolean; // default from config mostrar_impuestos_ticket
}

function padRight(str: string, len: number) {
  return (str || '').substring(0, len).padEnd(len, ' ');
}

function fmtMoney(n: number) {
  return (n ?? 0).toFixed(2);
}

export async function buildTicketHTML(venta: Venta, detalles: VentaDetalle[]): Promise<string> {
  const empresa = await ConfiguracionService.obtenerConfiguracionEmpresa();
  const ticket = await ConfiguracionService.obtenerConfiguracionTickets();
  const impuestosCfg = await ConfiguracionService.obtenerConfiguracionImpuestos();

  const ancho = Number(ticket.ticket_ancho || '80');
  const mostrarLogo = (ticket.ticket_mostrar_logo || 'false') === 'true';
  const logoPath = ticket.ticket_logo_path || '';
  const logoWidth = Number(ticket.ticket_logo_width || '60');
  const encabezado = ticket.ticket_encabezado || '';
  const pie = ticket.ticket_pie_pagina || '';
  const mostrarImpuestos = (impuestosCfg.mostrar_impuestos_ticket || 'false') === 'true';
  const tipoComprobante = (ticket.ticket_tipo_comprobante || 'recibo').toLowerCase();

  // CSS simplificado para ancho fijo (mm) y fuente monoespaciada
  const css = `
    <style>
      @page { size: ${ancho}mm auto; margin: 0; }
      body { width: ${ancho}mm; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
      .wrap { padding: 6px 8px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: 700; }
      .mt { margin-top: 6px; }
      .hr { border-top: 1px dashed #000; margin: 6px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { vertical-align: top; }
      .small { font-size: 11px; }
    </style>
  `;

  // Encabezado de empresa
  let logoTag = '';
  if (mostrarLogo) {
    if (logoPath) {
      let logoSrc = logoPath;
      try {
        if (logoPath.startsWith('file://')) {
          const data = await window.electronAPI.imageToDataUrl(logoPath);
          if (data) logoSrc = data;
        }
      } catch {}
      logoTag = `<div class=\"center\"><img src=\"${logoSrc}\" style=\"width:${logoWidth}px;max-height:80px;object-fit:contain\" /></div>`;
    } else {
      logoTag = '<div class=\"center\"><div style=\"width:60px;height:60px;border:1px solid #000;margin:0 auto 4px\"></div></div>';
    }
  }

  const header = `
    <div class="wrap">
      ${logoTag}
      <div class="center bold">${empresa.nombre_empresa || ''}</div>
      <div class="center small">${empresa.descripcion_empresa || ''}</div>
      <div class="center small">${empresa.direccion_empresa || ''}${empresa.ciudad_empresa ? ' - ' + empresa.ciudad_empresa : ''}</div>
      <div class="center small">${empresa.telefono_empresa || ''}${empresa.email_empresa ? ' - ' + empresa.email_empresa : ''}</div>
      <div class="center small bold mt">${tipoComprobante === 'factura' ? 'FACTURA' : 'RECIBO'}</div>
      ${encabezado ? `<div class="center mt">${encabezado}</div>` : ''}
      <div class="hr"></div>
      <div>Venta: <span class="bold">${venta.numero_venta}</span></div>
      <div>Fecha: ${new Date(venta.fecha_venta).toLocaleString()}</div>
      <div>Cliente: ${venta.cliente_nombre || 'Cliente general'}</div>
      <div class="hr"></div>
    </div>
  `;

  // Detalle de productos
  const lines = detalles.map(d => {
    const totalLinea = d.subtotal;
    return `
      <tr>
        <td>${padRight(d.producto_nombre, 18)}</td>
        <td class="right">${d.cantidad}</td>
        <td class="right">${fmtMoney(d.precio_unitario)}</td>
        <td class="right">${fmtMoney(totalLinea)}</td>
      </tr>
    `;
  }).join('');

  const tabla = `
    <div class="wrap">
      <table>
        <tbody>
          ${lines}
        </tbody>
      </table>
      <div class="hr"></div>
    </div>
  `;

  // Totales
  const totales = `
    <div class="wrap">
      <table>
        <tbody>
          <tr><td class="right bold">SUBTOTAL</td><td class="right">${fmtMoney(venta.subtotal)}</td></tr>
          ${venta.descuento > 0 ? `<tr><td class="right bold">DESCUENTO</td><td class="right">-${fmtMoney(venta.descuento)}</td></tr>` : ''}
          ${mostrarImpuestos ? `<tr><td class="right bold">IMPUESTOS</td><td class="right">${fmtMoney(venta.impuestos)}</td></tr>` : ''}
          <tr><td class="right bold">TOTAL</td><td class="right bold">${fmtMoney(venta.total)}</td></tr>
        </tbody>
      </table>
      <div class="hr"></div>
    </div>
  `;

  const footer = `
    <div class="wrap center small">
      ${pie}
      <div class="mt">Gracias por su compra</div>
    </div>
  `;

  return `<!doctype html><html><head><meta charset="utf-8" />${css}</head><body>${header}${tabla}${totales}${footer}</body></html>`;
}

export async function printTicket(venta: Venta, detalles: VentaDetalle[]) {
  const html = await buildTicketHTML(venta, detalles);
  const ticket = await ConfiguracionService.obtenerConfiguracionTickets();
  const widthMm = Number(ticket.ticket_ancho || '80');
  const deviceName = ticket.ticket_impresora || undefined;
  const auto = (ticket.ticket_auto_imprimir || 'true') === 'true';
  const res = await window.electronAPI.printHtml({ html, widthMm, deviceName, silent: auto, title: `Ticket ${venta.numero_venta}` });
  return res;
}
