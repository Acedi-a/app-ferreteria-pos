import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileText, Package, Users, DollarSign, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
// tablas internas se manejan en componentes
import { FiltrosReportes, type Preset } from "../components/reportes/FiltrosReportes";
import { VentasPorDia } from "../components/reportes/VentasPorDia";
import { TopProductos } from "../components/reportes/TopProductos";
import { MejoresClientes } from "../components/reportes/MejoresClientes";
import { InventarioPorCategoria } from "../components/reportes/InventarioPorCategoria";
import { ResumenFinanciero } from "../components/reportes/ResumenFinanciero";
import { ReportesService, type RangoFechas } from "../services/reportes-service";

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

/* --- Config --- */
const reportTypes: ReportType[] = [
  { id: "ventas", name: "Reporte de Ventas", icon: <DollarSign className="h-6 w-6" /> },
  { id: "productos", name: "Análisis de Productos", icon: <Package className="h-6 w-6" /> },
  { id: "clientes", name: "Reporte de Clientes", icon: <Users className="h-6 w-6" /> },
  { id: "inventario", name: "Estado de Inventario", icon: <BarChart3 className="h-6 w-6" /> },
  { id: "financiero", name: "Reporte Financiero", icon: <TrendingUp className="h-6 w-6" /> },
];
function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function rangoPorSeleccion(sel: string, desde?: string, hasta?: string): RangoFechas {
  const hoy = new Date();
  const startOfWeek = () => {
    const d = new Date(hoy);
    const day = d.getDay() || 7; // Monday=1..Sunday=7
    if (day !== 1) d.setDate(d.getDate() - (day - 1));
    return d;
  }
  const startOfMonth = () => new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const startOfQuarter = () => {
    const q = Math.floor(hoy.getMonth() / 3) * 3;
    return new Date(hoy.getFullYear(), q, 1);
  }
  const startOfYear = () => new Date(hoy.getFullYear(), 0, 1);
  switch (sel) {
    case 'today':
      return { desde: toISO(hoy), hasta: toISO(hoy) };
    case 'week':
      return { desde: toISO(startOfWeek()), hasta: toISO(hoy) };
    case 'month':
      return { desde: toISO(startOfMonth()), hasta: toISO(hoy) };
    case 'quarter':
      return { desde: toISO(startOfQuarter()), hasta: toISO(hoy) };
    case 'year':
      return { desde: toISO(startOfYear()), hasta: toISO(hoy) };
    case 'custom':
    default:
      return { desde, hasta };
  }
}

export default function Reportes() {
  const [selectedReport, setSelectedReport] = useState("ventas");
  const [dateRange, setDateRange] = useState<Preset>("today");
  const [customDesde, setCustomDesde] = useState<string>("");
  const [customHasta, setCustomHasta] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  const rango = useMemo<RangoFechas>(() => (
    rangoPorSeleccion(dateRange, customDesde || undefined, customHasta || undefined)
  ), [dateRange, customDesde, customHasta]);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [v, t, c, i, f] = await Promise.all([
          ReportesService.ventasPorDia(rango),
          ReportesService.topProductos(rango, 10),
          ReportesService.mejoresClientes(rango, 10),
          ReportesService.inventarioPorCategoria(),
          ReportesService.resumenFinanciero(rango),
        ]);
        setSalesData(v as SalesData[]);
        setTopProducts(t as ProductData[]);
        setClientData(c as ClientData[]);
        setInventoryData(i as InventoryData[]);
        setFinancialData(f as FinancialData);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [rango.desde, rango.hasta]);

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
              Bs
              {(() => {
                const total = salesData.reduce((sum, day) => sum + day.total, 0);
                const cnt = salesData.reduce((sum, day) => sum + day.ventas, 0);
                return (cnt > 0 ? total / cnt : 0).toFixed(2);
              })()}
            </div>
            <p className="text-xs text-slate-600">Promedio por venta</p>
          </CardContent>
        </Card>
      </div>

  <VentasPorDia datos={salesData} />
    </div>
  );

  const renderProductsReport = () => <div className="space-y-6"><TopProductos datos={topProducts} /></div>;

  const renderClientsReport = () => <div className="space-y-6"><MejoresClientes datos={clientData} /></div>;

  const renderInventoryReport = () => <div className="space-y-6"><InventarioPorCategoria datos={inventoryData} /></div>;

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
                  Bs {(financialData?.ingresos ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Costos de Ventas</span>
                <span className="text-sm font-bold text-red-600">
                  -Bs {(financialData?.costos ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Utilidad Bruta</span>
                <span className="text-sm font-bold text-blue-600">
                  Bs {(financialData?.utilidad_bruta ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">Gastos Operativos</span>
                <span className="text-sm font-bold text-red-600">
                  -Bs {(financialData?.gastos ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-slate-300">
                <span className="text-base font-bold text-slate-900">Utilidad Neta</span>
                <span className="text-base font-bold text-green-600">
                  Bs {(financialData?.utilidad_neta ?? 0).toFixed(2)}
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
                    {(financialData?.margen_bruto ?? 0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${financialData?.margen_bruto ?? 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Margen Neto</span>
                  <span className="text-sm font-bold text-green-600">
                    {(financialData?.margen_neto ?? 0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${financialData?.margen_neto ?? 0}%` }}
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
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis {loading && <span className="ml-2 text-sm text-slate-400">(cargando...)</span>}</h1>
          <p className="text-sm text-slate-500">Analiza el rendimiento de tu ferretería</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" disabled={loading}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button disabled={loading}>
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
      <FiltrosReportes
        preset={dateRange}
        setPreset={(p) => setDateRange(p)}
        rango={{ desde: customDesde || undefined, hasta: customHasta || undefined }}
        setRango={(r) => { setCustomDesde(r.desde || ""); setCustomHasta(r.hasta || ""); }}
        loading={loading}
      />

  {/* Report Content */}
  <ResumenFinanciero datos={financialData} />
  {renderReport()}
    </div>
  );
}
