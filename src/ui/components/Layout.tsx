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
              className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ease-out ${
                isActive
                  ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200 transform scale-[1.01]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                isActive 
                  ? "bg-white shadow-sm" 
                  : "bg-gray-100 group-hover:bg-gray-200"
              }`}>
                <Icon className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                }`} />
              </div>
              <span className="font-medium tracking-wide">{item.name}</span>
            </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fijo (desktop) */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 hidden md:flex flex-col bg-white/95 backdrop-blur-2xl border-r border-gray-200 shadow-2xl">
        {/* Header del sidebar */}
        <div className="flex h-20 items-center justify-center border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-light tracking-wide text-white">Ferreteria</span>
              <span className="text-xs opacity-80 font-light text-gray-300">Sistema de Gestión</span>
            </div>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavItems />
        </nav>
        
        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-2xl border border-gray-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">Sistema Activo</span>
            </div>
            <p className="text-xs text-gray-500 mb-1">Versión 1.0.0</p>
            <p className="text-xs text-gray-400">© 2024 Ferreteria</p>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="md:ml-72">
        {/* Header móvil */}
        <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-2xl px-6 md:hidden shadow-lg">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-3 border border-gray-200 bg-white/80 hover:bg-gray-100/80 text-gray-600 shadow-sm transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-3 text-gray-900">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium tracking-wide text-white">Ferreteria</span>
              <span className="text-xs text-gray-300 font-light">Sistema de Gestión</span>
            </div>
          </Link>
        </header>

        {/* Sidebar móvil */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-gray-200">
              {/* Header del sidebar móvil */}
              <div className="flex h-20 items-center justify-between border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 px-6">
                <Link
                  to="/"
                  className="flex items-center gap-3 text-gray-900"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-medium tracking-wide text-white">Ferreteria</span>
                    <span className="text-xs text-gray-300 font-light">Sistema de Gestión</span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navegación móvil */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <NavItems />
              </nav>
              
              {/* Footer del sidebar móvil */}
              <div className="p-4 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">Sistema Activo</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Versión 1.0.0</p>
                  <p className="text-xs text-gray-400">© 2024 Ferreteria</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Contenido de la página */}
        <main className="min-h-screen p-8">
          <div className="mx-auto">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-gray-200 shadow-2xl shadow-gray-900/5 p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}