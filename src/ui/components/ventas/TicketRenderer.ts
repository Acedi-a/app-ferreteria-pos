import type { Venta, VentaDetalle } from "../../services/ventas-service";
import { ConfiguracionService } from "../../services/configuracion-service";
import logoClaudio from "../../assets/logo_claudio.png";

export interface TicketOptions {
  widthMm?: number; // default from config ticket_ancho
  deviceName?: string; // default from config ticket_impresora
  showTaxes?: boolean; // default from config mostrar_impuestos_ticket
}



function fmtMoney(n: number) {
  return (n ?? 0).toFixed(2);
}

// Función helper para convertir imagen a base64 en blanco y negro puro (umbralización)
async function imageToBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Dibujar la imagen original
      ctx?.drawImage(img, 0, 0);
      
      // Convertir a blanco y negro puro con umbralización
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Calcular el valor de gris usando la fórmula estándar
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          
          // Aplicar umbralización más agresiva: si es mayor a 180, blanco (255), sino negro (0)
          // Esto hace que más regiones claras se conviertan a negro para mejor impresión térmica
          const bw = gray > 180 ? 255 : 0;
          
          data[i] = bw;     // R
          data[i + 1] = bw; // G
          data[i + 2] = bw; // B
          // data[i + 3] permanece igual (alpha)
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
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
  const pie = ticket.ticket_pie_pagina || '';
  const mostrarImpuestos = (impuestosCfg.mostrar_impuestos_ticket || 'false') === 'true';
  const tipoComprobante = (ticket.ticket_tipo_comprobante || 'recibo').toLowerCase();

  // Convertir logo de Claudio a base64 para impresión
  const logoClaudiaBase64 = await imageToBase64(logoClaudio);

  // CSS optimizado para recibo compacto y ahorro de papel
  const css = `
    <style>
      @page { size: ${ancho}mm auto; margin: 0; }
      body { width: ${ancho}mm; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 14px; line-height: 1.2; }
      .wrap { padding: 4px 6px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: 700; }
      .mt { margin-top: 4px; }
      .hr { border-top: 1px dashed #000; margin: 6px 0; }
      .hr-thin { border-top: 1px solid #000; margin: 2px 0; }
      table { width: 100%; border-collapse: collapse; margin: 4px 0; }
      td { vertical-align: top; padding: 1px 2px; }
      .small { font-size: 12px; }
      .section-spacing { margin: 8px 0; }
      .product-line { margin: 1px 0; }
      .products-header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; }
      .product-item { margin: 4px 0; }
      .product-code { font-size: 10px; margin-bottom: 1px; }
      .product-name { font-weight: bold; margin-bottom: 2px; font-size: 13px; }
      .product-details { display: flex; justify-content: space-between; align-items: center; }
      .quantity { font-weight: bold; }
      .unit-price { text-align: center; flex: 1; }
      .line-total { font-weight: bold; text-align: right; }
      .product-separator { display: none; }
    </style>
  `;

  // Encabezado de empresa con logo optimizado
  let logoTag = '';
  // Calcular el tamaño del logo más pequeño para ahorrar espacio
  const logoSize = Math.min(70, Math.round(ancho * 0.8)); // Logo más pequeño y proporcional
  
  if (mostrarLogo) {
    if (logoPath) {
      let logoSrc = logoPath;
      try {
        if (logoPath.startsWith('file://')) {
          const data = await window.electronAPI.imageToDataUrl(logoPath);
          if (data) logoSrc = data;
        }
      } catch {}
      // Si hay logo personalizado, usar el tamaño configurado o el calculado (más pequeño)
      const customWidth = logoWidth > 0 ? Math.min(logoWidth, logoSize) : logoSize;
      logoTag = `<div class="center"><img src="${logoSrc}" style="width:${customWidth}px;max-height:${Math.round(customWidth * 0.6)}px;object-fit:contain;margin-bottom:4px" /></div>`;
    } else {
      // Usar el logo de Claudio convertido a base64 si no hay logo configurado
      if (logoClaudiaBase64) {
        logoTag = `<div class="center"><img src="${logoClaudiaBase64}" style="width:${logoSize}px;max-height:${Math.round(logoSize * 0.6)}px;object-fit:contain;margin-bottom:4px" /></div>`;
      }
    }
  } else {
    // Siempre mostrar el logo de Claudio aunque la configuración esté deshabilitada (más pequeño)
    if (logoClaudiaBase64) {
      logoTag = `<div class="center"><img src="${logoClaudiaBase64}" style="width:${logoSize}px;max-height:${Math.round(logoSize * 0.6)}px;object-fit:contain;margin-bottom:4px" /></div>`;
    }
  }

  const header = `
    <div class="wrap section-spacing">
      ${logoTag}
      <div class="center bold">${empresa.nombre_empresa || ''}</div>
      <div class="center small">${empresa.direccion_empresa || ''}${empresa.ciudad_empresa ? ' - ' + empresa.ciudad_empresa : ''}</div>
      <div class="center small">${empresa.telefono_empresa || ''}</div>
      <div class="center small bold mt">${tipoComprobante === 'factura' ? 'FACTURA' : 'RECIBO'}</div>
    </div>
    <div class="hr"></div>
    <div class="wrap section-spacing">
      <div>Venta: <span class="bold">${venta.numero_venta}</span></div>
      <div>Fecha: ${new Date(venta.fecha_venta).toLocaleDateString()}</div>
      <div>Cliente: ${venta.cliente_nombre || 'Cliente general'}</div>
    </div>
    <div class="hr"></div>
  `;

  // Detalle de productos optimizado
  const lines = detalles.map(d => {
    const totalLinea = d.subtotal;
    return `
      <div class="product-item">
        <div class="product-name">${d.producto_nombre}</div>
        <div class="product-details">
          <span class="quantity">${d.cantidad} X</span>
          <span class="unit-price">${fmtMoney(d.precio_unitario)}</span>
          <span class="line-total">${fmtMoney(totalLinea)}</span>
        </div>
      </div>
    `;
  }).join('');

  const tabla = `
    <div class="wrap section-spacing">
      <div class="products-header">
        <span class="bold">Descripción / Ctd x Precio Unit</span>
        <span class="bold right">Total</span>
      </div>
      <div class="products-container">
        ${lines}
      </div>
    </div>
    <div class="hr"></div>
  `;

  // Totales optimizados
  const totales = `
    <div class="wrap section-spacing">
      <table>
        <tbody>
          ${venta.descuento > 0 ? `<tr class="product-line"><td class="right bold">SUBTOTAL</td><td class="right">${fmtMoney(venta.subtotal)}</td></tr>` : ''}
          ${venta.descuento > 0 ? `<tr class="product-line"><td class="right bold">DESCUENTO</td><td class="right">-${fmtMoney(venta.descuento)}</td></tr>` : ''}
          ${mostrarImpuestos ? `<tr class="product-line"><td class="right bold">IMPUESTOS</td><td class="right">${fmtMoney(venta.impuestos)}</td></tr>` : ''}
          <tr class="product-line"><td class="right bold">TOTAL</td><td class="right bold">${fmtMoney(venta.total)}</td></tr>
        </tbody>
      </table>
    </div>
    <div class="hr"></div>
  `;

  const footer = `
    <div class="wrap center small section-spacing">
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
