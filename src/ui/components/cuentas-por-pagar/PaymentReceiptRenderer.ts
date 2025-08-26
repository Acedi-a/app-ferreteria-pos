// src/components/cuentas-por-pagar/PaymentReceiptRenderer.ts
import { ConfiguracionService } from "../../services/configuracion-service";
import logoClaudio from "../../assets/logo_claudio.png";
import type { CuentaPorPagar, PagoProveedor } from "../../services/cuentas-por-pagar-service";

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

// Función para formatear números
function fmt(num?: number): string {
  if (num == null) return '0.00';
  return Number(num).toFixed(2);
}

export interface PrintPagoProveedorOptions {
  mostrarHistorial?: boolean;
  historial?: PagoProveedor[];
}

export async function buildPagoProveedorReceiptHTML(
  cuenta: CuentaPorPagar,
  pago?: Partial<PagoProveedor> & { fecha_pago?: string; id?: number },
  opts: PrintPagoProveedorOptions = {}
): Promise<string> {
  const ahora = new Date();
  const fecha = pago?.fecha_pago ? new Date(pago.fecha_pago) : ahora;

  // Convertir logo de Claudio a base64 para impresión
  const logoClaudiaBase64 = await imageToBase64(logoClaudio);

  // Calcular saldo anterior y posterior en caso de pago específico usando historial si está disponible
  let previo = (cuenta.saldo ?? 0) + (pago?.monto ?? 0);
  let nuevoSaldo = (cuenta.saldo ?? 0);

  if (pago && opts.historial && opts.historial.length > 0 && (pago.id != null)) {
    const ordenados = [...opts.historial].sort((a, b) => new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime());
    let acumuladoPrev = 0;
    for (const h of ordenados) {
      if (h.id === pago.id) break;
      acumuladoPrev += h.monto;
    }
    // Saldo antes de aplicar este pago
    previo = (cuenta.monto ?? 0) - acumuladoPrev;
    const montoPago = pago.monto ?? 0;
    nuevoSaldo = previo - montoPago;
  }

  const header = `
    <div class="wrap center">
      <div class="center"><img src="${logoClaudiaBase64}" style="width:110px;max-height:88px;object-fit:contain;margin-bottom:15px" /></div>
      <div class="bold">COMPROBANTE DE PAGO</div>
      <div>Cuenta #${cuenta.id} · ${cuenta.numero_compra || (cuenta.compra_id ? 'COMPRA-' + cuenta.compra_id : '')}</div>
      <div>${fecha.toLocaleString()}</div>
      <div class="hr"></div>
      <div class="bold">${cuenta.proveedor_nombre || ''}</div>
      <div class="small">Proveedor</div>
      <div class="hr"></div>
    </div>
  `;

  const cuerpo = `
    <div class="wrap">
      <table>
        <tbody>
          <tr><td>Saldo anterior</td><td class="right">Bs ${fmt(previo)}</td></tr>
          <tr><td class="bold">Pago realizado</td><td class="right bold">Bs ${fmt(pago?.monto)}</td></tr>
          <tr><td>Método</td><td class="right">${pago?.metodo_pago || '-'}</td></tr>
          ${pago?.observaciones ? `<tr><td colspan="2" class="small">Obs.: ${pago.observaciones}</td></tr>` : ''}
          <tr><td class="right bold">Saldo restante</td><td class="right bold">Bs ${fmt(nuevoSaldo)}</td></tr>
        </tbody>
      </table>
      <div class="hr"></div>
    </div>
  `;

  let historial = '';
  if (opts.mostrarHistorial && opts.historial && opts.historial.length > 0) {
    // Ordenar historial por fecha (más reciente primero)
    const historialOrdenado = [...opts.historial].sort((a, b) => 
      new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime()
    );
    
    // Generar filas del historial
    const filas = historialOrdenado
      .map(h => {
        const fecha = new Date(h.fecha_pago).toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        });
        const hora = new Date(h.fecha_pago).toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `<tr>
          <td class="small">${fecha}<br/>${hora}</td>
          <td class="right">Bs ${fmt(h.monto)}</td>
          <td class="right small">${h.metodo_pago}</td>
        </tr>`;
      })
      .join('');
    
    // Resumen de la cuenta
    const resumen = `
      <div class="wrap">
        <table>
          <tbody>
            <tr><td>Monto original</td><td class="right bold">Bs ${fmt(cuenta.monto)}</td></tr>
            <tr><td>Deuda actual</td><td class="right bold">Bs ${fmt(cuenta.saldo)}</td></tr>
          </tbody>
        </table>
        <div class="hr"></div>
      </div>`;
    
    // Tabla del historial
    historial = `
      <div class="wrap">
        <div class="bold">Historial de pagos</div>
        <table>
          <thead>
            <tr>
              <th class="small">Fecha</th>
              <th class="right small">Monto</th>
              <th class="right small">Método</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
        <div class="hr"></div>
      </div>
    `;
    
    historial = resumen + historial;
  }

  const css = `
    <style>
      @page { size: 80mm auto; margin: 0; }
      body { width: 80mm; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 16px; }
      .wrap { padding: 8px 10px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: 700; }
      .small { font-size: 14px; }
      .hr { border-top: 1px dashed #000; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      td, th { vertical-align: top; padding: 2px 0; }
      th { font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
    </style>
  `;

  return `<!doctype html><html><head><meta charset="utf-8" />${css}</head><body>${header}${cuerpo}${historial}<div class="wrap center small">Comprobante de pago a proveedor</div></body></html>`;
}

export async function printPagoProveedorReceipt(
  cuenta: CuentaPorPagar,
  pago?: Partial<PagoProveedor> & { fecha_pago?: string },
  opts: PrintPagoProveedorOptions = {}
) {
  const ticket = await ConfiguracionService.obtenerConfiguracionTickets();
  const widthMm = Number(ticket.ticket_ancho || '80');
  const deviceName = ticket.ticket_impresora || undefined;
  const auto = (ticket.ticket_auto_imprimir || 'true') === 'true';
  const htmlRaw = await buildPagoProveedorReceiptHTML(cuenta, pago, opts);
  // Ajustar ancho con CSS inline @page segun widthMm
  const html = htmlRaw.replace('@page { size: 80mm auto;', `@page { size: ${widthMm}mm auto;`).replace('body { width: 80mm;', `body { width: ${widthMm}mm;`);
  return window.electronAPI.printHtml({ html, widthMm, deviceName, silent: auto, title: `Comprobante Pago Proveedor ${cuenta.id}` });
}