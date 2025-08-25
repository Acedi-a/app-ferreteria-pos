import { useEffect, useState, useCallback } from "react";
import { Download, Upload, Plus, Minus } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { InventarioService, type InventarioItem, type TipoMovimiento } from "../services/inventario-service";
import { ProveedoresService } from "../services/proveedores-service";
import { InventoryStats } from "../components/inventario/InventoryStats";
import { InventoryFilters } from "../components/inventario/InventoryFilters";
import { InventoryTable } from "../components/inventario/InventoryTable";
import { MovementsTable } from "../components/inventario/MovementsTable";
import AdjustStockModal, { type Proveedor } from "../components/inventario/AdjustStockModal";
import MovementModal from "../components/inventario/MovementModal";

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<InventarioItem | null>(null);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [ajusteTipo, setAjusteTipo] = useState<TipoMovimiento>("ajuste");
  const [ajusteCantidad, setAjusteCantidad] = useState<number>(0);
  const [ajusteObserv, setAjusteObserv] = useState<string>("");
  const [ajusteProveedorId, setAjusteProveedorId] = useState<number | undefined>(undefined);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [totalComprasRecientes, setTotalComprasRecientes] = useState<number>(0);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');

  const categorias = ["Todas", ...Array.from(new Set(inventario.map(i => i.categoria || "Sin categoría")))];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([cargarInventario(), cargarMovimientos(), cargarProveedores(), cargarComprasRecientes()]);
  };

  const cargarInventario = async () => {
    const items = await InventarioService.listarInventario();
    setInventario(items);
  };

  const cargarMovimientos = async () => {
    const rows = await InventarioService.listarMovimientos(50);
    setMovimientos(rows);
  };

  const cargarProveedores = async () => {
    try {
      const items = await ProveedoresService.obtenerTodos();
      setProveedores(items.filter(p => p.activo).map((p: any) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre
      })));
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      setProveedores([]);
    }
  };

  const cargarComprasRecientes = async () => {
    try {
      const total = await InventarioService.calcularComprasRecientes(30);
      setTotalComprasRecientes(total);
    } catch (error) {
      console.error('Error cargando compras recientes:', error);
      setTotalComprasRecientes(0);
    }
  };

  const filteredInventory = inventario.filter((item) => {
    const matchesSearch =
      (item.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.codigo_interno || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || selectedCategory === "Todas" || (item.categoria || "") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalProductos: inventario.length,
    stockNormal: inventario.filter((item) => (item.stock_actual || 0) > (item.stock_minimo ?? 0)).length,
    stockBajo: inventario.filter((item) => (item.stock_actual || 0) <= (item.stock_minimo ?? 0)).length,
    valorTotal: inventario.reduce((sum, item) => sum + ((item.valor_total ?? ((item.costo_unitario_ultimo || 0) * (item.stock_actual || 0))) || 0), 0),
    totalComprasRecientes,
  };

  const handleAdjustStock = (product: InventarioItem) => {
    setAdjustingProduct(product);
    setAjusteTipo("ajuste");
    setAjusteCantidad(0);
    setAjusteObserv("");
  // costo removido del flujo de ajustes
    setAjusteProveedorId(undefined);
    setShowAdjustModal(true);
  };

  const aplicarAjuste = useCallback(async () => {
    if (!adjustingProduct) return;
    if (!ajusteCantidad || ajusteCantidad === 0) return;

    // Para entradas, validar que se haya seleccionado un proveedor
    if (ajusteTipo === 'entrada' && !ajusteProveedorId) {
      alert('Debe seleccionar un proveedor para las entradas de productos');
      return;
    }

    await InventarioService.registrarMovimiento({
      producto_id: adjustingProduct.id,
      tipo_movimiento: ajusteTipo,
      cantidad: ajusteTipo === 'ajuste' ? ajusteCantidad : Math.abs(ajusteCantidad),
  // sin costo_unitario: ahora se omite del movimiento
      proveedor_id: ajusteTipo === 'entrada' ? ajusteProveedorId : undefined,
      observaciones: ajusteObserv || null,
    });

    // Refrescar datos
    await cargarDatos();
    setShowAdjustModal(false);
  }, [adjustingProduct, ajusteCantidad, ajusteTipo, ajusteProveedorId, ajusteObserv]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  // Memoizar handlers para el modal
  const handleModalClose = useCallback(() => setShowAdjustModal(false), []);
  const handleTipoChange = useCallback((v: TipoMovimiento) => setAjusteTipo(v), []);
  const handleCantidadChange = useCallback((v: number) => setAjusteCantidad(v), []);
  const handleObservacionesChange = useCallback((v: string) => setAjusteObserv(v), []);
  // costo removido del modal
  const handleProveedorIdChange = useCallback((v: number | undefined) => setAjusteProveedorId(v), []);

  // Handlers para el nuevo modal de movimientos
  const handleMovementModalClose = useCallback(() => setShowMovementModal(false), []);
  const handleMovementSuccess = useCallback(() => {
    cargarDatos();
  }, []);

  // Nota: Evitar declarar componentes anidados (como AdjustModal) dentro del render para no forzar remounts

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control de Inventario</h1>
          <p className="text-sm text-slate-500">Monitorea y gestiona el stock de productos</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              setMovementType('entrada');
              setShowMovementModal(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Registrar Entrada
          </Button>
          <Button 
            onClick={() => {
              setMovementType('salida');
              setShowMovementModal(true);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Minus className="mr-2 h-4 w-4" />
            Registrar Salida
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Inventario
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Importar Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStats
        totalProductos={stats.totalProductos}
        stockNormal={stats.stockNormal}
        stockBajo={stats.stockBajo}
        valorTotal={stats.valorTotal}
        totalComprasRecientes={stats.totalComprasRecientes}
      />

      {/* Filters */}
      <InventoryFilters
        searchTerm={searchTerm}
        onSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        onSelectedCategory={setSelectedCategory}
        categorias={categorias}
        onClear={clearFilters}
      />

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable items={filteredInventory} onAdjust={handleAdjustStock} />
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <MovementsTable rows={movimientos} />
        </CardContent>
      </Card>

      {/* Modal de ajuste individual */}
      {showAdjustModal && (
        <AdjustStockModal
          open={showAdjustModal}
          product={adjustingProduct}
          tipo={ajusteTipo}
          cantidad={ajusteCantidad}
          observaciones={ajusteObserv}
          proveedorId={ajusteProveedorId}
          proveedores={proveedores}
          onClose={handleModalClose}
          onTipo={handleTipoChange}
          onCantidad={handleCantidadChange}
          onObservaciones={handleObservacionesChange}
          onProveedorId={handleProveedorIdChange}
          onAplicar={aplicarAjuste}
        />
      )}

      {/* Modal de movimientos masivos */}
      {showMovementModal && (
        <MovementModal
          open={showMovementModal}
          tipo={movementType}
          onClose={handleMovementModalClose}
          onSuccess={handleMovementSuccess}
        />
      )}
    </div>
  );
}
