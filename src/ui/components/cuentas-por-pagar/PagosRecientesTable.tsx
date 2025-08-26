// src/components/cuentas-por-pagar/PagosRecientesTable.tsx
import { DollarSign, Calendar, Factory, Printer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { PagoProveedor } from "../../services/cuentas-por-pagar-service";
import { printPagoProveedorReceipt } from "./PaymentReceiptRenderer";
import { CuentasPorPagarService } from "../../services/cuentas-por-pagar-service";

interface PagosRecientesTableProps {
  pagos: PagoProveedor[];
  loading?: boolean;
}

function formatearFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const fechaStr = fecha.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaStr = fecha.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `${fechaStr} ${horaStr}`;
}

function getMetodoPagoColor(metodo: string): string {
  switch (metodo.toLowerCase()) {
    case 'efectivo':
      return 'bg-green-100 text-green-800';
    case 'transferencia':
    case 'transferencia bancaria':
      return 'bg-blue-100 text-blue-800';
    case 'cheque':
      return 'bg-purple-100 text-purple-800';
    case 'tarjeta':
    case 'tarjeta de débito':
    case 'tarjeta de crédito':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function PagosRecientesTable({ pagos, loading }: PagosRecientesTableProps) {
  const handleImprimirPago = async (pago: PagoProveedor) => {
    try {
      // Obtener la cuenta completa para el recibo
      const cuentas = await CuentasPorPagarService.obtenerCuentasPorPagar();
      const cuenta = cuentas.find(c => c.id === pago.cuenta_id);
      
      if (!cuenta) {
        console.error('No se encontró la cuenta asociada al pago');
        return;
      }

      // Obtener historial de pagos para cálculo correcto de saldos
      const historial = await CuentasPorPagarService.obtenerHistoricoPagos(pago.cuenta_id);
      
      await printPagoProveedorReceipt(cuenta, pago, { 
        mostrarHistorial: false, 
        historial 
      });
    } catch (error) {
      console.error('Error al imprimir recibo:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <span>Pagos Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pagos || pagos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <span>Pagos Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              No hay pagos registrados aún.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Los pagos a proveedores aparecerán aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <span>Pagos Recientes</span>
          </div>
          <span className="text-sm font-normal text-gray-600">
            {pagos.length} pago{pagos.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((pago) => (
                <TableRow key={pago.id} className="hover:bg-gray-50">
                  {/* Proveedor */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Factory className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {pago.proveedor_nombre}
                        </div>
                        {pago.numero_compra && (
                          <div className="text-xs text-gray-500">
                            {pago.numero_compra}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Monto */}
                  <TableCell className="text-right">
                    <div className="font-semibold text-orange-600">
                      Bs {pago.monto.toFixed(2)}
                    </div>
                  </TableCell>

                  {/* Método de pago */}
                  <TableCell>
                    <Badge className={`text-xs ${getMetodoPagoColor(pago.metodo_pago)}`}>
                      {pago.metodo_pago}
                    </Badge>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatearFecha(pago.fecha_pago).split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatearFecha(pago.fecha_pago).split(' ')[1]}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Observaciones */}
                  <TableCell>
                    {pago.observaciones ? (
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={pago.observaciones}>
                        {pago.observaciones}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleImprimirPago(pago)}
                        className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-2 py-1"
                        title="Imprimir recibo de este pago"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumen al final */}
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-orange-800">
              Total de pagos mostrados:
            </span>
            <span className="text-lg font-bold text-orange-600">
              Bs {pagos.reduce((sum, pago) => sum + pago.monto, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}