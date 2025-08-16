// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import { ShoppingCart, Package, CreditCard, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../components/ui/Button";
import StatsCards from "../components/dashboard/StatsCards";
import RecentSales from "../components/dashboard/RecentSales";
import LowStock from "../components/dashboard/LowStock";
import { DashboardService, type DashboardStats, type VentaReciente, type StockBajoItem } from "../services/dashboard-service";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ventas, setVentas] = useState<VentaReciente[]>([]);
  const [stockBajo, setStockBajo] = useState<StockBajoItem[]>([]);

  useEffect(() => {
    (async () => {
      const [s, v, sb] = await Promise.all([
        DashboardService.obtenerStats(),
        DashboardService.obtenerVentasRecientes(5),
        DashboardService.obtenerStockBajo(5),
      ]);
      setStats(s);
      setVentas(v);
      setStockBajo(sb);
    })();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500">Resumen general de tu negocio</p>
        </div>
        <Link to="/punto-venta">
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      {stats && (
        <StatsCards
          ventasHoyTotal={stats.ventasHoyTotal}
          productosEnStock={stats.productosEnStock}
          clientesActivos={stats.clientesActivos}
          cuentasPorCobrarTotal={stats.cuentasPorCobrarTotal}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentSales ventas={ventas} />
        <LowStock items={stockBajo} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Punto de Venta", icon: ShoppingCart, path: "/punto-venta" },
          { label: "Productos", icon: Package, path: "/productos" },
          { label: "Cuentas por Cobrar", icon: CreditCard, path: "/cuentas-por-cobrar" },
          { label: "Reportes", icon: BarChart3, path: "/reportes" },
        ].map(({ label, icon: Icon, path }) => (
          <Link key={path} to={path}>
            <Card className="cursor-pointer transition-colors hover:bg-slate-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  {label === "Punto de Venta"
                    ? "Realizar nueva venta"
                    : label === "Productos"
                    ? "Gestionar catálogo"
                    : label === "Cuentas por Cobrar"
                    ? "Gestionar deudas"
                    : "Ver estadísticas"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}