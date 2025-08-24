// src/ui/components/cuentas-por-pagar/PagosProveedoresTable.tsx
import { CreditCard, Calendar, FileText} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import type { PagoProveedor } from "../../services/cuentas-por-pagar-service";

interface PagosProveedoresTableProps {
  pagos: PagoProveedor[];
  loading?: boolean;
}

export default function PagosProveedoresTable({ pagos, loading = false }: PagosProveedoresTableProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeMetodoPago = (metodo: string) => {
    switch (metodo.toLowerCase()) {
      case 'efectivo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tarjeta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transferencia':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos a Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pagos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos a Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay pagos registrados
            </h3>
            <p className="text-gray-600">
              Los pagos registrados aparecerán aquí.
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
          <span>Pagos a Proveedores</span>
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
                <TableHead>Cuenta</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {pago.proveedor_nombre}
                      </div>
                      {pago.proveedor_telefono && (
                        <div className="text-xs text-gray-400">
                          {pago.proveedor_telefono}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-blue-600">
                      {pago.numero_compra || `COMPRA-${pago.cuenta_id}`}
                    </div>
                    <div className="text-xs text-gray-500">Cuenta ID: {pago.cuenta_id}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium text-gray-900">Bs {pago.monto.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBadgeMetodoPago(pago.metodo_pago)}>
                      {pago.metodo_pago}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatearFecha(pago.fecha_pago).split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatearFecha(pago.fecha_pago).split(' ')[1]}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span>{pago.observaciones || '—'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}