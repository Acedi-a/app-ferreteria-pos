import { useState } from "react";
import { Search, Download, Upload, Package, CheckCircle, AlertTriangle, DollarSign, Settings, X } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

interface MovimientoInventario {
  id: number;
  producto: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  referencia: string;
  fecha: string;
  usuario: string;
}

interface ItemInventario {
  id: number;
  codigo_interno: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  valor_total: number;
  ultimo_movimiento: string;
  tipo_ultimo_movimiento: string;
  unidad_medida: string;
}

/* --- Datos --- */
const initialInventory: ItemInventario[] = [
  {
    id: 1,
    codigo_interno: "P001",
    nombre: 'Tornillos Autorroscantes 1/4"',
    categoria: "Tornillería",
    stock_actual: 500,
    stock_minimo: 100,
    costo_unitario: 0.15,
    valor_total: 75.0,
    ultimo_movimiento: "2024-01-20",
    tipo_ultimo_movimiento: "venta",
    unidad_medida: "unidad",
  },
  {
    id: 2,
    codigo_interno: "P002",
    nombre: "Pintura Látex Blanca 1L",
    categoria: "Pinturas",
    stock_actual: 8,
    stock_minimo: 10,
    costo_unitario: 8.5,
    valor_total: 68.0,
    ultimo_movimiento: "2024-01-19",
    tipo_ultimo_movimiento: "venta",
    unidad_medida: "litro",
  },
  {
    id: 3,
    codigo_interno: "P003",
    nombre: "Cable Eléctrico 12 AWG",
    categoria: "Eléctricos",
    stock_actual: 124,
    stock_minimo: 50,
    costo_unitario: 1.2,
    valor_total: 148.8,
    ultimo_movimiento: "2024-01-18",
    tipo_ultimo_movimiento: "entrada",
    unidad_medida: "metro",
  },
  {
    id: 4,
    codigo_interno: "P004",
    nombre: 'Tubo PVC 2" x 6m',
    categoria: "Plomería",
    stock_actual: 18,
    stock_minimo: 15,
    costo_unitario: 4.25,
    valor_total: 76.5,
    ultimo_movimiento: "2024-01-17",
    tipo_ultimo_movimiento: "venta",
    unidad_medida: "unidad",
  },
];

const initialMovements: MovimientoInventario[] = [
  {
    id: 1,
    producto: 'Tornillos Autorroscantes 1/4"',
    tipo: "salida",
    cantidad: 50,
    stock_anterior: 550,
    stock_nuevo: 500,
    referencia: "V001",
    fecha: "2024-01-20 14:30",
    usuario: "admin",
  },
  {
    id: 2,
    producto: "Pintura Látex Blanca 1L",
    tipo: "salida",
    cantidad: 8,
    stock_anterior: 16,
    stock_nuevo: 8,
    referencia: "V002",
    fecha: "2024-01-19 13:15",
    usuario: "admin",
  },
  {
    id: 3,
    producto: "Cable Eléctrico 12 AWG",
    tipo: "entrada",
    cantidad: 100,
    stock_anterior: 24,
    stock_nuevo: 124,
    referencia: "C001",
    fecha: "2024-01-18 10:00",
    usuario: "admin",
  },
];

const categorias = ["Todas", "Tornillería", "Pinturas", "Eléctricos", "Plomería", "Herramientas"];

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<ItemInventario | null>(null);
  const [inventario] = useState<ItemInventario[]>(initialInventory);
  const [movimientos] = useState<MovimientoInventario[]>(initialMovements);

  const filteredInventory = inventario.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || selectedCategory === "Todas" || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalProductos: inventario.length,
    stockNormal: inventario.filter((item) => item.stock_actual > item.stock_minimo).length,
    stockBajo: inventario.filter((item) => item.stock_actual <= item.stock_minimo).length,
    valorTotal: inventario.reduce((sum, item) => sum + item.valor_total, 0),
  };

  const handleAdjustStock = (product: ItemInventario) => {
    setAdjustingProduct(product);
    setShowAdjustModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  const AdjustStockModal = () => (
    <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Ajustar Stock - {adjustingProduct?.nombre}
              </DialogTitle>
              <DialogDescription>
                Realiza ajustes al inventario del producto
              </DialogDescription>
            </div>
            <button 
              onClick={() => setShowAdjustModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        {adjustingProduct && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información del Producto</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Código:</span> {adjustingProduct.codigo_interno}
                </div>
                <div>
                  <span className="font-medium">Stock Actual:</span> {adjustingProduct.stock_actual} {adjustingProduct.unidad_medida}
                </div>
                <div>
                  <span className="font-medium">Stock Mínimo:</span> {adjustingProduct.stock_minimo} {adjustingProduct.unidad_medida}
                </div>
                <div>
                  <span className="font-medium">Costo Unitario:</span> ${adjustingProduct.costo_unitario.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Ajuste
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="entrada">Entrada (Aumentar Stock)</option>
                  <option value="salida">Salida (Reducir Stock)</option>
                  <option value="ajuste">Ajuste Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese la cantidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Motivo del ajuste..."
                />
              </div>
            </form>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowAdjustModal(false)}
          >
            Cancelar
          </Button>
          <Button>
            Aplicar Ajuste
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
          <h1 className="text-3xl font-bold tracking-tight">Control de Inventario</h1>
          <p className="text-sm text-slate-500">Monitorea y gestiona el stock de productos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Inventario
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Importar Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalProductos}</div>
            <p className="text-xs text-slate-600">Productos en inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Normal</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.stockNormal}</div>
            <p className="text-xs text-slate-600">Con stock suficiente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.stockBajo}</div>
            <p className="text-xs text-slate-600">Requiere reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${stats.valorTotal.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Valor del inventario</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar Producto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat === "Todas" ? "" : cat}>
                    {cat}
                  </option>
                ))}
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

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Costo Unit.</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const stockStatus = item.stock_actual <= item.stock_minimo ? "low" : "normal";

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nombre}</div>
                        <div className="text-sm text-slate-500">
                          Último mov: {new Date(item.ultimo_movimiento).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.codigo_interno}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {item.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            stockStatus === "low" ? "text-red-600" : "text-slate-900"
                          }`}
                        >
                          {item.stock_actual}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{item.unidad_medida}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.stock_minimo} {item.unidad_medida}
                    </TableCell>
                    <TableCell>
                      ${item.costo_unitario.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${item.valor_total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus === "low" ? "destructive" : "success"}>
                        {stockStatus === "low" ? "Stock Bajo" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => handleAdjustStock(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Stock Anterior</TableHead>
                <TableHead>Stock Nuevo</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="font-medium">{mov.producto}</TableCell>
                  <TableCell>
                    <Badge variant={mov.tipo === "entrada" ? "success" : "destructive"}>
                      {mov.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{mov.cantidad}</TableCell>
                  <TableCell>{mov.stock_anterior}</TableCell>
                  <TableCell className="font-medium">{mov.stock_nuevo}</TableCell>
                  <TableCell>{mov.referencia}</TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(mov.fecha).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-500">{mov.usuario}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showAdjustModal && <AdjustStockModal />}
    </div>
  );
}
