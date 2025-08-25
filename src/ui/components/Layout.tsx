// src/components/Layout.tsx
import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
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
import logoClaudio from "../assets/logo_claudio.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Punto de Venta", href: "/punto-venta", icon: Store },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Proveedores", href: "/proveedores", icon: Warehouse },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "Cuentas por Cobrar", href: "/cuentas-por-cobrar", icon: CreditCard },
  { name: "Cuentas por Pagar", href: "/cuentas-por-pagar", icon: CreditCard },
  { name: "Cajas", href: "/cajas", icon: Store },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
  { name: "Categorías y Unidades", href: "/categoria-unidad", icon: Package },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const NavItems = ({ collapsed = false }: { collapsed?: boolean }) => (
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
              } ${collapsed ? "justify-center px-2 relative" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                isActive 
                  ? "bg-white shadow-sm" 
                  : "bg-gray-100 group-hover:bg-gray-200"
              }`}>
                <Icon className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                  isActive ? "text-red-600" : "text-gray-500 group-hover:text-gray-700"
                }`} />
              </div>
              {!collapsed && <span className="font-medium tracking-wide">{item.name}</span>}
            </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fijo (desktop) */}
      <aside className={`fixed left-0 top-0 z-40 h-screen hidden md:flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Header del sidebar */}
        <div className="flex h-24 items-center justify-center border-b border-gray-300 bg-white relative">
          {sidebarCollapsed ? (
            <div className="p-2">
              <img 
                src={logoClaudio} 
                alt="Ferreteria Claudio" 
                className="h-12 w-auto object-contain" 
              />
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-4 text-gray-900">
              <div className="p-2">
                <img 
                  src={logoClaudio} 
                  alt="Ferreteria Claudio" 
                  className="h-16 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wide text-gray-900">Ferretería Claudio</span>
                <span className="text-sm font-medium text-gray-600 tracking-wide">Sistema de Gestión</span>
              </div>
            </Link>
          )}
          
          {/* Botón de colapsar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-3 w-3 text-gray-600" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <NavItems collapsed={sidebarCollapsed} />
        </nav>
        
        {/* Footer del sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1">
                <img 
                  src={logoClaudio} 
                  alt="Ferreteria Claudio" 
                  className="h-6 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wide text-gray-900">Ferretería Claudio</span>
                <span className="text-xs font-medium text-gray-600 tracking-wide">Sistema de Gestión</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-semibold text-gray-700">Sistema Activo</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Versión 1.0.0</p>
              <p className="text-xs text-gray-500">© 2024 Ferretería Claudio</p>
            </div>
          </div>
        )}
      </aside>

      {/* Contenido principal */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Header móvil */}
        <header className="flex items-center gap-4 border-b border-gray-300 bg-white px-6 md:hidden shadow-sm h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-3 text-gray-900">
            <div className="p-1">
              <img 
                src={logoClaudio} 
                alt="Ferreteria Claudio" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wide text-gray-900">Ferretería Claudio</span>
              <span className="text-xs font-medium text-gray-600 tracking-wide">Sistema de Gestión</span>
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
            <aside className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg border-r border-gray-200">
              {/* Header del sidebar móvil */}
              <div className="flex h-24 items-center justify-between border-b border-gray-700 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-6 shadow-xl">
                <Link
                  to="/"
                  className="flex items-center gap-3 text-white hover:scale-105 transition-transform duration-300 group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg group-hover:bg-white/20 transition-all duration-300">
                    <img src={logoClaudio} alt="Ferreteria Claudio" className="h-8 w-auto object-contain filter drop-shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold tracking-wide text-white drop-shadow-sm">Ferretería Claudio</span>
                    <span className="text-xs opacity-90 font-medium text-blue-200 tracking-wider uppercase">Sistema de Gestión</span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navegación móvil */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <NavItems />
              </nav>
              
              {/* Footer del sidebar móvil */}
              <div className="border-t border-gray-300 bg-white p-4">
                <div className="flex items-center gap-3 text-gray-900 mb-4">
                <div className="p-1">
                  <img 
                    src={logoClaudio} 
                    alt="Ferreteria Claudio" 
                    className="h-6 w-auto object-contain" 
                  />
                </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-wide text-gray-900">Ferretería Claudio</span>
                    <span className="text-xs font-medium text-gray-600 tracking-wide">Sistema de Gestión</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-700">Sistema Activo</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Versión 1.0.0</p>
                  <p className="text-xs text-gray-500">© 2024 Ferretería Claudio</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Contenido de la página */}
        <main className="min-h-screen p-6">
          <div className="mx-auto ">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}