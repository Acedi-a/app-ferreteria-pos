import { useState } from "react";
import { Search, Plus, Eye, Printer, Ban, ShoppingCart, CheckCircle, XCircle, TrendingUp, X } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

interface DetalleVenta {
  producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Venta {
  id: number;
  numero_venta: string;
  cliente: {
    nombre: string;
    codigo: string;
  };
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodo_pago: "efectivo" | "tarjeta" | "credito";
  estado: "completada" | "anulada";
  fecha_venta: string;
  usuario: string;
  detalles: DetalleVenta[];
}

/* --- Datos --- */
const initialSales: Venta[] = [
  {
    id: 1,
    numero_venta: "V001",
    cliente: { nombre: "Juan Carlos Pérez", codigo: "C001" },
    subtotal: 125.5,
    descuento: 5.0,
    impuestos: 0.0,
    total: 120.5,
    metodo_pago: "efectivo",
    estado: "completada",
    fecha_venta: "2024-01-20 14:30:00",
    usuario: "admin",
    detalles: [
      { producto: 'Tornillos 1/4"', cantidad: 50, precio_unitario: 0.25, subtotal: 12.5 },
      { producto: "Pintura Blanca 1L", cantidad: 8, precio_unitario: 12.75, subtotal: 102.0 },
      { producto: "Cable 12 AWG", cantidad: 6, precio_unitario: 1.8, subtotal: 10.8 },
    ],
  },
  {
    id: 2,
    numero_venta: "V002",
    cliente: { nombre: "María Elena García", codigo: "C002" },
    subtotal: 89.25,
    descuento: 0.0,
    impuestos: 0.0,
    total: 89.25,
    metodo_pago: "tarjeta",
    estado: "completada",
    fecha_venta: "2024-01-20 13:15:00",
    usuario: "admin",
    detalles: [
      { producto: 'Tubo PVC 2"', cantidad: 12, precio_unitario: 6.5, subtotal: 78.0 },
      { producto: 'Tornillos 1/4"', cantidad: 45, precio_unitario: 0.25, subtotal: 11.25 },
    ],
  },
  {
    id: 3,
    numero_venta: "V003",
    cliente: { nombre: "Carlos Alberto López", codigo: "C003" },
    subtotal: 234.75,
    descuento: 10.0,
    impuestos: 0.0,
    total: 224.75,
    metodo_pago: "credito",
    estado: "completada",
    fecha_venta: "2024-01-20 12:45:00",
    usuario: "admin",
    detalles: [
      { producto: "Pintura Blanca 1L", cantidad: 15, precio_unitario: 12.75, subtotal: 191.25 },
      { producto: "Cable 12 AWG", cantidad: 24, precio_unitario: 1.8, subtotal: 43.2 },
    ],
  },
  {
    id: 4,
    numero_venta: "V004",
    cliente: { nombre: "Ana Patricia Martínez", codigo: "C004" },
    subtotal: 67.8,
    descuento: 0.0,
    impuestos: 0.0,
    total: 67.8,
    metodo_pago: "efectivo",
    estado: "anulada",
    fecha_venta: "2024-01-20 11:20:00",
    usuario: "admin",
    detalles: [
      { producto: 'Tornillos 1/4"', cantidad: 100, precio_unitario: 0.25, subtotal: 25.0 },
      { producto: 'Tubo PVC 2"', cantidad: 6, precio_unitario: 6.5, subtotal: 39.0 },
      { producto: "Cable 12 AWG", cantidad: 2, precio_unitario: 1.8, subtotal: 3.6 },
    ],
  },
];

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Venta | null>(null);
  const [ventas] = useState<Venta[]>(initialSales);

