import type { Venta, VentaDetalle } from "../../services/ventas-service";
import { ConfiguracionService } from "../../services/configuracion-service";
import logoClaudio from "../../assets/logo_claudio.png";

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

// Función helper para convertir imagen a base64
async function imageToBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(src); // Fallback a la URL original
    img.src = src;
  });
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

  // Convertir logo de Claudio a base64 para impresión
  const logoClaudiaBase64 = await imageToBase64(logoClaudio);

  // CSS simplificado para ancho fijo (mm) y fuente monoespaciada
  const css = `
    <style>
      @page { size: ${ancho}mm auto; margin: 0; }
      body { width: ${ancho}mm; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 16px; }
      .wrap { padding: 8px 10px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: 700; }
      .mt { margin-top: 8px; }
      .hr { border-top: 1px dashed #000; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { vertical-align: top; padding: 2px 0; }
      .small { font-size: 14px; }
    </style>
  `;

  // Encabezado de empresa
  let logoTag = '';
  // Calcular el tamaño del logo basado en el ancho del ticket desde la base de datos
  const logoSize = Math.min(110, Math.round(ancho * 1.2)); // Logo proporcional al ancho configurado en BD
  
  if (mostrarLogo) {
    if (logoPath) {
      let logoSrc = logoPath;
      try {
        if (logoPath.startsWith('file://')) {
          const data = await window.electronAPI.imageToDataUrl(logoPath);
          if (data) logoSrc = data;
        }
      } catch {}
      // Si hay logo personalizado, usar el tamaño configurado o el calculado
      const customWidth = logoWidth > 0 ? logoWidth : logoSize;
      logoTag = `<div class=\"center\"><img src=\"${logoSrc}\" style=\"width:${customWidth}px;max-height:${Math.round(customWidth * 0.8)}px;object-fit:contain;margin-bottom:15px\" /></div>`;
    } else {
      // Usar el logo de Claudio convertido a base64 si no hay logo configurado
      if (logoClaudiaBase64) {
        logoTag = `<div class=\"center\"><img src=\"${logoClaudiaBase64}\" style=\"width:${logoSize}px;max-height:${Math.round(logoSize * 0.8)}px;object-fit:contain;margin-bottom:15px\" /></div>`;
      }
    }
  } else {
    // Siempre mostrar el logo de Claudio aunque la configuración esté deshabilitada
    if (logoClaudiaBase64) {
      logoTag = `<div class=\"center\"><img src=\"${logoClaudiaBase64}\" style=\"width:${logoSize}px;max-height:${Math.round(logoSize * 0.8)}px;object-fit:contain;margin-bottom:15px\" /></div>`;
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
