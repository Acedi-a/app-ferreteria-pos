// src/pages/Ventas.tsx
import { useState, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import VentasStats from "../components/ventas/VentasStats";
import VentasTable from "../components/ventas/VentasTable";
import VentasFilters from "../components/ventas/VentasFilters";
import VentaDetalleModal from "../components/ventas/VentaDetalleModal";
import CancelarVentaModal from "../components/ventas/CancelarVentaModal";
import { VentasService } from "../services/ventas-service";
import { printTicket } from "../components/ventas/TicketRenderer";
import type { Venta, VentaDetalle, FiltrosVenta } from "../services/ventas-service";
import { getBoliviaDateString, getBoliviaDateDaysAgo } from "../lib/utils";

export default function Ventas() {
  const { toast } = useToast();
  
  // Estados principales
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Estados para filtros (zona horaria de Bolivia)
  const [filtros, setFiltros] = useState<FiltrosVenta>({
    fechaInicio: getBoliviaDateDaysAgo(30),
    fechaFin: getBoliviaDateString()
  });
  
  // Estados para el modal de detalles
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [detallesVenta, setDetallesVenta] = useState<VentaDetalle[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  
  // Estados para el modal de cancelación
  const [isCancelarModalOpen, setIsCancelarModalOpen] = useState(false);
  const [ventaACancelar, setVentaACancelar] = useState<Venta | null>(null);
  const [cancelandoVenta, setCancellandoVenta] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
    cargarEstadisticas();
  }, []);

  // Cargar ventas cuando cambien los filtros
  useEffect(() => {
    cargarVentas();
  }, [filtros]);

  const cargarDatos = async () => {
    await Promise.all([cargarVentas(), cargarEstadisticas()]);
  };

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const ventasData = await VentasService.obtenerVentas(filtros, 100);
      setVentas(ventasData);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      const statsData = await VentasService.obtenerEstadisticasVentas();
      setEstadisticas(statsData);
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

  const verDetallesVenta = async (venta: Venta) => {
    try {
      setVentaSeleccionada(venta);
      setModalAbierto(true);
      setLoadingDetalles(true);
      
      const detalles = await VentasService.obtenerDetallesVenta(venta.id);
      setDetallesVenta(detalles);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la venta",
        variant: "destructive"
      });
    } finally {
      setLoadingDetalles(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVentaSeleccionada(null);
    setDetallesVenta([]);
  };

  const cancelarVenta = async (venta: Venta) => {
    setVentaACancelar(venta);
    setIsCancelarModalOpen(true);
  };

  const confirmarCancelacion = async (motivo: string) => {
    if (!ventaACancelar) return;

    try {
      setCancellandoVenta(true);
      await VentasService.cancelarVenta(ventaACancelar.id, motivo);
      
      toast({
        title: "Venta cancelada",
        description: `La venta ${ventaACancelar.numero_venta} ha sido cancelada`
      });
      
      // Recargar datos
      await cargarDatos();
      
      // Cerrar modal
      setIsCancelarModalOpen(false);
      setVentaACancelar(null);
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la venta",
        variant: "destructive"
      });
    } finally {
      setCancellandoVenta(false);
    }
  };

  const cerrarModalCancelacion = () => {
    setIsCancelarModalOpen(false);
    setVentaACancelar(null);
  };

  const imprimirTicket = async (venta: Venta) => {
    try {
      const detalles = await VentasService.obtenerDetallesVenta(venta.id);
      const res = await printTicket(venta, detalles);
      if (!res.ok) {
        throw new Error(res.error || 'Error de impresión');
      }
      toast({ title: "Ticket enviado", description: `Venta ${venta.numero_venta}` });
    } catch (e: any) {
      toast({ title: "Error al imprimir", description: e?.message || String(e), variant: 'destructive' });
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: getBoliviaDateDaysAgo(30),
      fechaFin: getBoliviaDateString()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
              <p className="text-sm text-gray-600">
                Visualiza y gestiona todas las ventas realizadas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas */}
        <VentasStats 
          estadisticas={estadisticas || {
            ventasHoy: { cantidad: 0, total: 0 },
            ventasSemana: { cantidad: 0, total: 0 },
            ventasMes: { cantidad: 0, total: 0 },
            topProductos: []
          }}
          loading={loadingStats}
        />

        {/* Filtros */}
        <VentasFilters
          filtros={filtros}
          onCambiarFiltros={setFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Tabla de ventas */}
        <VentasTable
          ventas={ventas}
          loading={loading}
          onVerDetalles={verDetallesVenta}
          onCancelarVenta={cancelarVenta}
          onImprimirTicket={imprimirTicket}
        />

        {/* Modal de detalles */}
        <VentaDetalleModal
          venta={ventaSeleccionada}
          detalles={detallesVenta}
          isOpen={modalAbierto}
          onClose={cerrarModal}
          loading={loadingDetalles}
          onImprimir={() => ventaSeleccionada && imprimirTicket(ventaSeleccionada)}
        />

        {/* Modal de cancelación */}
        <CancelarVentaModal
           venta={ventaACancelar}
           isOpen={isCancelarModalOpen}
           onClose={cerrarModalCancelacion}
           onConfirm={confirmarCancelacion}
           loading={cancelandoVenta}
         />
      </div>
    </div>
  );
}
