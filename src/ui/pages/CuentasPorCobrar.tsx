import { useState } from "react";
import { Search, CreditCard, AlertTriangle, Clock, CheckCircle, DollarSign, Download, X } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

interface Cliente {
  nombre: string;
  codigo: string;
}

interface CuentaPorCobrar {
  id: number;
  cliente: Cliente;
  venta_id: string;
  monto: number;
  saldo: number;
  fecha_vencimiento: string;
  estado: "pendiente" | "vencida" | "pagada";
  dias_vencido: number;
  fecha_creacion: string;
  observaciones: string;
}

interface Pago {
  id: number;
  cuenta_id: number;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  observaciones: string;
}

/* --- Datos --- */
const initialCuentasPorCobrar: CuentaPorCobrar[] = [
  {
    id: 1,
    cliente: { nombre: "Juan Carlos Pérez", codigo: "C001" },
    venta_id: "V003",
    monto: 224.75,
    saldo: 224.75,
    fecha_vencimiento: "2024-02-20",
    estado: "pendiente",
    dias_vencido: 0,
    fecha_creacion: "2024-01-20",
    observaciones: "Venta a crédito 30 días",
  },
  {
    id: 2,
    cliente: { nombre: "Carlos Alberto López", codigo: "C003" },
    venta_id: "V005",
    monto: 320.0,
    saldo: 120.0,
    fecha_vencimiento: "2024-02-15",
    estado: "pendiente",
    dias_vencido: 0,
    fecha_creacion: "2024-01-15",
    observaciones: "Pago parcial realizado",
  },
  {
    id: 3,
    cliente: { nombre: "María Elena García", codigo: "C002" },
    venta_id: "V007",
    monto: 150.5,
    saldo: 150.5,
    fecha_vencimiento: "2024-01-25",
    estado: "vencida",
    dias_vencido: 5,
    fecha_creacion: "2024-01-10",
    observaciones: "Cliente con historial de pagos puntuales",
  },
  {
    id: 4,
    cliente: { nombre: "Ana Patricia Martínez", codigo: "C004" },
    venta_id: "V009",
    monto: 89.25,
    saldo: 0.0,
    fecha_vencimiento: "2024-01-30",
    estado: "pagada",
    dias_vencido: 0,
    fecha_creacion: "2024-01-05",
    observaciones: "Pagada en su totalidad",
  },
];

const initialPagos: Pago[] = [
  {
    id: 1,
    cuenta_id: 2,
    monto: 200.0,
    metodo_pago: "efectivo",
    fecha_pago: "2024-01-18T10:30:00",
    observaciones: "Pago parcial en efectivo",
  },
  {
    id: 2,
    cuenta_id: 4,
    monto: 89.25,
    metodo_pago: "tarjeta",
    fecha_pago: "2024-01-28T14:15:00",
    observaciones: "Pago total con tarjeta",
  },
];

export default function CuentasPorCobrar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CuentaPorCobrar | null>(null);
  const [cuentasPorCobrar] = useState<CuentaPorCobrar[]>(initialCuentasPorCobrar);
  const [pagos] = useState<Pago[]>(initialPagos);

  const filteredAccounts = cuentasPorCobrar.filter((account) => {
    const matchesSearch =
      account.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.cliente.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.venta_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "" || account.estado === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePayment = (account: CuentaPorCobrar) => {
    setSelectedAccount(account);
    setShowPaymentModal(true);
  };

  const totalPendiente = cuentasPorCobrar.filter((c) => c.estado !== "pagada").reduce((sum, c) => sum + c.saldo, 0);
  const totalVencido = cuentasPorCobrar.filter((c) => c.estado === "vencida").reduce((sum, c) => sum + c.saldo, 0);

  const PaymentModal = () => (
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Registrar Pago - {selectedAccount?.cliente.nombre}
              </DialogTitle>
              <DialogDescription>
                Registra un nuevo pago para esta cuenta por cobrar
              </DialogDescription>
            </div>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        {selectedAccount && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span> {selectedAccount.cliente.nombre}
                </div>
                <div>
                  <span className="font-medium">Venta:</span> {selectedAccount.venta_id}
                </div>
                <div>
                  <span className="font-medium">Monto Total:</span> ${selectedAccount.monto.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Saldo Pendiente:</span> ${selectedAccount.saldo.toFixed(2)}
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Monto a Pagar *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedAccount.saldo}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Método de Pago *
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Seleccionar...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detalles del pago..."
                />
              </div>
            </form>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowPaymentModal(false)}
          >
            Cancelar
          </Button>
          <Button>
            Registrar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas por Cobrar</h1>
          <p className="text-sm text-slate-500">Gestiona los créditos y pagos de tus clientes</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalPendiente.toFixed(2)}</div>
            <p className="text-xs text-slate-600">Saldo pendiente total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalVencido.toFixed(2)}</div>
            <p className="text-xs text-slate-600">Cuentas vencidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {cuentasPorCobrar.filter((c) => c.estado === "pendiente").length}
            </div>
            <p className="text-xs text-slate-600">Cuentas pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cuentasPorCobrar.filter((c) => c.estado === "pagada").length}
            </div>
            <p className="text-xs text-slate-600">Cuentas pagadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cliente, código o venta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencida">Vencida</option>
                <option value="pagada">Pagada</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("");
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas por Cobrar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Días Vencido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.cliente.nombre}</div>
                      <div className="text-sm text-slate-500">{account.cliente.codigo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{account.venta_id}</TableCell>
                  <TableCell className="font-medium">
                    ${account.monto.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        account.saldo > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      ${account.saldo.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(account.fecha_vencimiento).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {account.dias_vencido > 0 ? (
                      <span className="font-medium text-red-600">{account.dias_vencido} días</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        account.estado === "pagada"
                          ? "success"
                          : account.estado === "vencida"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {account.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.saldo > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => handlePayment(account)}
                        className="h-8 px-3 text-xs"
                      >
                        <DollarSign className="mr-1 h-3 w-3" />
                        Pagar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((pago) => {
                const cuenta = cuentasPorCobrar.find((c) => c.id === pago.cuenta_id);
                return (
                  <TableRow key={pago.id}>
                    <TableCell className="font-medium">
                      {cuenta?.cliente.nombre}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${pago.monto.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="capitalize">
                        {pago.metodo_pago}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(pago.fecha_pago).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-500">{pago.observaciones}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showPaymentModal && <PaymentModal />}
    </div>
  );
}
