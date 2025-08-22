// src/pages/PuntoVenta.tsx
import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/ui/use-toast";
import CartPanel from "../components/punto-venta/CartPanel";
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";
import { PuntoVentaService } from "../services/punto-venta-service";
import { printTicket } from "../components/ventas/TicketRenderer";
import type { Venta as VentaModel, VentaDetalle as VentaDetalleModel } from "../services/ventas-service";
import type { Producto as ProductoBase, Cliente as ClienteBase, Categoria } from "../services/punto-venta-service";
import { productosService } from "../services/productos-service";
import { MovimientosService } from "../services/movimientos-service";
import ProductSearch from "../components/punto-venta/ProductSearch";

/* ---------- tipos ---------- */
interface ProductoVenta {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  ventaFraccionada: boolean;
  unidadMedida: string;
}

interface Cliente {
  id: number;
  nombre: string;
  codigo: string;
}

interface Producto {
  id: number;
  codigo: string;
  codigoBarras: string;
  nombre: string;
  precio: number;
  stock: number;
  ventaFraccionada: boolean;
  unidadMedida: string;
  categoria?: string;
}

/* ---------- función para convertir producto de BD a local ---------- */
const convertirProductoBase = (producto: ProductoBase): Producto => ({
  id: producto.id,
  codigo: producto.codigo_interno || producto.codigo_barras || '',
  codigoBarras: producto.codigo_barras || '',
  nombre: producto.nombre,
  precio: producto.precio_venta,
  stock: producto.stock_actual,
  ventaFraccionada: Boolean(producto.venta_fraccionada),
  unidadMedida: 'unidad', // Valor por defecto
  categoria: producto.categoria_nombre
});

const convertirClienteBase = (cliente: ClienteBase): Cliente => ({
  id: cliente.id,
  nombre: `${cliente.nombre} ${cliente.apellido}`,
  codigo: cliente.codigo
});

