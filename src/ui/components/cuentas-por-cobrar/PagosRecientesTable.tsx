// src/components/cuentas-por-cobrar/PagosRecientesTable.tsx
import { DollarSign, Calendar, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import type { PagoCuenta } from "../../services/cuentas-por-cobrar-service";

interface PagosRecientesTableProps {
  pagos: PagoCuenta[];
  loading?: boolean;
}

export default function PagosRecientesTable({ 
  pagos, 
  loading = false 
}: PagosRecientesTableProps) {
  
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
      case 'cheque':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'deposito':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Pagos Recientes
          </CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Pagos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay pagos recientes
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
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
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
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((pago) => (
                <TableRow key={pago.id} className="hover:bg-gray-50">
                  {/* Cliente */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {pago.cliente_nombre} {pago.cliente_apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID Pago: {pago.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Monto */}
                  <TableCell className="text-right">
                    <div className="font-bold text-green-600 text-lg">
                      Bs {pago.monto.toFixed(2)}
                    </div>
                  </TableCell>

                  {/* Método */}
                  <TableCell>
                    <Badge className={getBadgeMetodoPago(pago.metodo_pago)}>
                      {pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1)}
                    </Badge>
                  </TableCell>

                  {/* Fecha */}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumen al final */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-800">
              Total de pagos mostrados:
            </span>
            <span className="text-lg font-bold text-green-600">
              Bs {pagos.reduce((sum, pago) => sum + pago.monto, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
