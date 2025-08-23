import { ExportService, type ColumnDef } from '../../services/export-service';
import type { CuentaPorCobrar } from '../../services/cuentas-por-cobrar-service';

export function exportCuentasPorCobrarExcel(rows: CuentaPorCobrar[], opts?: { fileBase?: string }) {
  const cols: ColumnDef<CuentaPorCobrar & { cliente_completo?: string }>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nro Venta', accessor: (r) => r.numero_venta || '' },
    { header: 'Código Cliente', accessor: (r) => r.cliente_codigo || '' },
    { header: 'Cliente', accessor: (r) => `${r.cliente_nombre ?? ''} ${r.cliente_apellido ?? ''}`.trim() },
    { header: 'Teléfono', accessor: (r) => r.cliente_telefono || '' },
    { header: 'Estado', accessor: 'estado' },
    { header: 'Monto', accessor: 'monto' },
    { header: 'Saldo', accessor: 'saldo' },
    { header: 'F. Creación', accessor: (r) => r.fecha_creacion?.replace('T', ' ').replace('Z','') },
    { header: 'F. Vencimiento', accessor: (r) => r.fecha_vencimiento || '' },
    { header: 'Días vencido', accessor: (r) => r.dias_vencido ?? 0 },
    { header: 'Observaciones', accessor: (r) => r.observaciones || '' },
  ];

  const fileBase = opts?.fileBase || 'cuentas_por_cobrar';
  ExportService.exportExcel(rows, cols, fileBase);
}
