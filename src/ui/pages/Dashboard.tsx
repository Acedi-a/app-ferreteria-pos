// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
} from "lucide-react";

/* ---------- componentes propios ---------- */
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

/* ---------- datos de ejemplo ---------- */
const stats = {
  ventasHoy: { valor: "Bs 2,450.00", cambio: "+12%" },
  productosStock: { valor: "1,234", cambio: "-2%" },
  clientesActivos: { valor: "89", cambio: "+5%" },
  cuentasPorCobrar: { valor: "Bs 8,920.00", cambio: "+8%" },
};

const ventasRecientes = [
  { id: "V001", cliente: "Juan Pérez", total: "Bs 125.50", fecha: "2024-01-15 14:30" },
  { id: "V002", cliente: "María García", total: "Bs 89.25", fecha: "2024-01-15 13:15" },
  { id: "V003", cliente: "Carlos López", total: "Bs 234.75", fecha: "2024-01-15 12:45" },
];

const productosStockBajo = [
  { nombre: "Producto A", stock: 5, minimo: 10 },
  { nombre: "Producto B", stock: 2, minimo: 15 },
  { nombre: "Producto C", stock: 8, minimo: 20 },
];

/* ---------- componente principal ---------- */
export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
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

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ventasHoy.valor}</div>
            <p className="text-xs text-slate-500">
              <span className="text-green-600">{stats.ventasHoy.cambio}</span> desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosStock.valor}</div>
            <p className="text-xs text-slate-500">
              <span className="text-red-600">{stats.productosStock.cambio}</span> desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientesActivos.valor}</div>
            <p className="text-xs text-slate-500">
              <span className="text-green-600">{stats.clientesActivos.cambio}</span> este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cuentasPorCobrar.valor}</div>
            <p className="text-xs text-slate-500">
              <span className="text-yellow-600">{stats.cuentasPorCobrar.cambio}</span> pendiente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ventas recientes vs Alertas de stock */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas transacciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ventasRecientes.map((v) => (
                <div key={v.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {v.id} - {v.cliente}
                    </p>
                    <p className="text-sm text-slate-500">{v.fecha}</p>
                  </div>
                  <div className="font-medium">{v.total}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/ventas">
                <Button variant="outline" className="w-full">
                  Ver todas las ventas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Stock Bajo
            </CardTitle>
            <CardDescription>Productos que necesitan reposición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productosStockBajo.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-sm text-slate-500">Mínimo: {p.minimo}</p>
                  </div>
                  <Badge variant="destructive">{p.stock}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/inventario">
                <Button variant="outline" className="w-full">
                  Gestionar Inventario
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Punto de Venta", icon: ShoppingCart, path: "/punto-venta" },
          { label: "Productos", icon: Package, path: "/productos" },
          { label: "Cuentas por Cobrar", icon: CreditCard, path: "/cuentas-cobrar" },
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