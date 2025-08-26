import { useEffect, useState, useCallback } from "react";
import { Download, Upload, Plus, Minus } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { InventarioService, type InventarioItem, type TipoMovimiento, type PaginatedResult } from "../services/inventario-service";
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
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<InventarioItem> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [ajusteTipo, setAjusteTipo] = useState<TipoMovimiento>("ajuste");
  const [ajusteCantidad, setAjusteCantidad] = useState<number>(0);
  const [ajusteObserv, setAjusteObserv] = useState<string>("");
  const [ajusteProveedorId, setAjusteProveedorId] = useState<number | undefined>(undefined);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [totalComprasRecientes, setTotalComprasRecientes] = useState<number>(0);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = useState<TipoMovimiento | 'todos'>('todos');

  const categorias = ["Todas", ...Array.from(new Set(inventario.map(i => i.categoria || "Sin categoría")))];

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    cargarMovimientos();
  }, [filtroTipoMovimiento]);

  const cargarDatos = async () => {
    await Promise.all([cargarInventario(), cargarMovimientos(), cargarProveedores(), cargarComprasRecientes()]);
  };

  const cargarInventario = async () => {
    setIsLoading(true);
    try {
      const result = await InventarioService.listarInventarioPaginado(
        currentPage, 
        pageSize, 
        searchTerm, 
        selectedCategory === 'Todas' ? '' : selectedCategory
      );
      setPaginatedData(result);
      setInventario(result.items);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    const rows = await InventarioService.listarMovimientosPorTipo(filtroTipoMovimiento, 50);
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

  // Ya no necesitamos filtrar aquí porque la paginación maneja los filtros
  const filteredInventory = inventario;

  const stats = {
    totalProductos: paginatedData?.totalItems || 0,
    stockNormal: inventario.filter((item) => (item.stock_actual || 0) > (item.stock_minimo ?? 0)).length,
    stockBajo: inventario.filter((item) => (item.stock_actual || 0) <= (item.stock_minimo ?? 0)).length,
    valorTotal: inventario.reduce((sum, item) => sum + ((item.valor_total ?? ((item.costo_unitario_ultimo || 0) * (item.stock_actual || 0))) || 0), 0),
    totalComprasRecientes,
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setCurrentPage(1); // Reset to first page when changing category
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
    setCurrentPage(1);
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
        onSearchTerm={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectedCategory={handleCategoryChange}
        categorias={categorias}
        onClear={clearFilters}
      />

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Inventario de Productos
            {paginatedData && (
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({paginatedData.totalItems} productos total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-slate-500">Cargando inventario...</div>
            </div>
          ) : (
            <>
              <InventoryTable items={filteredInventory} onAdjust={handleAdjustStock} />
              
              {/* Pagination Controls */}
              {paginatedData && paginatedData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-500">
                    Mostrando {((paginatedData.currentPage - 1) * paginatedData.pageSize) + 1} a{' '}
                    {Math.min(paginatedData.currentPage * paginatedData.pageSize, paginatedData.totalItems)} de{' '}
                    {paginatedData.totalItems} productos
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Botón Primera Página */}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      title="Primera página"
                      className="px-2 py-1"
                    >
                      ««
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1"
                    >
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Mostrar solo páginas cercanas a la actual
                          const distance = Math.abs(page - currentPage);
                          return distance <= 2 || page === 1 || page === paginatedData.totalPages;
                        })
                        .map((page, index, array) => {
                          // Agregar separadores si hay saltos
                          const prevPage = array[index - 1];
                          const showSeparator = prevPage && page - prevPage > 1;
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showSeparator && (
                                <span className="px-2 text-slate-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === paginatedData.totalPages}
                      className="px-2 py-1"
                    >
                      Siguiente
                    </Button>
                    
                    {/* Botón Última Página */}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(paginatedData.totalPages)}
                      disabled={currentPage === paginatedData.totalPages}
                      title="Última página"
                      className="px-2 py-1"
                    >
                      »»
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movimientos Recientes</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filtroTipoMovimiento === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroTipoMovimiento('todos')}
                className="px-3 py-1"
              >
                Todos
              </Button>
              <Button
                variant={filtroTipoMovimiento === 'entrada' ? 'default' : 'outline'}
                onClick={() => setFiltroTipoMovimiento('entrada')}
                className={`px-3 py-1 ${filtroTipoMovimiento === 'entrada' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                Entradas
              </Button>
              <Button
                variant={filtroTipoMovimiento === 'salida' ? 'default' : 'outline'}
                onClick={() => setFiltroTipoMovimiento('salida')}
                className={`px-3 py-1 ${filtroTipoMovimiento === 'salida' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                Salidas
              </Button>
              <Button
                variant={filtroTipoMovimiento === 'ajuste' ? 'default' : 'outline'}
                onClick={() => setFiltroTipoMovimiento('ajuste')}
                className={`px-3 py-1 ${filtroTipoMovimiento === 'ajuste' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                Ajustes
              </Button>
            </div>
          </div>
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
