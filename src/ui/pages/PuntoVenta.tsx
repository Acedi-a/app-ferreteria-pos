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
import { getBoliviaDate, getBoliviaISOString } from "../lib/utils";

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
  precio: Number(producto.precio_venta),
  stock: producto.stock_actual,
  ventaFraccionada: Boolean(producto.venta_fraccionada), // Tomar el valor real de la BD
  unidadMedida: 'unidad', // Por defecto ya que no existe en ProductoBase
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
  const scanInputRef = useRef<{ focus: () => void; blur: () => void; value: string }>(null);
  
  // Estados de datos
  // Ya no listamos todos los productos; trabajamos por escaneo/código
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del carrito
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nombreClientePersonalizado, setNombreClientePersonalizado] = useState("");
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
  // Búsqueda de productos eliminada - ahora usa sugerencias en tiempo real
  // Sugerencias en tiempo real


  // Confirmación de registro
  const [showConfirmRegistro, setShowConfirmRegistro] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

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

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const term = inputCodigo.trim();
    
    // Detectar si es un código de barras (solo números y/o guiones)
    const isBarcode = /^[0-9\-]+$/.test(term);
    
    // Si es código de barras, búsqueda inmediata; si no, usar debounce
    const delay = isBarcode ? 0 : 800;
    
    const timeoutId = setTimeout(async () => {
      if (term.length >= 2) {
        try {
          const productos = await PuntoVentaService.buscarProductos(term);
          const productosConvertidos = productos.map(convertirProductoBase);
          
          if (productosConvertidos.length === 0) {
            // Si no se encuentran productos, no hacer nada por ahora
          } else {
            // Productos encontrados, no hacer nada por ahora
          }
        } catch (error) {
          console.error('Error en búsqueda en tiempo real:', error);
          // Error en búsqueda
        }
      } else {
        // Campo vacío
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [inputCodigo]);

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

  const actualizarPrecio = (id: number, nuevoPrecio: number) => {
    setProductos(productos.map(p => {
      if (p.id !== id) return p;
      return { ...p, precio: nuevoPrecio, subtotal: p.cantidad * nuevoPrecio };
    }));
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
      let siguiente = existente.cantidad + (producto.ventaFraccionada ? 0.1 : 1);
      // Para productos fraccionados, no redondear; para productos enteros, usar Math.floor
      if (producto.ventaFraccionada) {
        siguiente = Math.min(siguiente, stock);
      } else {
        siguiente = Math.floor(Math.min(siguiente, stock));
      }
      if (siguiente > stock) {
        toast({ title: "Stock insuficiente", description: `Solo hay ${stock} en stock para ${producto.nombre}.`, variant: "destructive" });
        return;
      }
      actualizarCantidad(producto.id, siguiente);
      toast({ title: "Cantidad actualizada", description: `Ahora: ${siguiente} x ${producto.nombre}` });
    } else {
      const cantidadInicial = producto.ventaFraccionada ? Math.min(0.1, stock) : Math.min(1, stock);
      const nuevoProducto = {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidadInicial,
        subtotal: Number(producto.precio) * cantidadInicial,
        ventaFraccionada: producto.ventaFraccionada,
        unidadMedida: producto.unidadMedida,
      };
      console.log('Producto a agregar al carrito:', nuevoProducto);
      setProductos([...productos, nuevoProducto]);
      toast({ title: "Producto agregado", description: `${producto.nombre} agregado al carrito` });
    }
  };

  // Buscar producto por código exacto y agregar al carrito
  const onScanEnter = async () => {
    // Limpiar el código de caracteres especiales, espacios y caracteres de control
    const termino = inputCodigo.trim().replace(/[\r\n\t\f\v\u0000-\u001F\u007F-\u009F]/g, '');
    if (!termino) return;
    
    try {
      // Intentar búsqueda exacta por código
      const prodBase = await PuntoVentaService.obtenerProductoPorCodigo(termino);
      if (prodBase) {
        const prod = convertirProductoBase(prodBase);
        // Asegurar que tengamos referencia de stock para futuras actualizaciones
        setProductosDisponibles(prev => prev.some(p => p.id === prod.id) ? prev : [...prev, prod]);
        agregarProducto(prod);
        setInputCodigo("");
        return;
      }
      
      // Si no se encuentra por código exacto, mostrar confirmación interna
      setTerminoBusqueda(termino);
      setShowConfirmRegistro(true);
      
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
    setTimeout(() => scanInputRef.current?.focus?.(), 50);
  };

  // Manejar confirmación de registro de producto
  const confirmarRegistroProducto = () => {
    setCodigoEscaneado(terminoBusqueda);
    setNuevoProd({
      codigo_interno: terminoBusqueda,
      codigo_barras: terminoBusqueda,
      marca: "",
      nombre: "",
      precio_venta: "",
      costo_unitario: "",
      stock_actual: "1",
      stock_minimo: "0",
      venta_fraccionada: false
    });
    setShowConfirmRegistro(false);
    setShowCrearProducto(true);
  };

  const cancelarRegistroProducto = () => {
    setShowConfirmRegistro(false);
    setInputCodigo("");
    setTerminoBusqueda("");
    // Reenfocar input de escaneo después de cancelar
    setTimeout(() => {
      scanInputRef.current?.focus?.();
    }, 100);
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
      setTimeout(() => scanInputRef.current?.focus?.(), 50);
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
      const ajustada = prod.ventaFraccionada ? stock : Math.floor(stock);
      setProductos(productos.map(p => p.id === id ? { ...p, cantidad: ajustada, subtotal: Number(p.precio) * ajustada } : p));
      toast({ title: "Stock insuficiente", description: `Se ajustó la cantidad de ${prod.nombre} a ${ajustada} (stock disponible).`, variant: "destructive" });
      return;
    }

    // Actualización normal dentro de stock
    setProductos(productos.map(p => {
      if (p.id !== id) return p;
      // Si el producto es fraccionado, permitir decimales completos
      if (p.ventaFraccionada) {
        return { ...p, cantidad: cantidadSolicitada, subtotal: Number(p.precio) * cantidadSolicitada };
      } else {
        // Si no es fraccionado, redondear a entero
        const cantidadEntera = Math.round(cantidadSolicitada);
        return { ...p, cantidad: cantidadEntera, subtotal: Number(p.precio) * cantidadEntera };
      }
    }));
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
      setNombreClientePersonalizado(""); // Limpiar nombre personalizado
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
      const ahora = getBoliviaDate();
      const num = `P-${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, '0')}${String(ahora.getDate()).padStart(2, '0')}-${String(ahora.getHours()).padStart(2, '0')}${String(ahora.getMinutes()).padStart(2, '0')}${String(ahora.getSeconds()).padStart(2, '0')}`;

      const venta: VentaModel = {
        id: 0,
        numero_venta: num,
        cliente_id: clienteSeleccionado?.id,
        cliente_nombre: clienteSeleccionado?.nombre || nombreClientePersonalizado || 'Cliente general',
        almacen_id: 1,
        subtotal,
        descuento,
        impuestos: 0,
        total,
        metodo_pago: metodoPago,
        estado: 'pendiente',
        observaciones: observaciones || '',
        fecha_venta: getBoliviaISOString(),
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
            placeholder="Escanee código o escriba para buscar por nombre/código local"
          />
          <p className="text-xs text-gray-500 mt-1">Enter busca código exacto. Las sugerencias aparecen automáticamente mientras escribe.</p>
          {!loading && (
            <div className="text-xs text-gray-500 mt-2">Clientes cargados: {clientes.length} · Categorías: {categorias.length}</div>
          )}

        </div>

        {/* Carrito a pantalla completa (abajo) */}
        <div className="bg-white border rounded-lg p-4">
          <CartPanel
            productos={productos}
            onActualizarCantidad={actualizarCantidad}
            onActualizarPrecio={actualizarPrecio}
            onEliminarProducto={eliminarProducto}
            onProcesarVenta={procesarVenta}
            onImprimirTicket={imprimirTicket}
            clientes={clientes}
            clienteSeleccionado={clienteSeleccionado}
            onSeleccionarCliente={setClienteSeleccionado}
            nombreClientePersonalizado={nombreClientePersonalizado}
            onCambiarNombreClientePersonalizado={setNombreClientePersonalizado}
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
                    step="any"
                    value={nuevoProd.precio_venta}
                    onChange={e => {
                      const value = e.target.value;
                      setNuevoProd({ ...nuevoProd, precio_venta: value });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Costo unitario</label>
                  <input
                    type="number"
                    step="any"
                    value={nuevoProd.costo_unitario}
                    onChange={e => {
                      const value = e.target.value;
                      setNuevoProd({ ...nuevoProd, costo_unitario: value });
                    }}
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
              <Button variant="outline" onClick={() => {
                setShowCrearProducto(false);
                setInputCodigo("");
                // Reenfocar input de escaneo después de cancelar
                setTimeout(() => {
                  scanInputRef.current?.focus?.();
                }, 200);
              }}>Cancelar</Button>
              <Button onClick={guardarNuevoProducto}>Guardar y agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Confirmación de registro de producto */}
        <Dialog open={showConfirmRegistro} onOpenChange={setShowConfirmRegistro}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Producto no encontrado</DialogTitle>
              <DialogDescription>
                No se encontró ningún producto con código exacto "{terminoBusqueda}". ¿Desea registrar un nuevo producto?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelarRegistroProducto}>
                Cancelar
              </Button>
              <Button onClick={confirmarRegistroProducto}>
                Registrar producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}