  const filteredSales = ventas.filter((sale) => {
    const matchesSearch =
      sale.numero_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "" || sale.estado === selectedStatus;
    const matchesPayment = selectedPayment === "" || sale.metodo_pago === selectedPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    ventasHoy: ventas
      .filter((v) => v.estado === "completada")
      .reduce((sum, v) => sum + v.total, 0),
    completadas: ventas.filter((v) => v.estado === "completada").length,
    anuladas: ventas.filter((v) => v.estado === "anulada").length,
    promedioVenta: ventas.filter((v) => v.estado === "completada").length > 0
      ? ventas.filter((v) => v.estado === "completada").reduce((sum, v) => sum + v.total, 0) /
        ventas.filter((v) => v.estado === "completada").length
      : 0,
  };

  const handleViewDetails = (sale: Venta) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const handlePrint = (saleId: number) => {
    console.log("Imprimir venta:", saleId);
    // Aquí iría la lógica de impresión
  };

  const handleCancel = (saleId: number) => {
    if (window.confirm("¿Está seguro de anular esta venta?")) {
      console.log("Anular venta:", saleId);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedPayment("");
  };

  const SaleDetailsModal = () => (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Detalles de Venta - {selectedSale?.numero_venta}
              </DialogTitle>
              <DialogDescription>
                Información completa de la venta
              </DialogDescription>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        {selectedSale && (
          <div className="space-y-6">
            {/* Sale Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información de Venta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Número:</span> {selectedSale.numero_venta}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span> {new Date(selectedSale.fecha_venta).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span> {selectedSale.usuario}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Estado:</span>
                    <Badge 
                      variant={selectedSale.estado === "completada" ? "success" : "destructive"}
                      className="ml-2"
                    >
                      {selectedSale.estado}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span> {selectedSale.cliente.nombre}
                  </div>
                  <div>
                    <span className="font-medium">Código:</span> {selectedSale.cliente.codigo}
                  </div>
                  <div>
                    <span className="font-medium">Método de Pago:</span>
                    <span className="ml-2 capitalize">{selectedSale.metodo_pago}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Productos Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.detalles.map((detalle, index) => (
                      <TableRow key={index}>
                        <TableCell>{detalle.producto}</TableCell>
                        <TableCell>{detalle.cantidad}</TableCell>
                        <TableCell>Bs {detalle.precio_unitario.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">
                          Bs {detalle.subtotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumen de Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Bs {selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descuento:</span>
                    <span>-Bs {selectedSale.descuento.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>Bs {selectedSale.impuestos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>Bs {selectedSale.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => selectedSale && handlePrint(selectedSale.id)}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          {selectedSale?.estado === "completada" && (
            <Button
              variant="outline"
              onClick={() => selectedSale && handleCancel(selectedSale.id)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Anular
            </Button>
          )}
          <Button onClick={() => setShowModal(false)}>
            Cerrar
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
          <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
          <p className="text-sm text-slate-500">Consulta y gestiona todas las ventas realizadas</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Bs {stats.ventasHoy.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Total vendido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completadas}</div>
            <p className="text-xs text-slate-600">Ventas exitosas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anuladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.anuladas}</div>
            <p className="text-xs text-slate-600">Ventas anuladas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Venta</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Bs {stats.promedioVenta.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Valor promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar Venta
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Número de venta o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Método de Pago
              </label>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.numero_venta}</div>
                      <div className="text-sm text-slate-500">Por: {sale.usuario}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{sale.cliente.nombre}</div>
                      <div className="text-sm text-slate-500">{sale.cliente.codigo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {new Date(sale.fecha_venta).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(sale.fecha_venta).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="capitalize">
                      {sale.metodo_pago}
                    </Badge>
                  </TableCell>
                  <TableCell>Bs {sale.subtotal.toFixed(2)}</TableCell>
                  <TableCell>Bs {sale.descuento.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">
                    Bs {sale.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sale.estado === "completada" ? "success" : "destructive"}>
                      {sale.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewDetails(sale)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handlePrint(sale.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {sale.estado === "completada" && (
                        <Button
                          variant="ghost"
                          onClick={() => handleCancel(sale.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && <SaleDetailsModal />}
    </div>
  );
}
