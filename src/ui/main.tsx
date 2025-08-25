import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import PuntoVenta from './pages/PuntoVenta';
import './main.css';
import Productos from './pages/Productos';
import ProductosMasivos from './pages/ProductosMasivos';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';
import CuentasPorCobrar from './pages/CuentasPorCobrar';
import CuentasPorPagar from './pages/CuentasPorPagar';
import Configuracion from './pages/Configuracion';
import Cajas from './pages/Cajas';
import CategoriaTipo from './pages/CategoriaTipo';
import { Toaster } from "./components/ui/toaster";
import { CajaProvider } from './contexts/CajaContext';

// Prevenir scroll en inputs numéricos
document.addEventListener('DOMContentLoaded', () => {
  // Función para prevenir scroll en inputs numéricos
  const preventScrollOnNumberInputs = (e: WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
      if (document.activeElement === target) {
        e.preventDefault();
      }
    }
  };

  // Agregar listener global
  document.addEventListener('wheel', preventScrollOnNumberInputs, { passive: false });

  // También prevenir cuando el input está enfocado
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
      target.addEventListener('wheel', (wheelEvent) => {
        wheelEvent.preventDefault();
      }, { passive: false });
    }
  });
});

// Backup: agregar listener inmediatamente si el DOM ya está cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addScrollPrevention();
  });
} else {
  addScrollPrevention();
}

function addScrollPrevention() {
  const preventScroll = (e: WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
      e.preventDefault();
    }
  };
  
  document.addEventListener('wheel', preventScroll, { passive: false });
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CajaProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/punto-venta" element={<PuntoVenta />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/masivos" element={<ProductosMasivos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
            <Route path="/cuentas-por-pagar" element={<CuentasPorPagar />} />
            <Route path="/cajas" element={<Cajas />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path='/categoria-unidad' element={<CategoriaTipo />} />
          </Routes>
        </Layout>
      </HashRouter>
      <Toaster />
    </CajaProvider>
  </React.StrictMode>
);