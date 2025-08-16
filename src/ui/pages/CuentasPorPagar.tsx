// src/pages/CuentasPorPagar.tsx
import { useState, useEffect } from "react";
import { Download, PlusCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/use-toast";

// Reuse the same styled components but new ones for pagar
import CuentasPorPagarStats from "../components/cuentas-por-pagar/CuentasPorPagarStats";
import CuentasPorPagarFilters from "../components/cuentas-por-pagar/CuentasPorPagarFilters";
import CuentasPorPagarTable from "../components/cuentas-por-pagar/CuentasPorPagarTable";
import PagosProveedoresTable from "../components/cuentas-por-pagar/PagosProveedoresTable";
import RegistrarPagoProveedorModal from "../components/cuentas-por-pagar/RegistrarPagoProveedorModal";
import CuentaPorPagarDetalleModal from "../components/cuentas-por-pagar/CuentaPorPagarDetalleModal";
import RegistrarDeudaModal, { type NuevaCuentaPorPagarFormData } from "../components/cuentas-por-pagar/RegistrarDeudaModal";

import {
  CuentasPorPagarService,
  type CuentaPorPagar,
  type PagoProveedor,
  type FiltrosCuentasPorPagar,
  type EstadisticasCuentasPorPagar,
  type RegistrarPagoProveedorData
} from "../services/cuentas-por-pagar-service";
import { ProveedoresService } from "../services/proveedores-service";

export default function CuentasPorPagar() {
  const { toast } = useToast();

  // Estados principales
  const [cuentas, setCuentas] = useState<CuentaPorPagar[]>([]);
  const [pagosRecientes, setPagosRecientes] = useState<PagoProveedor[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCuentasPorPagar | null>(null);
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingRegistrarPago, setLoadingRegistrarPago] = useState(false);
  const [loadingRegistrarDeuda, setLoadingRegistrarDeuda] = useState(false);

  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosCuentasPorPagar>({
    estado: '',
    vencimiento: 'todos'
  });

  // Estados para modales
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaPorPagar | null>(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalDeudaAbierto, setModalDeudaAbierto] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarCuentas();
  }, [filtros]);

  const cargarDatos = async () => {
    await Promise.all([
      cargarCuentas(),
      cargarEstadisticas(),
      cargarPagosRecientes()
    ]);
  };

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const cuentasData = await CuentasPorPagarService.obtenerCuentasPorPagar(filtros, 100);
      setCuentas(cuentasData);
    } catch (error) {
      console.error('Error al cargar cuentas por pagar:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuentas por pagar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      const stats = await CuentasPorPagarService.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const cargarPagosRecientes = async () => {
    try {
      setLoadingPagos(true);
      const pagos = await CuentasPorPagarService.obtenerPagosRecientes(10);
      setPagosRecientes(pagos);
    } catch (error) {
      console.error('Error al cargar pagos recientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos recientes",
        variant: "destructive"
      });
    } finally {
      setLoadingPagos(false);
    }
  };

  const handleVerDetalles = (cuenta: CuentaPorPagar) => {
    setCuentaSeleccionada(cuenta);
    setModalDetalleAbierto(true);
  };

  const handleRegistrarPago = (cuenta: CuentaPorPagar) => {
    setCuentaSeleccionada(cuenta);
    setModalPagoAbierto(true);
  };

  const handleConfirmarPago = async (datos: RegistrarPagoProveedorData) => {
    try {
      setLoadingRegistrarPago(true);
      const resultado = await CuentasPorPagarService.registrarPago(datos);
      if (resultado.success) {
        toast({
          title: "Pago registrado",
          description: `El pago de Bs ${datos.monto.toFixed(2)} ha sido registrado exitosamente`
        });
        setModalPagoAbierto(false);
        setCuentaSeleccionada(null);
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    } finally {
      setLoadingRegistrarPago(false);
    }
  };

  const handleImprimir = (cuenta: CuentaPorPagar) => {
    toast({
      title: "Imprimiendo",
      description: `Generando reporte de la cuenta ${cuenta.id}...`
    });
  };

  const handleExportarReporte = () => {
    toast({
      title: "Exportando reporte",
      description: "Generando archivo Excel con todas las cuentas por pagar..."
    });
  };

  const abrirModalDeuda = () => setModalDeudaAbierto(true);
  const cerrarModalDeuda = () => setModalDeudaAbierto(false);

  const handleConfirmarDeuda = async (datos: NuevaCuentaPorPagarFormData) => {
    try {
      setLoadingRegistrarDeuda(true);

      // Asegurar proveedor
      let proveedorId = datos.proveedor_id;
      if (!proveedorId && datos.nuevo_proveedor_nombre) {
        const codigo = await ProveedoresService.generarCodigo();
        proveedorId = await ProveedoresService.crear({
          codigo,
          nombre: datos.nuevo_proveedor_nombre,
          activo: true,
          contacto: '',
          telefono: '',
          email: '',
          direccion: '',
          ciudad: '',
          documento: ''
        });
      }

      if (!proveedorId) {
        throw new Error('No se pudo determinar el proveedor.');
      }

      const res = await CuentasPorPagarService.crearCuentaPorPagar({
        proveedor_id: proveedorId,
        monto: datos.monto,
        fecha_vencimiento: datos.fecha_vencimiento,
        observaciones: datos.observaciones
      });

      if (res.success) {
        toast({
          title: "Deuda registrada",
          description: `Se creó una nueva cuenta por pagar por Bs ${datos.monto.toFixed(2)}.`
        });
        cerrarModalDeuda();
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error al registrar deuda:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la deuda. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoadingRegistrarDeuda(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      vencimiento: 'todos'
    });
  };

  const cerrarModalPago = () => {
    setModalPagoAbierto(false);
    setCuentaSeleccionada(null);
  };

  const cerrarModalDetalle = () => {
    setModalDetalleAbierto(false);
    setCuentaSeleccionada(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cuentas por Pagar</h1>
              <p className="text-sm text-gray-600">
                Gestiona tus obligaciones con proveedores
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={abrirModalDeuda} className="bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Deuda
              </Button>
              <Button onClick={handleExportarReporte} className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Exportar Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CuentasPorPagarStats 
          estadisticas={estadisticas || {
            totalPorPagar: 0,
            totalVencido: 0,
            cantidadPendientes: 0,
            cantidadVencidas: 0,
            cantidadPagadas: 0,
            promedioTiempoPago: 0,
            proveedoresConDeuda: 0
          }}
          loading={loadingStats}
        />

        <CuentasPorPagarFilters
          filtros={filtros}
          onCambiarFiltros={setFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        <div className="mb-6">
          <CuentasPorPagarTable
            cuentas={cuentas}
            loading={loading}
            onVerDetalles={handleVerDetalles}
            onRegistrarPago={handleRegistrarPago}
            onImprimir={handleImprimir}
          />
        </div>

        <PagosProveedoresTable 
          pagos={pagosRecientes}
          loading={loadingPagos}
        />
        <RegistrarPagoProveedorModal
          cuenta={cuentaSeleccionada}
          isOpen={modalPagoAbierto}
          onClose={cerrarModalPago}
          onConfirm={handleConfirmarPago}
          loading={loadingRegistrarPago}
        />

        <CuentaPorPagarDetalleModal
          cuenta={cuentaSeleccionada}
          isOpen={modalDetalleAbierto}
          onClose={cerrarModalDetalle}
          onImprimir={() => cuentaSeleccionada && handleImprimir(cuentaSeleccionada)}
        />

        <RegistrarDeudaModal
          isOpen={modalDeudaAbierto}
          onClose={cerrarModalDeuda}
          onConfirm={handleConfirmarDeuda}
          loading={loadingRegistrarDeuda}
        />
      </div>
    </div>
  );
}