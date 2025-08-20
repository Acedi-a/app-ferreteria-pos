// src/pages/CuentasPorCobrar.tsx
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/use-toast";

// Componentes
import CuentasPorCobrarStats from "../components/cuentas-por-cobrar/CuentasPorCobrarStats";
import CuentasPorCobrarFilters from "../components/cuentas-por-cobrar/CuentasPorCobrarFilters";
import CuentasPorCobrarTable from "../components/cuentas-por-cobrar/CuentasPorCobrarTable";
import PagosRecientesTable from "../components/cuentas-por-cobrar/PagosRecientesTable";
import RegistrarPagoModal from "../components/cuentas-por-cobrar/RegistrarPagoModal";
import { printPagoReceipt } from "../components/cuentas-por-cobrar/PaymentReceiptRenderer";
import CuentaDetalleModal from "../components/cuentas-por-cobrar/CuentaDetalleModal";

// Service y tipos
import {
  CuentasPorCobrarService,
  type CuentaPorCobrar,
  type PagoCuenta,
  type FiltrosCuentasPorCobrar,
  type EstadisticasCuentasPorCobrar,
  type RegistrarPagoData
} from "../services/cuentas-por-cobrar-service";

export default function CuentasPorCobrar() {
  const { toast } = useToast();

  // Estados principales
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
  const [pagosRecientes, setPagosRecientes] = useState<PagoCuenta[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCuentasPorCobrar | null>(null);
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingRegistrarPago, setLoadingRegistrarPago] = useState(false);

  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosCuentasPorCobrar>({
    estado: '',
    vencimiento: 'todos'
  });

  // Estados para modales
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaPorCobrar | null>(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar cuentas cuando cambien los filtros
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
      const cuentasData = await CuentasPorCobrarService.obtenerCuentasPorCobrar(filtros, 100);
      setCuentas(cuentasData);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuentas por cobrar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      const stats = await CuentasPorCobrarService.obtenerEstadisticas();
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
      const pagos = await CuentasPorCobrarService.obtenerPagosRecientes(10);
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

  const handleVerDetalles = (cuenta: CuentaPorCobrar) => {
    setCuentaSeleccionada(cuenta);
    setModalDetalleAbierto(true);
  };

  const handleRegistrarPago = (cuenta: CuentaPorCobrar) => {
    setCuentaSeleccionada(cuenta);
    setModalPagoAbierto(true);
  };

  const handleConfirmarPago = async (datos: RegistrarPagoData) => {
    try {
      setLoadingRegistrarPago(true);
      
      const resultado = await CuentasPorCobrarService.registrarPago(datos);
      
      if (resultado.success) {
        toast({
          title: "Pago registrado",
          description: `El pago de Bs ${datos.monto.toFixed(2)} ha sido registrado exitosamente`
        });
        
        // Cerrar modal y recargar datos
        setModalPagoAbierto(false);
        setCuentaSeleccionada(null);
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error; // Re-lanzar para que el modal maneje el error
    } finally {
      setLoadingRegistrarPago(false);
    }
  };

  const handleImprimir = async (cuenta: CuentaPorCobrar) => {
    try {
      // Preguntar si desea incluir historial
      const incluir = window.confirm('¿Incluir historial de pagos en el recibo?');
      let historial = undefined;
      if (incluir) {
        try { historial = await CuentasPorCobrarService.obtenerHistoricoPagos(cuenta.id); } catch {}
      }
      const res = await printPagoReceipt(cuenta, undefined, { mostrarHistorial: incluir, historial });
      if (res?.ok) {
        toast({ title: 'Recibo enviado', description: `Cuenta #${cuenta.id}` });
      } else {
        toast({ title: 'No se pudo imprimir', description: res?.error || 'Revise la impresora en Configuración', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Error al imprimir', description: String(e), variant: 'destructive' });
    }
  };

  const handleExportarReporte = () => {
    toast({
      title: "Exportando reporte",
      description: "Generando archivo Excel con todas las cuentas por cobrar..."
    });
    // Aquí se implementaría la lógica de exportación
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cuentas por Cobrar</h1>
              <p className="text-sm text-gray-600">
                Gestiona los créditos y pagos de tus clientes
              </p>
            </div>
            <Button onClick={handleExportarReporte} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas */}
        <CuentasPorCobrarStats 
          estadisticas={estadisticas || {
            totalPorCobrar: 0,
            totalVencido: 0,
            cantidadPendientes: 0,
            cantidadVencidas: 0,
            cantidadPagadas: 0,
            promedioTiempoCobranza: 0,
            clientesConDeuda: 0
          }}
          loading={loadingStats}
        />

        {/* Filtros */}
        <CuentasPorCobrarFilters
          filtros={filtros}
          onCambiarFiltros={setFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Tabla de cuentas por cobrar */}
        <div className="mb-6">
          <CuentasPorCobrarTable
            cuentas={cuentas}
            loading={loading}
            onVerDetalles={handleVerDetalles}
            onRegistrarPago={handleRegistrarPago}
            onImprimir={handleImprimir}
          />
        </div>

        {/* Pagos recientes */}
        <PagosRecientesTable 
          pagos={pagosRecientes}
          loading={loadingPagos}
        />

        {/* Modal de registro de pago */}
        <RegistrarPagoModal
          cuenta={cuentaSeleccionada}
          isOpen={modalPagoAbierto}
          onClose={cerrarModalPago}
          onConfirm={handleConfirmarPago}
          loading={loadingRegistrarPago}
        />

        {/* Modal de detalles */}
        <CuentaDetalleModal
          cuenta={cuentaSeleccionada}
          isOpen={modalDetalleAbierto}
          onClose={cerrarModalDetalle}
          onImprimir={() => cuentaSeleccionada && handleImprimir(cuentaSeleccionada)}
        />
      </div>
    </div>
  );
}
