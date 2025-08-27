// src/ui/pages/Cajas.tsx
import { useEffect, useState } from 'react';
import { 
  Plus, Minus, Lock, Unlock, History, DollarSign, RefreshCcw, Eye, Pencil, Trash2, Edit, 
  ShoppingCart, X, CreditCard, Banknote, Smartphone, AlertCircle, CheckCircle, Clock, BarChart3,
  PieChart, Receipt, Wallet, ArrowUpRight, ArrowDownRight, FileText, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/use-toast';
import CajasService, { 
  type Caja, 
  type ResumenCaja, 
  type CajaTransaccion, 
  // type AuditoriaCaja, // No utilizada
  type MovimientoCaja 
} from '../services/cajas-service';
import { VentasService, type VentaDetalle } from '../services/ventas-service';
import EditarVentaModal from '../components/modals/EditarVentaModal';
import NuevaVentaModal from '../components/modals/NuevaVentaModal';
import CancelarVentaModal from '../components/modals/CancelarVentaModal';
import { useCaja } from '../contexts/CajaContext';

function currency(n: number | undefined | null) { 
  if (n === undefined || n === null || isNaN(n)) return 'Bs 0.00';
  return `Bs ${n.toFixed(2)}`; 
}

interface KPI {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
  color: string;
  tendencia?: { valor: number; positiva: boolean };
}

export default function Cajas() {
  const { toast } = useToast();
  const { refreshCaja } = useCaja();
  const [loading, setLoading] = useState(true);
  const [cajaActiva, setCajaActiva] = useState<Caja | null>(null);
  const [resumen, setResumen] = useState<ResumenCaja | null>(null);
  const [transacciones, setTransacciones] = useState<CajaTransaccion[]>([]);
  // const [auditoria, setAuditoria] = useState<AuditoriaCaja[]>([]); // Variable no utilizada

  // Estados para navegación
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'movimientos'>('dashboard');
  const [cajasHistoricas, setCajasHistoricas] = useState<Caja[]>([]);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);
  const [resumenSeleccionada, setResumenSeleccionada] = useState<ResumenCaja | null>(null);
  const [transaccionesSeleccionada, setTransaccionesSeleccionada] = useState<CajaTransaccion[]>([]);
  // const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState<AuditoriaCaja[]>([]); // Variable no utilizada
  const [modoVistaCompleta, setModoVistaCompleta] = useState(false);

  // Estados para filtros y búsqueda


  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');

  // Estados para modales
  const [modalApertura, setModalApertura] = useState(false);
  const [montoInicial, setMontoInicial] = useState<string>('0');
  const [observacionesApertura, setObservacionesApertura] = useState<string>('');
  const [modalMovimiento, setModalMovimiento] = useState<null | ('ingreso' | 'egreso' | 'ajuste')>(null);
  const [movMonto, setMovMonto] = useState<string>('');
  const [movConcepto, setMovConcepto] = useState<string>('');
  const [movMetodoPago, setMovMetodoPago] = useState<string>('efectivo');
  const [modalCierre, setModalCierre] = useState(false);
  const [observacionesCierre, setObservacionesCierre] = useState<string>('');
  // Estados de arqueo eliminados

  // Estados para ventas
  const [modalNuevaVenta, setModalNuevaVenta] = useState(false);
  const [modalEditarVenta, setModalEditarVenta] = useState(false);
  const [modalCancelarVenta, setModalCancelarVenta] = useState(false);
  const [ventaIdEditando, setVentaIdEditando] = useState<number | null>(null);
  const [ventaIdCancelando, setVentaIdCancelando] = useState<number | null>(null);

  // Estados para reapertura
  const [modalReapertura, setModalReapertura] = useState(false);
  const [cajaIdReabriendo, setCajaIdReabriendo] = useState<number | null>(null);

  // Estados para resumen financiero
  const [modalResumenFinanciero, setModalResumenFinanciero] = useState(false);
  const [cajaResumenFinanciero, setCajaResumenFinanciero] = useState<Caja | null>(null);
  const [resumenFinanciero, setResumenFinanciero] = useState<ResumenCaja | null>(null);

  // Estados para detalles de productos vendidos
  const [detallesVentasExpandidas, setDetallesVentasExpandidas] = useState<Set<number>>(new Set());
  const [detallesProductos, setDetallesProductos] = useState<Map<number, VentaDetalle[]>>(new Map());
  const [cargandoDetalles, setCargandoDetalles] = useState<Set<number>>(new Set());

  // Variable derivada para el resumen actual
  const resumenActual = modoVistaCompleta ? resumenSeleccionada : resumen;

  const cargar = async () => {
    try {
      setLoading(true);
      
      // Limpiar todos los estados antes de cargar nuevos datos
      setCajaSeleccionada(null);
      setResumenSeleccionada(null);
      setTransaccionesSeleccionada([]);
      setModalResumenFinanciero(false);
      setModalReapertura(false);
      setCajaIdReabriendo(null);
      setCajaResumenFinanciero(null);
      setResumenFinanciero(null);
      
      // Mock data for browser testing when ElectronAPI is not available
      if (typeof window !== 'undefined' && !(window as any).electronAPI) {
        console.log('Using mock data for cajas historicas');
        const mockCajasHistoricas = [
          {
            id: 1,
            fecha_apertura: '2025-08-25T18:04:30.000Z',
            fecha_cierre: '2025-08-25T18:04:33.000Z',
            usuario: 'admin',
            monto_inicial: 1000,
            estado: 'cerrada' as const,
            saldo_final: 1500
          },
          {
            id: 2,
            fecha_apertura: '2025-08-24T10:00:00.000Z',
            fecha_cierre: '2025-08-24T18:00:00.000Z',
            usuario: 'admin',
            monto_inicial: 800,
            estado: 'cerrada' as const,
            saldo_final: 1200
          }
        ];
        setCajaActiva(null);
        setCajasHistoricas(mockCajasHistoricas);
        setResumen(null);
        setTransacciones([]);
        setLoading(false);
        return;
      }
      
      const [activa, historicas] = await Promise.all([
        CajasService.getCajaActiva(),
        CajasService.listarCajas({ limite: 50 })
      ]);
      setCajaActiva(activa);
      setCajasHistoricas(historicas);
      
      if (activa) {
        const [res, trans] = await Promise.all([
          CajasService.getResumenCaja(activa.id),
          CajasService.getTransaccionesCaja(activa.id)
          // CajasService.getAuditoriaCaja(activa.id) // No utilizada
        ]);        console.log('Resumen de caja obtenido:', res);        setResumen(res);        setTransacciones(trans);        // setAuditoria(audit); // Variable comentada
      } else {
        setResumen(null);
        setTransacciones([]);
        // setAuditoria([]); // Variable comentada
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message || 'No se pudo cargar cajas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const cargarCajaHistorica = async (caja: Caja) => {
    try {
      setCajaSeleccionada(caja);
      const [res, trans] = await Promise.all([
        CajasService.getResumenCaja(caja.id),
        CajasService.getTransaccionesCaja(caja.id)
        // CajasService.getAuditoriaCaja(caja.id) // No utilizada
      ]);
      setResumenSeleccionada(res);
      setTransaccionesSeleccionada(trans);
      // setAuditoriaSeleccionada(audit); // Variable comentada
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message || 'No se pudo cargar la caja histórica', variant: 'destructive' });
    }
  };

  // const verCajaHistoricaCompleta = async (caja: Caja) => {
  //   await cargarCajaHistorica(caja);
  //   setModoVistaCompleta(true);
  //   setVistaActual('dashboard');
  // }; // Función no utilizada

  const volverAlHistorial = () => {
    setModoVistaCompleta(false);
    setCajaSeleccionada(null);
    setResumenSeleccionada(null);
    setTransaccionesSeleccionada([]);
    // setAuditoriaSeleccionada([]); // Variable comentada
    setVistaActual('dashboard');
  };

  const mostrarResumenFinanciero = async (caja: Caja) => {
    console.log('mostrarResumenFinanciero called with caja:', caja);
    console.log('Current modalResumenFinanciero state:', modalResumenFinanciero);
    try {
      // Mock data for browser testing when ElectronAPI is not available
      if (typeof window !== 'undefined' && !(window as any).electronAPI) {
        console.log('Using mock data for browser testing');
        const mockResumen = {
          caja_id: caja.id,
          fecha_apertura: caja.fecha_apertura,
          fecha_cierre: caja.fecha_cierre,
          usuario: caja.usuario,
          estado: caja.estado,
          monto_inicial: 1000,
          saldo_final_calculado: 1900,
          total_ingresos: 1000,
          total_egresos: 100,
          total_ajustes: 0,
          ventas_efectivo: 500,
          ventas_tarjeta: 300,
          ventas_transferencia: 200,
          ventas_mixto: 0,
          total_ventas: 1000,
          ganancia_perdida: 900,
          cobros_cxc_efectivo: 0,
          total_gastos: 100,
          total_pagos_proveedores: 0,
          efectivo_disponible: 500,
          total_recibido: 1000,
          diferencia_esperada: 0,
          porcentaje_efectivo: 50,
          porcentaje_digital: 50
        };
        setCajaResumenFinanciero(caja);
        setResumenFinanciero(mockResumen);
        console.log('Setting modalResumenFinanciero to true');
        setModalResumenFinanciero(true);
        console.log('modalResumenFinanciero should now be:', true);
        return;
      }
      
      const resumen = await CajasService.resumenFinanciero(caja.id);
      console.log('resumen financiero loaded:', resumen);
      setCajaResumenFinanciero(caja);
      setResumenFinanciero(resumen);
      setModalResumenFinanciero(true);
    } catch (e: any) {
      console.error('Error loading resumen financiero:', e);
      toast({ title: 'Error', description: e.message || 'No se pudo cargar el resumen financiero', variant: 'destructive' });
    }
  };

  const generarKPIs = (): KPI[] => {
    if (!resumenActual) return [];
    
    return [
      {
        titulo: 'Saldo Inicial',
        valor: modoVistaCompleta ? cajaSeleccionada?.monto_inicial || 0 : cajaActiva?.monto_inicial || 0,
        icono: <DollarSign className="h-5 w-5" />,
        color: 'text-green-600'
      },
      {
        titulo: 'Venta Total de Caja',
        valor: resumenActual.total_ventas || 0,
        icono: <ShoppingCart className="h-5 w-5" />,
        color: 'text-blue-600',
        tendencia: { valor: 12.5, positiva: true }
      },
      {
        titulo: 'Ganancia/Pérdida',
        valor: resumenActual.ganancia_perdida || 0,
        icono: <TrendingUp className="h-5 w-5" />,
        color: resumenActual.ganancia_perdida >= 0 ? 'text-green-600' : 'text-red-600'
      },
      {
        titulo: 'Saldo Final',
        valor: resumenActual.saldo_final_calculado || 0,
        icono: <Wallet className="h-5 w-5" />,
        color: 'text-orange-600'
      }
    ];
  };

  // Función para filtrar cajas históricas
  const cajasFiltradas = cajasHistoricas.filter(caja => {
    // Filtro por texto (ID o usuario)
    const coincideTexto = true;
    
    // Filtro por estado
    const coincideEstado = true;
    
    // Filtro por fecha
    const fechaCaja = new Date(caja.fecha_apertura);
    const coincideFechaDesde = filtroFechaDesde === '' || fechaCaja >= new Date(filtroFechaDesde);
    const coincideFechaHasta = filtroFechaHasta === '' || fechaCaja <= new Date(filtroFechaHasta + 'T23:59:59');
    
    return coincideTexto && coincideEstado && coincideFechaDesde && coincideFechaHasta;
  });

  useEffect(() => { void cargar(); }, []);

  const abrirCaja = async () => {
    try {
      const monto = parseFloat(montoInicial || '0') || 0;
      const resultado = await CajasService.abrirCaja(
        monto, 
        'admin',
        observacionesApertura || 'Apertura de caja'
      );
      
      if (resultado.exito) {
        // Limpiar estados antes de cargar
        setModalApertura(false);
        setMontoInicial('0');
        setObservacionesApertura('');
        setCajaSeleccionada(null);
        setResumenSeleccionada(null);
        setTransaccionesSeleccionada([]);
        setModalResumenFinanciero(false);
        setModalReapertura(false);
        setCajaIdReabriendo(null);
        setCajaResumenFinanciero(null);
        setResumenFinanciero(null);
        
        toast({ title: 'Caja abierta', description: `Saldo inicial ${currency(monto)}` });
        await cargar();
        await refreshCaja(); // Notificar cambio de caja
      } else {
        toast({ title: 'Error', description: resultado.mensaje, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'No se pudo abrir la caja', variant: 'destructive' });
    }
  };

  const registrarMovimiento = async () => {
    if (!cajaActiva || !modalMovimiento) return;
    try {
      const monto = parseFloat(movMonto || '0');
      if (!(monto > 0)) throw new Error('El monto debe ser mayor que 0');
      
      const movimiento: MovimientoCaja = {
        tipo: modalMovimiento,
        monto,
        concepto: movConcepto || `${modalMovimiento.charAt(0).toUpperCase() + modalMovimiento.slice(1)} manual`,
        usuario: 'admin'
      };
      
      const resultado = await CajasService.registrarMovimiento(movimiento);
      
      if (resultado.exito) {
        toast({ 
          title: 'Movimiento registrado', 
          description: `${modalMovimiento.charAt(0).toUpperCase() + modalMovimiento.slice(1)} de ${currency(monto)}` 
        });
        setModalMovimiento(null);
        setMovMonto('');
        setMovConcepto('');
        await cargar();
      } else {
        toast({ title: 'Error', description: resultado.mensaje, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'No se pudo registrar movimiento', variant: 'destructive' });
    }
  };

  const cerrarCaja = async () => {
    if (!cajaActiva) return;
    try {
      const resultado = await CajasService.cerrarCaja(
        'admin',
        observacionesCierre || 'Cierre de caja'
      );
      
      if (resultado.exito) {
        toast({ title: 'Caja cerrada', description: `Caja #${cajaActiva?.id} cerrada correctamente` });
        setModalCierre(false);
        setObservacionesCierre('');
        await cargar();
        await refreshCaja(); // Notificar cambio de caja
      } else {
        toast({ title: 'Error', description: resultado.mensaje, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'No se pudo cerrar la caja', variant: 'destructive' });
    }
  };

  const solicitarReapertura = (cajaId: number) => {
    console.log('solicitarReapertura called with cajaId:', cajaId);
    console.log('Current modalReapertura state:', modalReapertura);
    
    // Mock behavior for browser testing when ElectronAPI is not available
    if (typeof window !== 'undefined' && !(window as any).electronAPI) {
      console.log('Using mock behavior for reapertura');
      setCajaIdReabriendo(cajaId);
      console.log('Setting modalReapertura to true');
      setModalReapertura(true);
      console.log('modalReapertura should now be:', true);
      return;
    }
    
    setCajaIdReabriendo(cajaId);
    setModalReapertura(true);
  };

  const confirmarReapertura = async () => {
    if (!cajaIdReabriendo) return;
    
    try {
      // Mock behavior for browser testing when ElectronAPI is not available
      if (typeof window !== 'undefined' && !(window as any).electronAPI) {
        console.log('Using mock behavior for confirmar reapertura');
        toast({ 
          title: 'Caja reabierta (Mock)', 
          description: `Caja #${cajaIdReabriendo} reabierta exitosamente (simulación)`,
          variant: 'default'
        });
        setModalReapertura(false);
        setCajaIdReabriendo(null);
        await cargar();
        // Navegar a la vista de caja activa
        setModoVistaCompleta(false);
        return;
      }
      
      const resultado = await CajasService.reabrirCaja(
        cajaIdReabriendo,
        'admin',
        'Reabierta por corrección de error'
      );
      
      if (resultado.exito) {
        toast({ 
          title: 'Caja reabierta', 
          description: `Caja #${cajaIdReabriendo} reabierta exitosamente`,
          variant: 'default'
        });
        setModalReapertura(false);
        setCajaIdReabriendo(null);
        await cargar();
        await refreshCaja(); // Notificar cambio de caja
        // Navegar a la vista de caja activa
        setModoVistaCompleta(false);
      } else {
        toast({ 
          title: 'Error al reabrir', 
          description: resultado.mensaje, 
          variant: 'destructive' 
        });
      }
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e.message || 'No se pudo reabrir la caja', 
        variant: 'destructive' 
      });
    }
  };

  const cancelarReapertura = () => {
    setModalReapertura(false);
    setCajaIdReabriendo(null);
  };

  // Función calcularTotalFisico eliminada

  // Funciones de arqueo eliminadas

  // Funciones para ventas
  const abrirEditarVenta = (ventaId: number) => {
    setVentaIdEditando(ventaId);
    setModalEditarVenta(true);
  };

  const abrirCancelarVenta = (ventaId: number) => {
    setVentaIdCancelando(ventaId);
    setModalCancelarVenta(true);
  };

  const onVentaActualizada = async () => {
    await cargar();
  };

  const onVentaCreada = async () => {
    await cargar();
    setModalNuevaVenta(false);
    toast({ title: 'Venta creada exitosamente' });
  };

  const onVentaCancelada = async () => {
    await cargar();
    setModalCancelarVenta(false);
    setVentaIdCancelando(null);
    toast({ title: 'Venta cancelada exitosamente' });
  };

  // Función para cargar detalles de productos vendidos
  const cargarDetallesVenta = async (ventaId: number) => {
    if (detallesProductos.has(ventaId)) {
      return; // Ya están cargados
    }

    setCargandoDetalles(prev => new Set(prev).add(ventaId));
    
    try {
      const detalles = await VentasService.obtenerDetallesVenta(ventaId);
      setDetallesProductos(prev => new Map(prev).set(ventaId, detalles));
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles de la venta',
        variant: 'destructive'
      });
    } finally {
      setCargandoDetalles(prev => {
        const newSet = new Set(prev);
        newSet.delete(ventaId);
        return newSet;
      });
    }
  };

  // Función para alternar expansión de detalles de venta
  const toggleDetallesVenta = async (ventaId: number) => {
    const nuevasExpandidas = new Set(detallesVentasExpandidas);
    
    if (nuevasExpandidas.has(ventaId)) {
      nuevasExpandidas.delete(ventaId);
    } else {
      nuevasExpandidas.add(ventaId);
      await cargarDetallesVenta(ventaId);
    }
    
    setDetallesVentasExpandidas(nuevasExpandidas);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCcw className="h-5 w-5 animate-spin" />
          <span className="text-lg">Cargando sistema de caja...</span>
        </div>
      </div>
    );
  }

  if (!cajaActiva && !modoVistaCompleta) {
    return (
      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Caja</h1>
            <p className="text-gray-600 mt-1">Gestión profesional de caja y transacciones</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setModoVistaCompleta(true)} 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <History className="h-5 w-5 mr-2" /> Ver Historial
            </Button>
            <Button onClick={() => setModalApertura(true)} className="bg-green-600 hover:bg-green-700">
              <Unlock className="h-5 w-5 mr-2" /> Abrir Caja
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-6">
                <Lock className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay caja activa</h3>
                <p className="text-gray-500">Inicie una nueva sesión de caja para comenzar a operar</p>
              </div>
              <Button onClick={() => setModalApertura(true)} className="w-full bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Abrir Nueva Caja
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Últimas Cajas
                </div>
                <Button 
                  onClick={() => setModoVistaCompleta(true)} 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1"
                >
                  Ver todas
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cajasHistoricas.slice(0, 5).map((caja) => (
                  <div key={caja.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Caja #{caja.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(caja.fecha_apertura).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{currency(caja.saldo_final || 0)}</div>
                      <Badge variant={caja.estado === 'cerrada' ? 'default' : 'success'}>
                        {caja.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
                {cajasHistoricas.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No hay historial de cajas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de apertura */}
        <Dialog open={modalApertura} onOpenChange={setModalApertura}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                Abrir Nueva Caja
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Monto inicial en efectivo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Ingrese el monto inicial con el que abre la caja</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalApertura(false)}>Cancelar</Button>
              <Button onClick={abrirCaja} className="bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Abrir Caja
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Vista del historial cuando no hay caja activa pero está en modo vista completa
  if (!cajaActiva && modoVistaCompleta) {
    // Seleccionar automáticamente la primera caja histórica si existe y no hay ninguna seleccionada
    if (cajasFiltradas.length > 0 && !cajaSeleccionada) {
      cargarCajaHistorica(cajasFiltradas[0]);
    }
    // Mostrar modales si corresponden
    if (modalResumenFinanciero && cajaResumenFinanciero && resumenFinanciero) {
      return (
        <Dialog open={modalResumenFinanciero} onOpenChange={setModalResumenFinanciero}>
          <DialogContent className="max-w-2xl" onClose={() => setModalResumenFinanciero(false)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumen Financiero - Caja #{cajaResumenFinanciero?.id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <p className="text-sm text-gray-600">
                  Abierto {new Date(cajaResumenFinanciero.fecha_apertura).toLocaleDateString()} ({new Date(cajaResumenFinanciero.fecha_apertura).toLocaleTimeString()}) por {cajaResumenFinanciero.usuario}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ventas</span>
                  <span className="font-bold">{currency(resumenFinanciero.total_ventas || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Total de ventas</span>
                  <span className="font-bold">{currency(resumenFinanciero.total_ventas || 0)}</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Efectivo</span>
                    <span>{currency(resumenFinanciero.ventas_efectivo || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tarjeta</span>
                    <span>{currency(resumenFinanciero.ventas_tarjeta || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Transferencia</span>
                    <span>{currency(resumenFinanciero.ventas_transferencia || 0)}</span>
                  </div>
                  {(resumenFinanciero.ventas_tarjeta + resumenFinanciero.ventas_transferencia) > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Crédito</span>
                      <span>{currency((resumenFinanciero.ventas_tarjeta || 0) + (resumenFinanciero.ventas_transferencia || 0))}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Saldo inicial</span>
                    <span>{currency(resumenFinanciero.monto_inicial || 0)}</span>
                  </div>
                  {resumenFinanciero.total_egresos > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Egresos</span>
                      <span>-{currency(resumenFinanciero.total_egresos || 0)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t-2 border-black pt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Saldo Final</span>
                    <span className="font-bold">{currency(resumenFinanciero.saldo_final_calculado || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalResumenFinanciero(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    if (modalReapertura && cajaIdReabriendo) {
      return (
        <Dialog open={modalReapertura} onOpenChange={setModalReapertura}>
          <DialogContent className="sm:max-w-md" onClose={() => setModalReapertura(false)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Confirmar Reapertura de Caja
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>¿Está seguro de que desea reabrir la caja #{cajaIdReabriendo}?</strong>
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  {cajaActiva ? (
                    <>Esta acción cerrará automáticamente la caja activa actual (#{cajaActiva && typeof cajaActiva === 'object' && 'id' in cajaActiva ? (cajaActiva as any).id : 'N/A'}) y reabrirá la caja histórica seleccionada.</>
                  ) : (
                    <>Esta acción reabrirá la caja histórica seleccionada como caja activa.</>
                  )}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                La reapertura se registrará en el historial de auditoría para mantener la trazabilidad.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelarReapertura}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmarReapertura}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Confirmar Reapertura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Cajas</h1>
            <p className="text-gray-600 mt-1">Consulta y gestión del historial de cajas</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setModalApertura(true)} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Unlock className="h-4 w-4 mr-2" /> Abrir Nueva Caja
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setModoVistaCompleta(false)}
            >
              <History className="h-4 w-4 mr-2" /> Volver al Inicio
            </Button>
          </div>
        </div>

        {/* Vista de Cajas Históricas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Cajas Históricas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Cajas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="space-y-4 mb-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Desde:</label>
                    <Input
                      type="date"
                      value={filtroFechaDesde}
                      onChange={(e) => setFiltroFechaDesde(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Hasta:</label>
                    <Input
                      type="date"
                      value={filtroFechaHasta}
                      onChange={(e) => setFiltroFechaHasta(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFiltroFechaDesde('');
                        setFiltroFechaHasta('');
                      }}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cajasFiltradas.map((caja) => (
                  <div 
                    key={caja.id} 
                    className={`p-3 border rounded transition-colors ${
                      cajaSeleccionada?.id === caja.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer flex-1" onClick={() => cargarCajaHistorica(caja)}>
                        <div className="font-medium">Caja #{caja.id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(caja.fecha_apertura).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          Estado: {caja.estado}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="font-medium">{currency(caja.saldo_final || 0)}</div>
                          <div className="text-xs text-gray-500">
                            {caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleDateString() : 'Abierta'}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarResumenFinanciero(caja);
                          }}
                          className="ml-2"
                          title="Ver resumen financiero"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {caja.estado === 'cerrada' && (
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarReapertura(caja.id);
                            }}
                            className="ml-2 text-orange-600 hover:text-orange-700"
                            title="Reabrir caja"
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {cajasFiltradas.length === 0 && cajasHistoricas.length > 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No se encontraron cajas que coincidan con los filtros
                  </div>
                )}
                {cajasHistoricas.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No hay cajas históricas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detalle de Caja Seleccionada */}
          <Card>
            <CardHeader>
              <CardTitle>
                {cajaSeleccionada ? `Detalle Caja #${cajaSeleccionada.id}` : 'Seleccione una caja'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cajaSeleccionada && resumenSeleccionada ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Apertura:</span>
                      <div className="font-medium">{new Date(cajaSeleccionada.fecha_apertura).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Cierre:</span>
                      <div className="font-medium">
                        {cajaSeleccionada.fecha_cierre ? new Date(cajaSeleccionada.fecha_cierre).toLocaleString() : 'No cerrada'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Usuario:</span>
                      <div className="font-medium">{cajaSeleccionada.usuario || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <div className="font-medium capitalize">{cajaSeleccionada.estado}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{currency(resumenSeleccionada.total_ingresos)}</div>
                      <div className="text-sm text-gray-600">Total Ingresos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{currency(resumenSeleccionada.total_egresos)}</div>
                      <div className="text-sm text-gray-600">Total Egresos</div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4 border-t">
                    <div className="text-3xl font-bold text-blue-600">{currency(cajaSeleccionada.saldo_final || 0)}</div>
                    <div className="text-sm text-gray-600">Saldo Final</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Seleccione una caja para ver los detalles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de apertura */}
        <Dialog open={modalApertura} onOpenChange={setModalApertura}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                Abrir Nueva Caja
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Monto inicial</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Ingrese el monto inicial con el que abre la caja</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalApertura(false)}>Cancelar</Button>
              <Button onClick={abrirCaja} className="bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Abrir Caja
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {modoVistaCompleta && cajaSeleccionada ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Caja Histórica #{cajaSeleccionada.id}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={cajaSeleccionada.estado === 'abierta' ? 'default' : 'success'} 
                       className={cajaSeleccionada.estado === 'abierta' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {cajaSeleccionada.estado === 'abierta' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  {cajaSeleccionada.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                </Badge>
                <span className="text-sm text-gray-600">
                  Apertura: {new Date(cajaSeleccionada.fecha_apertura).toLocaleString()}
                </span>
                {cajaSeleccionada.fecha_cierre && (
                  <span className="text-sm text-gray-600">
                    Cierre: {new Date(cajaSeleccionada.fecha_cierre).toLocaleString()}
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  Usuario: {cajaSeleccionada.usuario || 'admin'}
                </span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Caja Activa #{cajaActiva?.id}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Abierta
                </Badge>
                <span className="text-sm text-gray-600">
                  Apertura: {cajaActiva?.fecha_apertura ? new Date(cajaActiva.fecha_apertura).toLocaleString() : 'N/A'}
                </span>
                <span className="text-sm text-gray-600">
                  Usuario: {cajaActiva?.usuario || 'admin'}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {modoVistaCompleta ? (
            <Button variant="outline" onClick={volverAlHistorial}>
              <History className="h-4 w-4 mr-2" /> Volver al Historial
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => cargar()}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Actualizar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setModalCierre(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Lock className="h-4 w-4 mr-2" /> Cerrar Caja
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {generarKPIs().map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900">{currency(kpi.valor)}</p>
                  {kpi.tendencia && (
                    <div className={`flex items-center mt-1 text-sm ${
                      kpi.tendencia.positiva ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.tendencia.positiva ? 
                        <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      }
                      {kpi.tendencia.valor}%
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${kpi.color}`}>
                  {kpi.icono}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={vistaActual} onValueChange={(value) => setVistaActual(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="movimientos" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Acciones Rápidas - Solo para caja activa */}
          {!modoVistaCompleta && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button onClick={() => setModalNuevaVenta(true)} className="h-16 flex-col">
                    <ShoppingCart className="h-5 w-5 mb-1" />
                    Nueva Venta
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setModalMovimiento('ingreso')} 
                    className="h-16 flex-col text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Plus className="h-5 w-5 mb-1" />
                    Ingreso
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setModalMovimiento('egreso')} 
                    className="h-16 flex-col text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Minus className="h-5 w-5 mb-1" />
                    Egreso
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setModalMovimiento('ajuste')} 
                    className="h-16 flex-col text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="h-5 w-5 mb-1" />
                    Ajuste
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métodos de Pago */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Desglose por Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Efectivo</span>
                    </div>
                    <span className="font-bold text-green-600">{currency(resumenActual?.ventas_efectivo || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Tarjeta</span>
                    </div>
                    <span className="font-bold text-blue-600">{currency(resumenActual?.ventas_tarjeta || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Transferencia</span>
                    </div>
                    <span className="font-bold text-purple-600">{currency(resumenActual?.ventas_transferencia || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Mixto</span>
                    </div>
                    <span className="font-bold text-orange-600">{currency(resumenActual?.ventas_mixto || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Saldo Inicial:</span>
                    <span className="font-medium">{currency(modoVistaCompleta ? cajaSeleccionada?.monto_inicial || 0 : cajaActiva?.monto_inicial)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Ventas:</span>
                    <span className="font-medium text-green-600">{currency(resumenActual?.total_ventas || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Ingresos Manuales:</span>
                    <span className="font-medium text-green-600">{currency((resumenActual?.total_ventas || 0) + (cajaActiva?.monto_inicial || 0))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Egresos:</span>
                    <span className="font-medium text-red-600">-{currency(resumenActual?.total_egresos || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                    <span className="font-semibold">Saldo Final:</span>
                    <span className="font-bold text-lg">{currency(resumenActual?.saldo_final_calculado || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {modoVistaCompleta ? `Transacciones - Caja Histórica #${cajaSeleccionada?.id}` : 'Transacciones de Caja'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(modoVistaCompleta ? transaccionesSeleccionada : transacciones).length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(modoVistaCompleta ? transaccionesSeleccionada : transacciones).map((t) => {
                      const esVenta = t.referencia?.startsWith('venta_');
                      const ventaId = esVenta ? parseInt(t.referencia!.replace('venta_', '')) : null;
                      const estaExpandida = ventaId ? detallesVentasExpandidas.has(ventaId) : false;
                      const detalles = ventaId ? detallesProductos.get(ventaId) || [] : [];
                      const cargando = ventaId ? cargandoDetalles.has(ventaId) : false;
                      
                      return (
                        <div key={t.id} className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                t.tipo === 'ingreso' ? 'bg-green-100 text-green-600' :
                                t.tipo === 'egreso' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {t.tipo === 'ingreso' ? <Plus className="h-4 w-4" /> :
                                 t.tipo === 'egreso' ? <Minus className="h-4 w-4" /> :
                                 <Edit className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {esVenta ? `Venta #${ventaId}` : t.concepto || 'Movimiento'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(t.fecha).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="default" className="text-xs">
                                    {t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}
                                  </Badge>
                                  {esVenta && ventaId && (
                                    <Button
                                      variant="ghost"
                                      onClick={() => toggleDetallesVenta(ventaId)}
                                      className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
                                    >
                                      {estaExpandida ? 'Ocultar productos' : 'Ver productos'}
                                      <ShoppingCart className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-lg ${
                                t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {t.tipo === 'ingreso' ? '+' : '-'}{currency(Math.abs(t.monto))}
                              </div>
                              {t.referencia && (
                                <div className="text-xs text-gray-500">{t.referencia}</div>
                              )}
                              {esVenta && ventaId && !modoVistaCompleta && (
                                <div className="flex gap-1 mt-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => abrirEditarVenta(ventaId)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => abrirCancelarVenta(ventaId)}
                                    className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Detalles de productos expandibles */}
                          {esVenta && ventaId && estaExpandida && (
                            <div className="border-t border-gray-200 p-4 bg-white">
                              {cargando ? (
                                <div className="flex items-center justify-center py-4">
                                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-sm text-gray-600">Cargando productos...</span>
                                </div>
                              ) : detalles.length > 0 ? (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">Productos vendidos:</h4>
                                  <div className="space-y-2">
                                    {detalles.map((detalle, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">{detalle.producto_nombre}</div>
                                          <div className="text-xs text-gray-500">ID: {detalle.producto_id}</div>
                                        </div>
                                        <div className="text-center px-3">
                                          <div className="font-medium">{detalle.cantidad}</div>
                                          <div className="text-xs text-gray-500">Cant.</div>
                                        </div>
                                        <div className="text-center px-3">
                                          <div className="font-medium">{currency(detalle.precio_unitario)}</div>
                                          <div className="text-xs text-gray-500">Precio</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-green-600">{currency(detalle.subtotal)}</div>
                                          <div className="text-xs text-gray-500">Subtotal</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">No se encontraron productos en esta venta</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay transacciones registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      ) : (
        <div className="space-y-6">
          {/* Vista de Cajas Históricas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Cajas Históricas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial de Cajas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="space-y-4 mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">Desde:</label>
                      <Input
                        type="date"
                        value={filtroFechaDesde}
                        onChange={(e) => setFiltroFechaDesde(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">Hasta:</label>
                      <Input
                        type="date"
                        value={filtroFechaHasta}
                        onChange={(e) => setFiltroFechaHasta(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                      

                          setFiltroFechaDesde('');
                          setFiltroFechaHasta('');
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cajasFiltradas.map((caja) => (
                    <div 
                      key={caja.id} 
                      className={`p-3 border rounded transition-colors ${
                        cajaSeleccionada?.id === caja.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="cursor-pointer flex-1" onClick={() => cargarCajaHistorica(caja)}>
                          <div className="font-medium">Caja #{caja.id}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(caja.fecha_apertura).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            Estado: {caja.estado}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <div className="font-medium">{currency(caja.saldo_final || 0)}</div>
                            <div className="text-xs text-gray-500">
                              {caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleDateString() : 'Abierta'}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              mostrarResumenFinanciero(caja);
                            }}
                            className="ml-2"
                            title="Ver resumen financiero"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {caja.estado === 'cerrada' && (
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarReapertura(caja.id);
                              }}
                              className="ml-2 text-orange-600 hover:text-orange-700"
                              title="Reabrir caja"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {cajasFiltradas.length === 0 && cajasHistoricas.length > 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No se encontraron cajas que coincidan con los filtros
                    </div>
                  )}
                  {cajasHistoricas.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No hay cajas históricas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detalle de Caja Seleccionada */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {cajaSeleccionada ? `Detalle Caja #${cajaSeleccionada.id}` : 'Seleccione una caja'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cajaSeleccionada && resumenSeleccionada ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Apertura:</span>
                        <div className="font-medium">{new Date(cajaSeleccionada.fecha_apertura).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cierre:</span>
                        <div className="font-medium">
                          {cajaSeleccionada.fecha_cierre ? new Date(cajaSeleccionada.fecha_cierre).toLocaleString() : 'No cerrada'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Usuario:</span>
                        <div className="font-medium">{cajaSeleccionada.usuario || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Estado:</span>
                        <div className="font-medium capitalize">{cajaSeleccionada.estado}</div>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Resumen Financiero</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saldo inicial:</span>
                          <span className="font-medium">{currency(resumenSeleccionada.monto_inicial)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total ventas:</span>
                          <span className="font-medium">{currency(resumenSeleccionada.total_ventas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ventas efectivo:</span>
                          <span className="font-medium">{currency(resumenSeleccionada.ventas_efectivo)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Egresos:</span>
                          <span className="font-medium text-red-600">-{currency(resumenSeleccionada.total_egresos)}</span>
                        </div>

                        <hr />
                        <div className="flex justify-between font-bold">
                          <span>Saldo final:</span>
                          <span>{currency(resumenSeleccionada.saldo_final_calculado)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Seleccione una caja del historial para ver sus detalles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transacciones de la Caja Seleccionada */}
          {cajaSeleccionada && (
            <Card>
              <CardHeader>
                <CardTitle>Transacciones - Caja #{cajaSeleccionada.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transaccionesSeleccionada.map((t) => {
                    const esVenta = t.referencia?.startsWith('venta_');
                    const ventaId = esVenta ? parseInt(t.referencia!.replace('venta_', '')) : null;
                    
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <div className="font-medium">
                            {esVenta ? `Venta #${ventaId}` : t.concepto || 'Movimiento'}
                          </div>
                          <div className="text-gray-500">{new Date(t.fecha).toLocaleString()}</div>
                          <div className="text-xs text-gray-400 capitalize">{t.tipo}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{currency(t.monto)}</div>
                          {t.referencia && (
                            <div className="text-xs text-gray-500">{t.referencia}</div>
                          )}
                          {esVenta && ventaId && (
                            <div className="flex gap-1 mt-1">
                              <Button
                                variant="outline"
                                onClick={() => abrirEditarVenta(ventaId)}
                                className="h-6 w-6 p-0"
                                title="Editar venta"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => abrirCancelarVenta(ventaId)}
                                className="h-6 w-6 p-0"
                                title="Cancelar venta"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {transaccionesSeleccionada.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No hay transacciones registradas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>

      {/* Modales */}
      
      {/* Modal Apertura de Caja */}
      <Dialog open={modalApertura} onOpenChange={setModalApertura}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Abrir Nueva Caja
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Monto Inicial</label>
              <Input
                type="number"
                step="0.01"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                placeholder="0.00"
                className="text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Observaciones (opcional)</label>
              <Input
                value={observacionesApertura}
                onChange={(e) => setObservacionesApertura(e.target.value)}
                placeholder="Notas sobre la apertura..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalApertura(false)}>
              Cancelar
            </Button>
            <Button onClick={abrirCaja} disabled={!montoInicial}>
              Abrir Caja
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Movimiento */}
      <Dialog open={modalMovimiento !== null} onOpenChange={() => setModalMovimiento(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalMovimiento === 'ingreso' && <Plus className="h-5 w-5 text-green-600" />}
              {modalMovimiento === 'egreso' && <Minus className="h-5 w-5 text-red-600" />}
              {modalMovimiento === 'ajuste' && <Edit className="h-5 w-5 text-blue-600" />}
              {modalMovimiento === 'ingreso' && 'Registrar Ingreso'}
              {modalMovimiento === 'egreso' && 'Registrar Egreso'}
              {modalMovimiento === 'ajuste' && 'Registrar Ajuste'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Monto</label>
              <Input
                type="number"
                step="0.01"
                value={movMonto}
                onChange={(e) => setMovMonto(e.target.value)}
                placeholder="0.00"
                className="text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Concepto</label>
              <Input
                value={movConcepto}
                onChange={(e) => setMovConcepto(e.target.value)}
                placeholder="Descripción del movimiento..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <Select value={movMetodoPago} onValueChange={setMovMetodoPago}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalMovimiento(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={registrarMovimiento} 
              disabled={!movMonto || !movConcepto || !movMetodoPago}
              className={modalMovimiento === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 
                        modalMovimiento === 'egreso' ? 'bg-red-600 hover:bg-red-700' : 
                        'bg-blue-600 hover:bg-blue-700'}
            >
              Registrar {modalMovimiento === 'ingreso' ? 'Ingreso' : modalMovimiento === 'egreso' ? 'Egreso' : 'Ajuste'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Cierre de Caja */}
      <Dialog open={modalCierre} onOpenChange={setModalCierre}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Cerrar Caja #{cajaActiva?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Resumen del Sistema</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Saldo Inicial:</span>
                    <span>{currency(cajaActiva?.monto_inicial || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Ventas:</span>
                    <span className="text-green-600">{currency(resumen?.total_ventas || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingresos:</span>
                    <span className="text-green-600">{currency(resumen?.total_ingresos || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Egresos:</span>
                    <span className="text-red-600">{currency(resumen?.total_egresos || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ganancia/Pérdida:</span>
                    <span className={(resumen?.ganancia_perdida ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {currency(resumen?.ganancia_perdida || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Saldo Esperado:</span>
                    <span>{currency(resumen?.saldo_final_calculado || 0)}</span>
                  </div>
                </div>
              </div>
              {/* Sección de arqueo eliminada */}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Observaciones de Cierre</label>
              <textarea
                value={observacionesCierre}
                onChange={(e) => setObservacionesCierre(e.target.value)}
                placeholder="Notas sobre el cierre de caja..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalCierre(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={cerrarCaja}
              className="bg-red-600 hover:bg-red-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de arqueo eliminado */}

      {/* Modales de ventas */}
      {modalNuevaVenta && (
        <NuevaVentaModal
          isOpen={modalNuevaVenta}
          onClose={() => setModalNuevaVenta(false)}
          onVentaCreada={onVentaCreada}
        />
      )}

      {modalEditarVenta && ventaIdEditando && (
        <EditarVentaModal
          isOpen={modalEditarVenta}
          onClose={() => {
            setModalEditarVenta(false);
            setVentaIdEditando(null);
          }}
          ventaId={ventaIdEditando}
          onVentaActualizada={onVentaActualizada}
        />
      )}

      {modalCancelarVenta && ventaIdCancelando && (
        <CancelarVentaModal
          isOpen={modalCancelarVenta}
          onClose={() => {
            setModalCancelarVenta(false);
            setVentaIdCancelando(null);
          }}
          ventaId={ventaIdCancelando}
          onVentaCancelada={onVentaCancelada}
        />
      )}

      {/* Modal de Confirmación de Reapertura */}
      <Dialog open={modalReapertura} onOpenChange={setModalReapertura}>
        <DialogContent className="sm:max-w-md" onClose={() => setModalReapertura(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirmar Reapertura de Caja
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>¿Está seguro de que desea reabrir la caja #{cajaIdReabriendo}?</strong>
              </p>
              <p className="text-sm text-orange-700 mt-2">
                {cajaActiva ? (
                  <>Esta acción cerrará automáticamente la caja activa actual (#{cajaActiva?.id}) y reabrirá la caja histórica seleccionada.</>
                ) : (
                  <>Esta acción reabrirá la caja histórica seleccionada como caja activa.</>
                )}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              La reapertura se registrará en el historial de auditoría para mantener la trazabilidad.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelarReapertura}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarReapertura}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Confirmar Reapertura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Resumen Financiero */}
      <Dialog open={modalResumenFinanciero} onOpenChange={setModalResumenFinanciero}>
        <DialogContent className="max-w-2xl" onClose={() => setModalResumenFinanciero(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumen Financiero - Caja #{cajaResumenFinanciero?.id}
            </DialogTitle>
          </DialogHeader>
          {cajaResumenFinanciero && resumenFinanciero && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <p className="text-sm text-gray-600">
                  Abierto {new Date(cajaResumenFinanciero.fecha_apertura).toLocaleDateString()} ({new Date(cajaResumenFinanciero.fecha_apertura).toLocaleTimeString()}) por {cajaResumenFinanciero.usuario}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ventas</span>
                  <span className="font-bold">{currency(resumenFinanciero.total_ventas || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Total de ventas</span>
                  <span className="font-bold">{currency(resumenFinanciero.total_ventas || 0)}</span>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Efectivo</span>
                    <span>{currency(resumenFinanciero.ventas_efectivo || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tarjeta</span>
                    <span>{currency(resumenFinanciero.ventas_tarjeta || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Transferencia</span>
                    <span>{currency(resumenFinanciero.ventas_transferencia || 0)}</span>
                  </div>
                  {(resumenFinanciero.ventas_tarjeta + resumenFinanciero.ventas_transferencia) > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Crédito</span>
                      <span>{currency((resumenFinanciero.ventas_tarjeta || 0) + (resumenFinanciero.ventas_transferencia || 0))}</span>
                    </div>
                  )}
                  

                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Saldo inicial</span>
                    <span>{currency(resumenFinanciero.monto_inicial || 0)}</span>
                  </div>

                  {resumenFinanciero.total_egresos > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Egresos</span>
                      <span>-{currency(resumenFinanciero.total_egresos || 0)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span>Ganancia/Pérdida</span>
                    <span className={resumenFinanciero.ganancia_perdida >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {currency(resumenFinanciero.ganancia_perdida || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t-2 border-black pt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Saldo Final</span>
                    <span className="font-bold">{currency(resumenFinanciero.saldo_final_calculado || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalResumenFinanciero(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}