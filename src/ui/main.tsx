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
import Configuracion from './pages/Configuracion';
import CategoriaTipo from './pages/CategoriaTipo';
import { Toaster } from "./components/ui/toaster";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path='/categoria-unidad' element={<CategoriaTipo />} />
        </Routes>
      </Layout>
    </HashRouter>
    <Toaster />
  </React.StrictMode>
);