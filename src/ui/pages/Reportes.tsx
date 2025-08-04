import { useState } from "react";
import { BarChart3, Download, FileText, Package, Users, DollarSign, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

interface ReportType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SalesData {
  fecha: string;
  ventas: number;
  total: number;
  promedio: number;
}

interface ProductData {
  nombre: string;
  vendidos: number;
  ingresos: number;
}

interface ClientData {
  nombre: string;
  compras: number;
  total: number;
  ultima: string;
}

interface InventoryData {
  categoria: string;
  productos: number;
  valor: number;
  stock_bajo: number;
}

interface FinancialData {
  ingresos: number;
  costos: number;
  utilidad_bruta: number;
  gastos: number;
  utilidad_neta: number;
  margen_bruto: number;
  margen_neto: number;
}

/* --- Datos --- */
const reportTypes: ReportType[] = [
  { id: "ventas", name: "Reporte de Ventas", icon: <DollarSign className="h-6 w-6" /> },
  { id: "productos", name: "Análisis de Productos", icon: <Package className="h-6 w-6" /> },
  { id: "clientes", name: "Reporte de Clientes", icon: <Users className="h-6 w-6" /> },
  { id: "inventario", name: "Estado de Inventario", icon: <BarChart3 className="h-6 w-6" /> },
  { id: "financiero", name: "Reporte Financiero", icon: <TrendingUp className="h-6 w-6" /> },
];

const salesData: SalesData[] = [
  { fecha: "2024-01-20", ventas: 15, total: 2847.5, promedio: 189.83 },
  { fecha: "2024-01-19", ventas: 12, total: 2156.75, promedio: 179.73 },
  { fecha: "2024-01-18", ventas: 18, total: 3421.25, promedio: 190.07 },
  { fecha: "2024-01-17", ventas: 9, total: 1678.9, promedio: 186.54 },
  { fecha: "2024-01-16", ventas: 14, total: 2789.6, promedio: 199.26 },
];

const topProducts: ProductData[] = [
  { nombre: 'Tornillos 1/4"', vendidos: 450, ingresos: 112.5 },
  { nombre: "Pintura Blanca 1L", vendidos: 35, ingresos: 446.25 },
  { nombre: "Cable 12 AWG", vendidos: 120, ingresos: 216.0 },
  { nombre: 'Tubo PVC 2"', vendidos: 28, ingresos: 182.0 },
  { nombre: "Cemento 50kg", vendidos: 15, ingresos: 225.0 },
];

const clientData: ClientData[] = [
  { nombre: "Juan Carlos Pérez", compras: 8, total: 1245.75, ultima: "2024-01-20" },
  { nombre: "María Elena García", compras: 5, total: 892.5, ultima: "2024-01-19" },
  { nombre: "Carlos López", compras: 12, total: 2156.25, ultima: "2024-01-18" },
  { nombre: "Ana Martínez", compras: 3, total: 456.8, ultima: "2024-01-17" },
  { nombre: "Pedro González", compras: 7, total: 1089.45, ultima: "2024-01-16" },
];

const inventoryData: InventoryData[] = [
  { categoria: "Tornillería", productos: 45, valor: 2456.75, stock_bajo: 3 },
  { categoria: "Pinturas", productos: 28, valor: 3421.5, stock_bajo: 2 },
  { categoria: "Eléctricos", productos: 67, valor: 4567.25, stock_bajo: 5 },
  { categoria: "Plomería", productos: 34, valor: 2890.8, stock_bajo: 1 },
  { categoria: "Herramientas", productos: 23, valor: 5678.9, stock_bajo: 0 },
];

const financialData: FinancialData = {
  ingresos: 15420.75,
  costos: 9876.5,
  utilidad_bruta: 5544.25,
  gastos: 1234.6,
  utilidad_neta: 4309.65,
  margen_bruto: 35.9,
  margen_neto: 27.9,
};

export default function Reportes() {
  const [selectedReport, setSelectedReport] = useState("ventas");
  const [dateRange, setDateRange] = useState("today");

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {salesData.reduce((sum, day) => sum + day.ventas, 0)}
            </div>
            <p className="text-xs text-slate-600">Ventas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Bs {salesData.reduce((sum, day) => sum + day.total, 0).toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Total facturado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venta Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              $
              {(
                salesData.reduce((sum, day) => sum + day.total, 0) / 
                salesData.reduce((sum, day) => sum + day.ventas, 0)
              ).toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Promedio por venta</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((day, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(day.fecha).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{day.ventas}</TableCell>
                  <TableCell className="font-medium">
                    Bs {day.total.toFixed(2)}
                  </TableCell>
                  <TableCell>Bs {day.promedio.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderProductsReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad Vendida</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Participación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product, index) => {
                const totalIngresos = topProducts.reduce((sum, p) => sum + p.ingresos, 0);
                const participacion = ((product.ingresos / totalIngresos) * 100).toFixed(1);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.nombre}</TableCell>
                    <TableCell>{product.vendidos}</TableCell>
                    <TableCell className="font-medium">
                      Bs {product.ingresos.toFixed(2)}
                    </TableCell>
                    <TableCell>{participacion}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderClientsReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mejores Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Total Gastado</TableHead>
                <TableHead>Promedio</TableHead>
                <TableHead>Última Compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map((client, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client.nombre}</TableCell>
                  <TableCell>{client.compras}</TableCell>
                  <TableCell className="font-medium">
                    Bs {client.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    Bs {(client.total / client.compras).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(client.ultima).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventario por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Stock Bajo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {category.categoria}
                  </TableCell>
                  <TableCell>{category.productos}</TableCell>
                  <TableCell className="font-medium">
                    Bs {category.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>{category.stock_bajo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        category.stock_bajo === 0
                          ? "success"
                          : category.stock_bajo <= 2
                          ? "default"
                          : "destructive"
                      }
                    >
                      {category.stock_bajo === 0 
                        ? "Óptimo" 
                        : category.stock_bajo <= 2 
                        ? "Atención" 
                        : "Crítico"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Ingresos Totales</span>
                <span className="text-sm font-bold text-green-600">
                  Bs {financialData.ingresos.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Costos de Ventas</span>
                <span className="text-sm font-bold text-red-600">
                  -Bs {financialData.costos.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Utilidad Bruta</span>
                <span className="text-sm font-bold text-blue-600">
                  Bs {financialData.utilidad_bruta.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Gastos Operativos</span>
                <span className="text-sm font-bold text-red-600">
                  -Bs {financialData.gastos.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-slate-300">
                <span className="text-base font-bold text-slate-900">Utilidad Neta</span>
                <span className="text-base font-bold text-green-600">
                  Bs {financialData.utilidad_neta.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Márgenes de Rentabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Margen Bruto</span>
                  <span className="text-sm font-bold text-blue-600">
                    {financialData.margen_bruto}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${financialData.margen_bruto}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Margen Neto</span>
                  <span className="text-sm font-bold text-green-600">
                    {financialData.margen_neto}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${financialData.margen_neto}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case "ventas":
        return renderSalesReport();
      case "productos":
        return renderProductsReport();
      case "clientes":
        return renderClientsReport();
      case "inventario":
        return renderInventoryReport();
      case "financiero":
        return renderFinancialReport();
      default:
        return renderSalesReport();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-sm text-slate-500">Analiza el rendimiento de tu ferretería</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Report Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                  selectedReport === report.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">{report.icon}</div>
                  <div className="text-sm font-medium">{report.name}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Período de Análisis
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="quarter">Este Trimestre</option>
                <option value="year">Este Año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            {dateRange === "custom" && (
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Desde
                  </label>
                  <input
                    type="date"
                    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hasta
                  </label>
                  <input
                    type="date"
                    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
}
