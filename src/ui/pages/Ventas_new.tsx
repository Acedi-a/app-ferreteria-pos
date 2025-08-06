// src/pages/Ventas.tsx
import { useState, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import VentasStats from "../components/ventas/VentasStats";
import VentasTable from "../components/ventas/VentasTable";
import VentasFilters from "../components/ventas/VentasFilters";
import VentaDetalleModal from "../components/ventas/VentaDetalleModal";
import { VentasService } from "../services/ventas-service";
import type { Venta, VentaDetalle, FiltrosVenta } from "../services/ventas-service";

export default function Ventas() {
  const { toast } = useToast();
  
  // Estados principales
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosVenta>({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0]
  });
  
  // Estados para el modal de detalles
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [detallesVenta, setDetallesVenta] = useState<VentaDetalle[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

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
    if (!confirm(`¿Está seguro de cancelar la venta ${venta.numero_venta}?`)) {
      return;
    }

    try {
      const motivo = prompt('Motivo de cancelación (opcional):') || 'Cancelación manual';
      await VentasService.cancelarVenta(venta.id, motivo);
      
      toast({
        title: "Venta cancelada",
        description: `La venta ${venta.numero_venta} ha sido cancelada`
      });
      
      // Recargar datos
      await cargarDatos();
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la venta",
        variant: "destructive"
      });
    }
  };

  const imprimirTicket = (venta: Venta) => {
    toast({
      title: "Imprimiendo ticket",
      description: `Enviando ticket de la venta ${venta.numero_venta} a la impresora...`
    });
    // Aquí se implementaría la lógica de impresión
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0]
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
      </div>
    </div>
  );
}
