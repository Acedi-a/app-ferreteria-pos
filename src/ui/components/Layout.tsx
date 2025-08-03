// src/components/Layout.tsx
import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  Home,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Warehouse,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Punto de Venta", href: "/punto-venta", icon: Store },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Proveedores", href: "/proveedores", icon: Warehouse },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "Cuentas por Cobrar", href: "/cuentas-por-cobrar", icon: CreditCard },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
  { name: "Categorías y Unidades", href: "/categoria-unidad", icon: Package },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-200 ${
              isActive
                ? "bg-slate-200 text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar fijo (desktop) */}
      <aside className="hidden h-screen flex-col border-r bg-slate-50 md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Store className="h-6 w-6" />
            <span>Sistema POS</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <NavItems />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header móvil */}
        <header className="flex h-14 items-center gap-4 border-b bg-slate-50 px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1 text-slate-600 hover:bg-slate-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Sistema POS</h1>
        </header>

        {/* Drawer móvil (simple) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 md:hidden">
            {/* overlay */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            {/* panel */}
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="flex h-14 items-center justify-between border-b px-4">
                <span className="font-semibold">Menú</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2 p-4">
                <NavItems />
              </nav>
            </aside>
          </div>
        )}

        {/* Contenido de la página */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}