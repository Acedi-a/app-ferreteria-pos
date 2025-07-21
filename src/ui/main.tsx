import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import PuntoVenta from './pages/PuntoVenta';
import './main.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/punto-venta" element={<PuntoVenta />} />
          {/* Añade más rutas aquí */}
        </Routes>
      </Layout>
    </HashRouter>
  </React.StrictMode>
);