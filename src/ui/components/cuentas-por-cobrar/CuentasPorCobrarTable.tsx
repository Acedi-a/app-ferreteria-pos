// src/components/cuentas-por-cobrar/CuentasPorCobrarTable.tsx
import { DollarSign, Eye, Printer, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import type { CuentaPorCobrar } from "../../services/cuentas-por-cobrar-service";

interface CuentasPorCobrarTableProps {
  cuentas: CuentaPorCobrar[];
  loading?: boolean;
  onVerDetalles: (cuenta: CuentaPorCobrar) => void;
  onRegistrarPago: (cuenta: CuentaPorCobrar) => void;
  onImprimir?: (cuenta: CuentaPorCobrar) => void;
}

export default function CuentasPorCobrarTable({
  cuentas,
  loading = false,
  onVerDetalles,
  onRegistrarPago,
  onImprimir
}: CuentasPorCobrarTableProps) {
  
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vencida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cuentas por Cobrar</CardTitle>
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

  if (cuentas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cuentas por Cobrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay cuentas por cobrar
            </h3>
            <p className="text-gray-600">
              No se encontraron cuentas que coincidan con los filtros aplicados.
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
          <span>Cuentas por Cobrar</span>
          <span className="text-sm font-normal text-gray-600">
            {cuentas.length} cuenta{cuentas.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead className="text-right">Saldo Pendiente</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-center">Días Vencido</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentas.map((cuenta) => (
                <TableRow 
                  key={cuenta.id} 
                  className={`hover:bg-gray-50 ${
                    cuenta.estado === 'vencida' ? 'bg-red-50 border-l-4 border-red-400' : ''
                  }`}
                >
                  {/* Cliente */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {cuenta.cliente_nombre} {cuenta.cliente_apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {cuenta.cliente_codigo}
                      </div>
                      {cuenta.cliente_telefono && (
                        <div className="text-xs text-gray-400">
                          {cuenta.cliente_telefono}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Venta */}
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      {cuenta.numero_venta || `VENTA-${cuenta.venta_id || cuenta.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {cuenta.id}
                    </div>
                  </TableCell>

                  {/* Monto Total */}
                  <TableCell className="text-right">
                    <div className="font-medium text-gray-900">
                      Bs {cuenta.monto.toFixed(2)}
                    </div>
                  </TableCell>

                  {/* Saldo Pendiente */}
                  <TableCell className="text-right">
                    <div className={`font-bold ${
                      cuenta.saldo > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Bs {cuenta.saldo.toFixed(2)}
                    </div>
                  </TableCell>

                  {/* Vencimiento */}
                  <TableCell>
                    {cuenta.fecha_vencimiento ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatearFecha(cuenta.fecha_vencimiento)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Creada: {formatearFecha(cuenta.fecha_creacion)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin fecha</span>
                    )}
                  </TableCell>

                  {/* Días Vencido */}
                  <TableCell className="text-center">
                    {cuenta.dias_vencido && cuenta.dias_vencido > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">
                          {cuenta.dias_vencido}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="text-center">
                    <Badge className={getBadgeEstado(cuenta.estado)}>
                      {cuenta.estado.charAt(0).toUpperCase() + cuenta.estado.slice(1)}
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {/* Ver detalles */}
                      <Button
                        variant="outline"
                        onClick={() => onVerDetalles(cuenta)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Registrar pago - solo si tiene saldo pendiente */}
                      {cuenta.saldo > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => onRegistrarPago(cuenta)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50"
                          title="Registrar pago"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Imprimir */}
                      {onImprimir && (
                        <Button
                          variant="outline"
                          onClick={() => onImprimir(cuenta)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Observaciones si hay */}
        {cuentas.some(c => c.observaciones) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Observaciones relevantes:
            </h4>
            <div className="space-y-1">
              {cuentas
                .filter(c => c.observaciones)
                .map(cuenta => (
                  <div key={cuenta.id} className="text-xs text-gray-600">
                    <span className="font-medium">
                      {cuenta.cliente_nombre}:
                    </span> {cuenta.observaciones}
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
