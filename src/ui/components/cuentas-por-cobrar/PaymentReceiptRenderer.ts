import { ConfiguracionService } from "../../services/configuracion-service";
import type { CuentaPorCobrar, PagoCuenta } from "../../services/cuentas-por-cobrar-service";
import logoClaudio from "../../assets/logo_claudio.png";

function fmt(n?: number) {
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

export interface PrintPagoOptions {
  mostrarHistorial?: boolean;
  historial?: PagoCuenta[];
}

export async function buildPagoReceiptHTML(
  cuenta: CuentaPorCobrar,
  pago?: Partial<PagoCuenta> & { fecha_pago?: string; id?: number },
  opts: PrintPagoOptions = {}
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
      <div class="bold">RECIBO DE PAGO</div>
      <div>Cuenta #${cuenta.id} · ${cuenta.numero_venta || (cuenta.venta_id ? 'VENTA-' + cuenta.venta_id : '')}</div>
      <div>${fecha.toLocaleString()}</div>
      <div class="hr"></div>
      <div class="bold">${(cuenta.cliente_nombre || '') + ' ' + (cuenta.cliente_apellido || '')}</div>
      <div class="small">Código: ${cuenta.cliente_codigo || ''}</div>
      <div class="hr"></div>
    </div>
  `;

  const cuerpo = `
    <div class="wrap">
      <table>
        <tbody>
          <tr><td>Saldo anterior</td><td class="right">Bs ${fmt(previo)}</td></tr>
          <tr><td class="bold">Pago recibido</td><td class="right bold">Bs ${fmt(pago?.monto)}</td></tr>
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
    const filas = opts.historial
      .map(h => `<tr><td class="small">${new Date(h.fecha_pago).toLocaleString()}</td><td class="right">Bs ${fmt(h.monto)}</td><td class="right small">${h.metodo_pago}</td></tr>`) 
      .join('');
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
    historial = `
      <div class="wrap">
        <div class="bold">Historial de pagos</div>
        <table><tbody>${filas}</tbody></table>
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
      td { vertical-align: top; padding: 2px 0; }
    </style>
  `;

  return `<!doctype html><html><head><meta charset="utf-8" />${css}</head><body>${header}${cuerpo}${historial}<div class="wrap center small">Gracias por su pago</div></body></html>`;
}

export async function printPagoReceipt(
  cuenta: CuentaPorCobrar,
  pago?: Partial<PagoCuenta> & { fecha_pago?: string },
  opts: PrintPagoOptions = {}
) {
  const ticket = await ConfiguracionService.obtenerConfiguracionTickets();
  const widthMm = Number(ticket.ticket_ancho || '80');
  const deviceName = ticket.ticket_impresora || undefined;
  const auto = (ticket.ticket_auto_imprimir || 'true') === 'true';
  const htmlRaw = await buildPagoReceiptHTML(cuenta, pago, opts);
  // Ajustar ancho con CSS inline @page segun widthMm
  const html = htmlRaw.replace('@page { size: 80mm auto;', `@page { size: ${widthMm}mm auto;`).replace('body { width: 80mm;', `body { width: ${widthMm}mm;`);
  return window.electronAPI.printHtml({ html, widthMm, deviceName, silent: auto, title: `Recibo Pago Cta ${cuenta.id}` });
}
