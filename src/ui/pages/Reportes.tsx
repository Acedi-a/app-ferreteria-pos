import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileText, Package, Users, DollarSign, TrendingUp } from "lucide-react";
import { getBoliviaDate, getBoliviaDateString } from "../lib/utils";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
// tablas internas se manejan en componentes
import { FiltrosReportes, type Preset } from "../components/reportes/FiltrosReportes";
import { VentasPorDia } from "../components/reportes/VentasPorDia";
import { TopProductos } from "../components/reportes/TopProductos";
import { MejoresClientes } from "../components/reportes/MejoresClientes";
import { InventarioPorCategoria } from "../components/reportes/InventarioPorCategoria";
import { ResumenFinanciero } from "../components/reportes/ResumenFinanciero";
import { ExportService, type ColumnDef } from "../services/export-service";
import { ReportesService, type RangoFechas } from "../services/reportes-service";
import { VentasDetalladas, type VentaCabecera, type VentaItem } from "../components/reportes/detallados/VentasDetalladas";
import { ComprasDetalladas, type CompraItem } from "../components/reportes/detallados/ComprasDetalladas";
import { CuentasPorCobrarDetalle, type CxCRow } from "../components/reportes/detallados/CuentasPorCobrarDetalle";
import { VentasPorUsuario, type VentasUsuarioRow } from "../components/reportes/detallados/VentasPorUsuario";
import { MargenPorProducto, type MargenProductoRow } from "../components/reportes/detallados/MargenPorProducto";

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
  const hoy = getBoliviaDate();
  const startOfWeek = () => {
    const d = new Date(hoy);
    const day = d.getDay() || 7; // Monday=1..Sunday=7
    if (day !== 1) d.setDate(d.getDate() - (day - 1));
    return d;
  }
  const startOfMonth = () => {
    const boliviaDate = getBoliviaDate();
    return new Date(boliviaDate.getFullYear(), boliviaDate.getMonth(), 1);
  }
  const startOfQuarter = () => {
    const boliviaDate = getBoliviaDate();
    const q = Math.floor(boliviaDate.getMonth() / 3) * 3;
    return new Date(boliviaDate.getFullYear(), q, 1);
  }
  const startOfYear = () => {
    const boliviaDate = getBoliviaDate();
    return new Date(boliviaDate.getFullYear(), 0, 1);
  }
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
  // Detallados
  const [ventasCab, setVentasCab] = useState<VentaCabecera[]>([]);
  const [ventasItems, setVentasItems] = useState<VentaItem[]>([]);
  const [comprasItems, setComprasItems] = useState<CompraItem[]>([]);
  const [cxcRows, setCxcRows] = useState<CxCRow[]>([]);
  const [ventasUsuario, setVentasUsuario] = useState<VentasUsuarioRow[]>([]);
  const [margenProducto, setMargenProducto] = useState<MargenProductoRow[]>([]);

  const rango = useMemo<RangoFechas>(() => (
    rangoPorSeleccion(dateRange, customDesde || undefined, customHasta || undefined)
  ), [dateRange, customDesde, customHasta]);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [v, t, c, i, f, vc, vi, ci, cx, vu, mp] = await Promise.all([
          ReportesService.ventasPorDia(rango),
          ReportesService.topProductos(rango, 10),
          ReportesService.mejoresClientes(rango, 10),
          ReportesService.inventarioPorCategoria(),
          ReportesService.resumenFinanciero(rango),
          ReportesService.ventasCabecera(rango),
          ReportesService.ventasItems(rango),
          ReportesService.comprasItems(rango),
          ReportesService.cxcDetalle(rango),
          ReportesService.ventasPorUsuario(rango),
          ReportesService.margenPorProducto(rango, 50),
        ]);
        setSalesData(v as SalesData[]);
        setTopProducts(t as ProductData[]);
        setClientData(c as ClientData[]);
        setInventoryData(i as InventoryData[]);
        setFinancialData(f as FinancialData);
        setVentasCab(vc as VentaCabecera[]);
        setVentasItems(vi as VentaItem[]);
        setComprasItems(ci as CompraItem[]);
        setCxcRows(cx as CxCRow[]);
        setVentasUsuario(vu as VentasUsuarioRow[]);
        setMargenProducto(mp as MargenProductoRow[]);
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
  <VentasDetalladas cabeceras={ventasCab} items={ventasItems} />
  <VentasPorUsuario rows={ventasUsuario} />
    </div>
  );

  const renderProductsReport = () => (
    <div className="space-y-6">
      <TopProductos datos={topProducts} />
      <MargenPorProducto rows={margenProducto} />
    </div>
  );

  const renderClientsReport = () => (
    <div className="space-y-6">
      <MejoresClientes datos={clientData} />
      <CuentasPorCobrarDetalle rows={cxcRows} />
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <InventarioPorCategoria datos={inventoryData} />
      <ComprasDetalladas items={comprasItems} />
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

  const onExport = (fmt: 'csv' | 'xlsx' | 'pdf') => {
    const range = { desde: rango.desde, hasta: rango.hasta };
    if (selectedReport === 'ventas') {
      const cols: ColumnDef<SalesData>[] = [
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'Ventas', accessor: 'ventas' },
        { header: 'Total', accessor: (r) => r.total },
        { header: 'Promedio', accessor: (r) => r.promedio },
      ];
      if (fmt === 'csv') ExportService.exportCSV(salesData, cols, 'ventas_por_dia', range);
      if (fmt === 'xlsx') ExportService.exportExcel(salesData, cols, 'ventas_por_dia', range);
      if (fmt === 'pdf') ExportService.exportPDF(salesData, cols, 'Ventas por día', range);
      // adicionales
      const cabCols: ColumnDef<VentaCabecera>[] = [
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'N° Venta', accessor: 'numero_venta' },
        { header: 'Cliente', accessor: 'cliente' },
        { header: 'Método', accessor: (r) => r.metodo_pago ?? '-' },
        { header: 'Subtotal', accessor: 'subtotal' },
        { header: 'Desc.', accessor: 'descuento' },
        { header: 'Impuestos', accessor: 'impuestos' },
        { header: 'Total', accessor: 'total' },
        { header: 'Items', accessor: 'items' },
      ];
      const itemCols: ColumnDef<VentaItem>[] = [
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'N° Venta', accessor: 'numero_venta' },
        { header: 'Producto', accessor: 'producto' },
        { header: 'Und.', accessor: (r) => r.unidad ?? '-' },
        { header: 'Cantidad', accessor: 'cantidad' },
        { header: 'P. Unit', accessor: 'precio_unitario' },
        { header: 'Desc.', accessor: 'descuento' },
        { header: 'Subtotal', accessor: 'subtotal' },
        { header: 'Cliente', accessor: 'cliente' },
      ];
      const baseCab = 'ventas_cabeceras';
      const baseIt = 'ventas_items';
      if (fmt === 'csv') {
        ExportService.exportCSV(ventasCab, cabCols, baseCab, range);
        ExportService.exportCSV(ventasItems, itemCols, baseIt, range);
      }
      if (fmt === 'xlsx') {
        ExportService.exportExcel(ventasCab, cabCols, baseCab, range);
        ExportService.exportExcel(ventasItems, itemCols, baseIt, range);
      }
      if (fmt === 'pdf') {
        ExportService.exportPDF(ventasCab, cabCols, 'Ventas - cabeceras', range);
        ExportService.exportPDF(ventasItems, itemCols, 'Ventas - items', range);
      }
    } else if (selectedReport === 'productos') {
      const cols: ColumnDef<ProductData>[] = [
        { header: 'Producto', accessor: 'nombre' },
        { header: 'Vendidos', accessor: 'vendidos' },
        { header: 'Ingresos', accessor: 'ingresos' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(topProducts, cols, 'top_productos', range);
      if (fmt === 'xlsx') ExportService.exportExcel(topProducts, cols, 'top_productos', range);
      if (fmt === 'pdf') ExportService.exportPDF(topProducts, cols, 'Top productos', range);
      const margenCols: ColumnDef<MargenProductoRow>[] = [
        { header: 'Producto', accessor: 'producto' },
        { header: 'Und.', accessor: (r) => r.unidad ?? '-' },
        { header: 'Vendidos', accessor: 'vendidos' },
        { header: 'Ingresos', accessor: 'ingresos' },
        { header: 'Costo prom.', accessor: 'costo_promedio' },
        { header: 'Costo est.', accessor: 'costo_estimado' },
        { header: 'Margen', accessor: 'margen' },
        { header: 'Margen %', accessor: 'margen_pct' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(margenProducto, margenCols, 'margen_por_producto', range);
      if (fmt === 'xlsx') ExportService.exportExcel(margenProducto, margenCols, 'margen_por_producto', range);
      if (fmt === 'pdf') ExportService.exportPDF(margenProducto, margenCols, 'Margen por producto', range);
    } else if (selectedReport === 'clientes') {
      const cols: ColumnDef<ClientData>[] = [
        { header: 'Cliente', accessor: 'nombre' },
        { header: 'Compras', accessor: 'compras' },
        { header: 'Total', accessor: 'total' },
        { header: 'Última', accessor: 'ultima' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(clientData, cols, 'mejores_clientes', range);
      if (fmt === 'xlsx') ExportService.exportExcel(clientData, cols, 'mejores_clientes', range);
      if (fmt === 'pdf') ExportService.exportPDF(clientData, cols, 'Mejores clientes', range);
      const cxcCols: ColumnDef<CxCRow>[] = [
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'Cliente', accessor: 'cliente' },
        { header: 'Monto', accessor: 'monto' },
        { header: 'Pagado', accessor: 'pagado' },
        { header: 'Saldo', accessor: 'saldo' },
        { header: 'Estado', accessor: 'estado' },
        { header: 'Vence', accessor: (r) => r.fecha_vencimiento ?? '-' },
        { header: 'Días venc.', accessor: (r) => r.dias_vencido ?? '-' },
        { header: 'Venta', accessor: (r) => r.numero_venta ?? '-' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(cxcRows, cxcCols, 'cuentas_por_cobrar', range);
      if (fmt === 'xlsx') ExportService.exportExcel(cxcRows, cxcCols, 'cuentas_por_cobrar', range);
      if (fmt === 'pdf') ExportService.exportPDF(cxcRows, cxcCols, 'Cuentas por cobrar', range);
    } else if (selectedReport === 'inventario') {
      const cols: ColumnDef<InventoryData>[] = [
        { header: 'Categoría', accessor: 'categoria' },
        { header: 'Productos', accessor: 'productos' },
        { header: 'Valor', accessor: 'valor' },
        { header: 'Stock bajo', accessor: 'stock_bajo' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(inventoryData, cols, 'inventario_por_categoria', range);
      if (fmt === 'xlsx') ExportService.exportExcel(inventoryData, cols, 'inventario_por_categoria', range);
      if (fmt === 'pdf') ExportService.exportPDF(inventoryData, cols, 'Inventario por categoría', range);
      const compCols: ColumnDef<CompraItem>[] = [
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'N° Compra', accessor: 'numero_compra' },
        { header: 'Producto', accessor: 'producto' },
        { header: 'Und.', accessor: (r) => r.unidad ?? '-' },
        { header: 'Cantidad', accessor: 'cantidad' },
        { header: 'C. Unit', accessor: 'costo_unitario' },
        { header: 'Desc.', accessor: 'descuento' },
        { header: 'Subtotal', accessor: 'subtotal' },
        { header: 'Proveedor', accessor: 'proveedor' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(comprasItems, compCols, 'compras_detalladas', range);
      if (fmt === 'xlsx') ExportService.exportExcel(comprasItems, compCols, 'compras_detalladas', range);
      if (fmt === 'pdf') ExportService.exportPDF(comprasItems, compCols, 'Compras detalladas', range);
    } else if (selectedReport === 'financiero' && financialData) {
      const row = [financialData];
      const cols: ColumnDef<FinancialData>[] = [
        { header: 'Ingresos', accessor: 'ingresos' },
        { header: 'Costos', accessor: 'costos' },
        { header: 'Utilidad bruta', accessor: 'utilidad_bruta' },
        { header: 'Gastos', accessor: 'gastos' },
        { header: 'Utilidad neta', accessor: 'utilidad_neta' },
        { header: 'Margen bruto %', accessor: 'margen_bruto' },
        { header: 'Margen neto %', accessor: 'margen_neto' },
      ];
      if (fmt === 'csv') ExportService.exportCSV(row, cols, 'resumen_financiero', range);
      if (fmt === 'xlsx') ExportService.exportExcel(row, cols, 'resumen_financiero', range);
      if (fmt === 'pdf') ExportService.exportPDF(row, cols, 'Resumen financiero', range);
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
          <Button variant="outline" disabled={loading} onClick={() => onExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button disabled={loading} onClick={() => onExport('xlsx')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button disabled={loading} onClick={() => onExport('csv')}>
            CSV
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