/* ---------- componente principal ---------- */
export default function PuntoVenta() {
  const { toast } = useToast();
  const scanInputRef = useRef<HTMLInputElement | null>(null);
  
  // Estados de datos
  // Ya no listamos todos los productos; trabajamos por escaneo/código
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del carrito
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [ventaCredito, setVentaCredito] = useState(false);
  const [pagoInicial, setPagoInicial] = useState(0);
  
  // Estados de la interfaz
  const [inputCodigo, setInputCodigo] = useState("");
  const [cartMinimized, setCartMinimized] = useState(false);
  // Alta rápida de producto
  const [showCrearProducto, setShowCrearProducto] = useState(false);
  const [codigoEscaneado, setCodigoEscaneado] = useState("");
  const [nuevoProd, setNuevoProd] = useState({
    codigo_interno: "",
    codigo_barras: "",
  marca: "",
    nombre: "",
    precio_venta: "",
    costo_unitario: "",
    stock_actual: "1",
  stock_minimo: "0",
  venta_fraccionada: false
  });

  /* ---------- carga inicial de datos ---------- */
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [clientesData, categoriasData] = await Promise.all([
        PuntoVentaService.obtenerClientes(),
        PuntoVentaService.obtenerCategorias()
      ]);

      setClientes(clientesData.map(convertirClienteBase));
      setCategorias(categoriasData);

      toast({ title: "POS listo", description: `${clientesData.length} clientes cargados` });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Usando datos de ejemplo.",
        variant: "destructive"
      });
      
      // Datos de respaldo en caso de error
  setProductosDisponibles([]);
      setClientes([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- lógica del carrito ---------- */
  const agregarProducto = (producto: Producto) => {
    console.log('Agregando producto al carrito:', producto);
    
    const existente = productos.find((p) => p.id === producto.id);
    const stock = Number(producto.stock) || 0;

    if (stock <= 0) {
      toast({ title: "Sin stock", description: `${producto.nombre} no tiene stock disponible`, variant: "destructive" });
      return;
    }

    if (existente) {
      const siguiente = existente.cantidad + 1;
      if (siguiente > stock) {
        toast({ title: "Stock insuficiente", description: `Solo hay ${stock} en stock para ${producto.nombre}.`, variant: "destructive" });
        return;
      }
      actualizarCantidad(producto.id, siguiente);
      toast({ title: "Cantidad actualizada", description: `Ahora: ${siguiente} x ${producto.nombre}` });
    } else {
      const cantidadInicial = Math.min(1, stock);
      const nuevoProducto = {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidadInicial,
        subtotal: producto.precio * cantidadInicial,
        ventaFraccionada: producto.ventaFraccionada,
        unidadMedida: producto.unidadMedida,
      };
      
      console.log('Producto a agregar al carrito:', nuevoProducto);
      setProductos([...productos, nuevoProducto]);
      toast({ title: "Producto agregado", description: `${producto.nombre} agregado al carrito` });
    }
  };

  // Buscar producto por código (barras o interno) y agregar al carrito
  const onScanEnter = async () => {
    const codigo = inputCodigo.trim();
    if (!codigo) return;
    try {
      const prodBase = await PuntoVentaService.obtenerProductoPorCodigo(codigo);
      if (!prodBase) {
        // Preguntar si desea registrar
        const desea = window.confirm(`No se encontró el código "${codigo}". ¿Desea registrar el producto ahora?`);
        if (!desea) {
          setInputCodigo("");
          return;
        }
        setCodigoEscaneado(codigo);
        setNuevoProd({
          codigo_interno: codigo,
          codigo_barras: codigo,
          marca: "",
          nombre: "",
          precio_venta: "",
          costo_unitario: "",
          stock_actual: "1",
          stock_minimo: "0",
          venta_fraccionada: false
        });
        setShowCrearProducto(true);
        return;        
      }
      const prod = convertirProductoBase(prodBase);
  // Asegurar que tengamos referencia de stock para futuras actualizaciones
  setProductosDisponibles(prev => prev.some(p => p.id === prod.id) ? prev : [...prev, prod]);
      agregarProducto(prod);
      setInputCodigo("");
    } catch (e) {
      toast({ title: "Error de búsqueda", description: String(e), variant: "destructive" });
    }
  };

  // Selección desde el buscador tipoahead
  const onSelectProductoBuscado = (p: ProductoBase) => {
    const prod = convertirProductoBase(p);
    setProductosDisponibles(prev => prev.some(x => x.id === prod.id) ? prev : [...prev, prod]);
    agregarProducto(prod);
    setInputCodigo("");
    setTimeout(() => scanInputRef.current?.focus(), 0);
  };

  const guardarNuevoProducto = async () => {
    try {
      // Validaciones mínimas
      const nombre = nuevoProd.nombre.trim();
      const precio = Number(String(nuevoProd.precio_venta).replace(/,/g, '.'));
      if (!nombre || isNaN(precio) || precio <= 0) {
        toast({ title: 'Datos incompletos', description: 'Nombre y precio de venta son requeridos', variant: 'destructive' });
        return;
      }
      const costo = nuevoProd.costo_unitario ? Number(String(nuevoProd.costo_unitario).replace(/,/g, '.')) : undefined;
      const stockInicial = nuevoProd.stock_actual ? Number(String(nuevoProd.stock_actual).replace(/,/g, '.')) : 0;
      const stockMin = nuevoProd.stock_minimo ? Number(String(nuevoProd.stock_minimo).replace(/,/g, '.')) : 0;

      const codigoInterno = nuevoProd.codigo_interno?.trim() || codigoEscaneado;
      const codigoBarras = nuevoProd.codigo_barras?.trim() || codigoEscaneado;

      // Crear producto
      const nuevoId = await productosService.crearProducto({
        codigo_interno: codigoInterno,
        codigo_barras: codigoBarras,
  marca: nuevoProd.marca?.trim() || undefined,
        nombre,
        precio_venta: precio,
        costo_unitario: costo,
        stock_minimo: stockMin,
  venta_fraccionada: nuevoProd.venta_fraccionada,
        activo: true
      } as any);

      // Carga inicial de stock si corresponde
      if (stockInicial && stockInicial !== 0) {
        await MovimientosService.registrarAjuste({
          producto_id: nuevoId,
          cantidad: stockInicial,
          observaciones: 'Carga inicial (alta rápida POS)'
        });
      }

      // Recuperar producto para carrito y agregar 1 unidad
      const prodBase = await PuntoVentaService.obtenerProductoPorCodigo(codigoBarras || codigoInterno);
      if (!prodBase) {
        toast({ title: 'Error', description: 'Producto creado pero no se pudo recuperar para el carrito', variant: 'destructive' });
      } else {
        const prod = convertirProductoBase(prodBase);
        setProductosDisponibles(prev => prev.some(p => p.id === prod.id) ? prev : [...prev, prod]);
        agregarProducto(prod);
      }

      toast({ title: 'Producto registrado', description: `Se creó ${nombre} y se agregó al carrito` });
      setShowCrearProducto(false);
      setInputCodigo("");
      // Reenfocar input de escaneo
      setTimeout(() => scanInputRef.current?.focus(), 0);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error al crear', description: String(e), variant: 'destructive' });
    }
  };

  const actualizarCantidad = (id: number, nueva: number) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const base = productosDisponibles.find(p => p.id === id);
    const stock = Number(base?.stock) || 0;

    // Normalizar a 0 si NaN
    const cantidadSolicitada = isNaN(nueva) ? 0 : nueva;

    if (cantidadSolicitada <= 0) {
      setProductos(productos.filter((p) => p.id !== id));
      return;
    }

    // No permitir superar stock
    if (cantidadSolicitada > stock) {
      const ajustada = stock;
      setProductos(productos.map(p => p.id === id ? { ...p, cantidad: ajustada, subtotal: p.precio * ajustada } : p));
      toast({ title: "Stock insuficiente", description: `Se ajustó la cantidad de ${prod.nombre} a ${stock} (stock disponible).`, variant: "destructive" });
      return;
    }

    // Actualización normal dentro de stock
    setProductos(productos.map(p => p.id === id ? { ...p, cantidad: cantidadSolicitada, subtotal: p.precio * cantidadSolicitada } : p));
  };

  const eliminarProducto = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id));
    toast({ 
      title: "Producto eliminado", 
      description: "Producto removido del carrito" 
    });
  };

  const procesarVenta = async () => {
    if (productos.length === 0) {
      toast({ 
        title: "Error", 
        description: "Debe agregar al menos un producto", 
        variant: "destructive" 
      });
      return;
    }
    if (ventaCredito && !clienteSeleccionado) {
      toast({ 
        title: "Error", 
        description: "Debe seleccionar un cliente para venta a crédito", 
        variant: "destructive" 
      });
      return;
    }

    const subtotal = productos.reduce((s, p) => s + p.subtotal, 0);
    const total = subtotal - descuento;

    // Validar pago inicial para ventas a crédito
    if (ventaCredito && pagoInicial > total) {
      toast({ 
        title: "Error", 
        description: "El pago inicial no puede ser mayor al total de la venta", 
        variant: "destructive" 
      });
      return;
    }

    try {
      // Validar que todos los productos tengan ID válido
      const productosInvalidos = productos.filter(p => !p.id || p.id === null || p.id === undefined);
      if (productosInvalidos.length > 0) {
        console.error('Productos con ID inválido:', productosInvalidos);
        toast({ 
          title: "Error en productos", 
          description: "Algunos productos no tienen ID válido. Refresque la página e intente nuevamente.", 
          variant: "destructive" 
        });
        return;
      }

      // Preparar datos para la venta
      const nuevaVenta = {
        cliente_id: clienteSeleccionado?.id,
        metodo_pago: metodoPago,
        subtotal,
        descuento,
        total,
        observaciones: observaciones || undefined,
        es_credito: ventaCredito,
        pago_inicial: ventaCredito ? pagoInicial : undefined,
        detalles: productos.map(p => ({
          producto_id: p.id,
          producto_nombre: p.nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio,
          subtotal: p.subtotal,
          es_fraccionado: p.ventaFraccionada
        }))
      };

      console.log('Datos de venta a enviar:', nuevaVenta);

      // Crear venta en la base de datos
      const ventaId = await PuntoVentaService.crearVenta(nuevaVenta);
      
      const tipoVenta = ventaCredito ? "crédito" : "contado";
      const pagoInicialText = ventaCredito && pagoInicial > 0 ? ` (Pago inicial: Bs ${pagoInicial.toFixed(2)})` : "";
      
      toast({ 
        title: "Venta procesada exitosamente", 
        description: `Venta ${tipoVenta} #${ventaId} - Total: Bs ${total.toFixed(2)}${pagoInicialText}` 
      });
      
      // Limpiar el carrito
      setProductos([]);
      setClienteSeleccionado(null);
      setDescuento(0);
      setObservaciones("");
      setVentaCredito(false);
      setPagoInicial(0);

      // Actualizar lista de productos para reflejar el nuevo stock
      await cargarDatos();

    } catch (error) {
      console.error('Error al procesar venta:', error);
      toast({ 
        title: "Error al procesar venta", 
        description: "Ocurrió un error al guardar la venta. Intente nuevamente.", 
        variant: "destructive" 
      });
    }
  };

  const imprimirTicket = async () => {
    if (productos.length === 0) {
      toast({ title: "Carrito vacío", description: "Agrega productos antes de imprimir.", variant: "destructive" });
      return;
    }

    try {
      const subtotal = productos.reduce((s, p) => s + p.subtotal, 0);
      const total = subtotal - descuento;
      const ahora = new Date();
      const num = `P-${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, '0')}${String(ahora.getDate()).padStart(2, '0')}-${String(ahora.getHours()).padStart(2, '0')}${String(ahora.getMinutes()).padStart(2, '0')}${String(ahora.getSeconds()).padStart(2, '0')}`;

      const venta: VentaModel = {
        id: 0,
        numero_venta: num,
        cliente_id: clienteSeleccionado?.id,
        cliente_nombre: clienteSeleccionado?.nombre || 'Cliente general',
        almacen_id: 1,
        subtotal,
        descuento,
        impuestos: 0,
        total,
        metodo_pago: metodoPago,
        estado: 'pendiente',
        observaciones: observaciones || '',
        fecha_venta: new Date().toISOString(),
        usuario: 'POS',
      };

      const detalles: VentaDetalleModel[] = productos.map(p => ({
        id: 0,
        venta_id: 0,
        producto_id: p.id,
        producto_nombre: p.nombre,
        cantidad: p.cantidad,
        precio_unitario: p.precio,
        descuento: 0,
        subtotal: p.subtotal,
      }));

      const res = await printTicket(venta, detalles);
      if (res?.ok) {
        toast({ title: 'Ticket enviado', description: 'Impresión enviada a la impresora configurada.' });
      } else {
        toast({ title: 'No se pudo imprimir', description: res?.error || 'Revise la impresora en Configuración', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Error al imprimir', description: String(e), variant: 'destructive' });
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-sm text-gray-600">Gestiona tus ventas de forma rápida y eficiente</p>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Zona de escaneo */}
        <div className="bg-white border rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Escanear / buscar producto</label>
          <ProductSearch
            value={inputCodigo}
            onChange={setInputCodigo}
            onEnter={onScanEnter}
            onSelect={onSelectProductoBuscado}
            inputRef={scanInputRef}
            autoFocus
            onQuickCreate={(nombre) => {
              setCodigoEscaneado(inputCodigo.trim());
              setNuevoProd((prev) => ({
                ...prev,
                nombre,
                marca: "",
                // si el input es un código, se usará en crear; si es nombre puro, se quedará vacío
                codigo_interno: prev.codigo_interno || "",
                codigo_barras: prev.codigo_barras || "",
              }));
              setShowCrearProducto(true);
            }}
            placeholder="Escanee el código o escriba para buscar por nombre/código"
          />
          <p className="text-xs text-gray-500 mt-1">Enter intenta coincidencia exacta de código; también puedes seleccionar de la lista sugerida.</p>
          {!loading && (
            <div className="text-xs text-gray-500 mt-2">Clientes cargados: {clientes.length} · Categorías: {categorias.length}</div>
          )}
        </div>

        {/* Carrito a pantalla completa (abajo) */}
        <div className="bg-white border rounded-lg p-4">
          <CartPanel
            productos={productos}
            onActualizarCantidad={actualizarCantidad}
            onEliminarProducto={eliminarProducto}
            onProcesarVenta={procesarVenta}
            onImprimirTicket={imprimirTicket}
            clientes={clientes}
            clienteSeleccionado={clienteSeleccionado}
            onSeleccionarCliente={setClienteSeleccionado}
            metodoPago={metodoPago}
            onCambiarMetodoPago={setMetodoPago}
            descuento={descuento}
            onCambiarDescuento={setDescuento}
            observaciones={observaciones}
            onCambiarObservaciones={setObservaciones}
            ventaCredito={ventaCredito}
            onCambiarVentaCredito={setVentaCredito}
            pagoInicial={pagoInicial}
            onCambiarPagoInicial={setPagoInicial}
            isMinimized={cartMinimized}
            onToggleMinimize={() => setCartMinimized(!cartMinimized)}
          />
        </div>

        {/* Modal: Alta rápida de producto */}
        <Dialog open={showCrearProducto} onOpenChange={(o) => { setShowCrearProducto(o); if (!o) setTimeout(() => scanInputRef.current?.focus(), 0); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar producto rápidamente</DialogTitle>
              <DialogDescription>Complete los datos mínimos para poder vender este producto ahora.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">Código interno</label>
                <input
                  value={nuevoProd.codigo_interno}
                  onChange={e => setNuevoProd({ ...nuevoProd, codigo_interno: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Código de barras</label>
                <input
                  value={nuevoProd.codigo_barras}
                  onChange={e => setNuevoProd({ ...nuevoProd, codigo_barras: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Nombre del producto*</label>
                <input
                  value={nuevoProd.nombre}
                  onChange={e => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Marca</label>
                <input
                  value={nuevoProd.marca}
                  onChange={e => setNuevoProd({ ...nuevoProd, marca: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="pv-fraccionada"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={nuevoProd.venta_fraccionada}
                  onChange={e => setNuevoProd({ ...nuevoProd, venta_fraccionada: e.target.checked })}
                />
                <label htmlFor="pv-fraccionada" className="text-sm text-gray-700 select-none">
                  Permitir venta fraccionada (cantidades decimales)
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700">Precio de venta*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoProd.precio_venta}
                    onChange={e => setNuevoProd({ ...nuevoProd, precio_venta: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Costo unitario</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoProd.costo_unitario}
                    onChange={e => setNuevoProd({ ...nuevoProd, costo_unitario: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700">Stock inicial</label>
                  <input
                    type="number"
                    step={nuevoProd.venta_fraccionada ? "0.1" : "1"}
                    value={nuevoProd.stock_actual}
                    onChange={e => setNuevoProd({ ...nuevoProd, stock_actual: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Stock mínimo</label>
                  <input
                    type="number"
                    step="1"
                    value={nuevoProd.stock_minimo}
                    onChange={e => setNuevoProd({ ...nuevoProd, stock_minimo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCrearProducto(false)}>Cancelar</Button>
              <Button onClick={guardarNuevoProducto}>Guardar y agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}