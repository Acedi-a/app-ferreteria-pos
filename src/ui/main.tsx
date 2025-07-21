import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import PuntoVenta from './pages/PuntoVenta';
import './main.css';
import Productos from './pages/Productos';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/punto-venta" element={<PuntoVenta />} />
          <Route path="/productos" element={<Productos />} />
        </Routes>
      </Layout>
    </HashRouter>
  </React.StrictMode>
);