// src/pages/PuntoVenta.tsx
import { useState, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import ProductGrid from "../components/punto-venta/ProductGrid";
import CartPanel from "../components/punto-venta/CartPanel";
import { PuntoVentaService } from "../services/punto-venta-service";
import type { Producto as ProductoBase, Cliente as ClienteBase, Categoria } from "../services/punto-venta-service";

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
  
  // Estados de datos
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
  
  // Estados de la interfaz
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [cartMinimized, setCartMinimized] = useState(false);
  const [filtroStock, setFiltroStock] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [ordenPrecio, setOrdenPrecio] = useState("ninguno");
  const [filtroVenta, setFiltroVenta] = useState("todos");

  /* ---------- carga inicial de datos ---------- */
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [productosData, clientesData, categoriasData] = await Promise.all([
        PuntoVentaService.obtenerProductos(),
        PuntoVentaService.obtenerClientes(),
        PuntoVentaService.obtenerCategorias()
      ]);

      setProductosDisponibles(productosData.map(convertirProductoBase));
      setClientes(clientesData.map(convertirClienteBase));
      setCategorias(categoriasData);

      console.log('Productos cargados:', productosData);
      console.log('Productos convertidos:', productosData.map(convertirProductoBase));

      toast({
        title: "Datos cargados",
        description: `${productosData.length} productos y ${clientesData.length} clientes disponibles`
      });
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
    if (existente) {
      actualizarCantidad(producto.id, existente.cantidad + 1);
    } else {
      const nuevoProducto = {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        subtotal: producto.precio,
        ventaFraccionada: producto.ventaFraccionada,
        unidadMedida: producto.unidadMedida,
      };
      
      console.log('Producto a agregar al carrito:', nuevoProducto);
      
      setProductos([
        ...productos,
        nuevoProducto,
      ]);
    }
    
    toast({ 
      title: "Producto agregado", 
      description: `${producto.nombre} agregado al carrito` 
    });
  };

  const actualizarCantidad = (id: number, nueva: number) => {
    if (nueva <= 0) {
      setProductos(productos.filter((p) => p.id !== id));
      return;
    }
    setProductos(
      productos.map((p) =>
        p.id === id ? { ...p, cantidad: nueva, subtotal: p.precio * nueva } : p
      )
    );
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
      
      toast({ 
        title: "Venta procesada exitosamente", 
        description: `Venta #${ventaId} - Total: Bs ${total.toFixed(2)}` 
      });
      
      // Limpiar el carrito
      setProductos([]);
      setClienteSeleccionado(null);
      setDescuento(0);
      setObservaciones("");
      setVentaCredito(false);

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

  const imprimirTicket = () => {
    toast({ 
      title: "Imprimiendo ticket", 
      description: "Enviando ticket a la impresora..." 
    });
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

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando productos...</p>
                </div>
              </div>
            ) : (
              <ProductGrid
                productos={productosDisponibles}
                categorias={categorias}
                onAgregarProducto={agregarProducto}
                busqueda={busquedaProducto}
                onCambioBusqueda={setBusquedaProducto}
                filtroStock={filtroStock}
                onCambioFiltroStock={setFiltroStock}
                filtroCategoria={filtroCategoria}
                onCambioFiltroCategoria={setFiltroCategoria}
                ordenPrecio={ordenPrecio}
                onCambioOrdenPrecio={setOrdenPrecio}
                filtroVenta={filtroVenta}
                onCambioFiltroVenta={setFiltroVenta}
              />
            )}
          </div>

          {/* Columna derecha - Carrito */}
          <div className="w-96 flex-shrink-0">
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
              isMinimized={cartMinimized}
              onToggleMinimize={() => setCartMinimized(!cartMinimized)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}