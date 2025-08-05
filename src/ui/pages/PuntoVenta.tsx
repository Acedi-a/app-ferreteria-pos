// src/pages/PuntoVenta.tsx
import { useState } from "react";
import { useToast } from "../components/ui/use-toast";
import ProductGrid from "../components/punto-venta/ProductGrid";
import CartPanel from "../components/punto-venta/CartPanel";



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
}

/* ---------- datos de ejemplo ---------- */
const productosDisponibles: Producto[] = [
  {
    id: 1,
    codigo: "P001",
    codigoBarras: "1234567890",
    nombre: "Martillo de Carpintero",
    precio: 45.50,
    stock: 25,
    ventaFraccionada: false,
    unidadMedida: "unidad",
  },
  {
    id: 2,
    codigo: "P002",
    codigoBarras: "1234567891",
    nombre: "Cable Eléctrico por Metro",
    precio: 8.75,
    stock: 150,
    ventaFraccionada: true,
    unidadMedida: "metro",
  },
  {
    id: 3,
    codigo: "P003",
    codigoBarras: "1234567892",
    nombre: "Cemento Portland",
    precio: 35.00,
    stock: 8,
    ventaFraccionada: false,
    unidadMedida: "bolsa",
  },
  {
    id: 4,
    codigo: "P004",
    codigoBarras: "1234567893",
    nombre: "Destornillador Phillips",
    precio: 12.25,
    stock: 40,
    ventaFraccionada: false,
    unidadMedida: "unidad",
  },
  {
    id: 5,
    codigo: "P005",
    codigoBarras: "1234567894",
    nombre: "Tubo PVC 4 pulgadas",
    precio: 28.90,
    stock: 20,
    ventaFraccionada: true,
    unidadMedida: "metro",
  },
  {
    id: 6,
    codigo: "P006",
    codigoBarras: "1234567895",
    nombre: "Pintura Blanca",
    precio: 55.00,
    stock: 15,
    ventaFraccionada: false,
    unidadMedida: "galón",
  },
  {
    id: 7,
    codigo: "P007",
    codigoBarras: "1234567896",
    nombre: "Tornillos para Madera",
    precio: 18.50,
    stock: 100,
    ventaFraccionada: false,
    unidadMedida: "caja",
  },
  {
    id: 8,
    codigo: "P008",
    codigoBarras: "1234567897",
    nombre: "Alambre de Acero",
    precio: 3.25,
    stock: 200,
    ventaFraccionada: true,
    unidadMedida: "kilogramo",
  }
];

const clientes: Cliente[] = [
  { id: 1, nombre: "Juan Pérez", codigo: "C001" },
  { id: 2, nombre: "María García", codigo: "C002" },
  { id: 3, nombre: "Carlos López", codigo: "C003" },
  { id: 4, nombre: "Ana Rodríguez", codigo: "C004" },
];

/* ---------- componente principal ---------- */
export default function PuntoVenta() {
  const { toast } = useToast();
  
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

  /* ---------- lógica del carrito ---------- */
  const agregarProducto = (producto: Producto) => {
    const existente = productos.find((p) => p.id === producto.id);
    if (existente) {
      actualizarCantidad(producto.id, existente.cantidad + 1);
    } else {
      setProductos([
        ...productos,
        {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
          ventaFraccionada: producto.ventaFraccionada,
          unidadMedida: producto.unidadMedida,
        },
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

  const procesarVenta = () => {
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

    console.log("Venta procesada", { 
      productos, 
      clienteSeleccionado, 
      metodoPago, 
      descuento, 
      total, 
      ventaCredito, 
      observaciones 
    });
    
    toast({ 
      title: "Venta procesada", 
      description: `Total: Bs ${total.toFixed(2)}` 
    });
    
    // Limpiar el carrito
    setProductos([]);
    setClienteSeleccionado(null);
    setDescuento(0);
    setObservaciones("");
    setVentaCredito(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-sm text-gray-600">Gestiona tus ventas de forma rápida y eficiente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProductGrid
          productos={productosDisponibles}
          onAgregarProducto={agregarProducto}
          busqueda={busquedaProducto}
          onCambioBusqueda={setBusquedaProducto}
        />
      </div>

      {/* Panel del carrito flotante */}
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
  );
}