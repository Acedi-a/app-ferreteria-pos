// src/pages/PuntoVenta.tsx
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Calculator,
  Printer,
  User,
  CreditCard,
  Table,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import { Badge } from "../components/ui/Badge";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";

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

/* ---------- datos de ejemplo ---------- */
const productosDisponibles = [
  {
    id: 1,
    codigo: "P001",
    codigoBarras: "1234567890",
    nombre: "Producto A",
    precio: 25.5,
    stock: 100,
    ventaFraccionada: false,
    unidadMedida: "unidad",
  },
  {
    id: 2,
    codigo: "P002",
    codigoBarras: "1234567891",
    nombre: "Tela por Metro",
    precio: 15.75,
    stock: 50,
    ventaFraccionada: true,
    unidadMedida: "metro",
  },
  {
    id: 3,
    codigo: "P003",
    codigoBarras: "1234567892",
    nombre: "Arroz por Kg",
    precio: 3.25,
    stock: 200,
    ventaFraccionada: true,
    unidadMedida: "kilogramo",
  },
];

const clientes = [
  { id: 1, nombre: "Juan Pérez", codigo: "C001" },
  { id: 2, nombre: "María García", codigo: "C002" },
  { id: 3, nombre: "Carlos López", codigo: "C003" },
];

import { useToast } from "../components/ui/use-toast";

/* ---------- helpers para toasts (simplificado) ---------- */
// const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
//   alert(`${title}: ${description}`);
// };

/* ---------- componente principal ---------- */
  export default function PuntoVenta() {
    const { toast } = useToast();
    const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [ventaCredito, setVentaCredito] = useState(false);

  /* ---------- lógica ---------- */
  const agregarProducto = (producto: typeof productosDisponibles[0]) => {
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
    setBusquedaProducto("");
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

  const eliminarProducto = (id: number) =>
    setProductos(productos.filter((p) => p.id !== id));

  const subtotal = productos.reduce((s, p) => s + p.subtotal, 0);
  const total = subtotal - descuento;

  const procesarVenta = () => {
    if (productos.length === 0) {
      toast({ title: "Error", description: "Debe agregar al menos un producto", variant: "destructive" });
      return;
    }
    if (ventaCredito && !clienteSeleccionado) {
      toast({ title: "Error", description: "Debe seleccionar un cliente para venta a crédito", variant: "destructive" });
      return;
    }
    console.log("Venta procesada", { productos, clienteSeleccionado, metodoPago, descuento, total, ventaCredito, observaciones });
    toast({ title: "Venta procesada", description: `Total: $${total.toFixed(2)}` });
    setProductos([]);
    setClienteSeleccionado(null);
    setDescuento(0);
    setObservaciones("");
    setVentaCredito(false);
  };

  const imprimirTicket = () => {
    toast({ title: "Imprimiendo ticket", description: "Enviando ticket a la impresora..." });
  };

  const productosEncontrados = productosDisponibles.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigoBarras.includes(busquedaProducto)
  );

  /* ---------- render ---------- */
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-sm text-slate-500">Procesar nueva venta</p>
        </div>
      </div>

      {/* 2 columnas en lg */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ----------- columna izquierda ----------- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Buscar por nombre, código o código de barras..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {busquedaProducto && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-md border">
                  {productosEncontrados.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border-b p-3 last:border-0 hover:bg-slate-100 cursor-pointer"
                      onClick={() => agregarProducto(p)}
                    >
                      <div>
                        <p className="font-medium">{p.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {p.codigo} | Stock: {p.stock}
                          {p.ventaFraccionada && (
                            <Badge className="ml-2">{p.unidadMedida}</Badge>
                          )}
                        </p>
                      </div>
                      <span className="font-bold">${p.precio.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabla de productos agregados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Productos en Venta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productos.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No hay productos agregados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium">{p.nombre}</p>
                          <p className="text-xs text-slate-500">{p.codigo}</p>
                        </TableCell>
                        <TableCell>${p.precio.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => actualizarCantidad(p.id, p.cantidad - (p.ventaFraccionada ? 0.1 : 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <input
                              type="number"
                              value={p.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(p.id, Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-16 border border-slate-300 text-center text-sm rounded"
                              step={p.ventaFraccionada ? "0.1" : "1"}
                              min="0"
                            />
                            <Button
                              variant="outline"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => actualizarCantidad(p.id, p.cantidad + (p.ventaFraccionada ? 0.1 : 1))}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {p.ventaFraccionada && (
                            <p className="text-xs text-slate-500">{p.unidadMedida}</p>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">${p.subtotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" onClick={() => eliminarProducto(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ----------- columna derecha ----------- */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={clienteSeleccionado?.id ?? ""}
                onChange={(e) => {
                  const c = clientes.find((c) => c.id.toString() === e.target.value) ?? null;
                  setClienteSeleccionado(c);
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">Seleccionar cliente (opcional)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  id="venta-credito"
                  type="checkbox"
                  checked={ventaCredito}
                  onChange={(e) => setVentaCredito(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="venta-credito" className="text-sm font-medium">
                  Venta a crédito
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Método de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mixto">Mixto</option>
              </select>
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="descuento" className="text-sm font-medium">
                  Descuento:
                </label>
                <input
                  id="descuento"
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(Number.parseFloat(e.target.value) || 0)}
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm"
                  min="0"
                  step="0.01"
                />
              </div>

              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-sm font-medium">Observaciones:</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
              </div>

              <Button onClick={procesarVenta} className="w-full" disabled={productos.length === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Procesar Venta
              </Button>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={imprimirTicket}
                disabled={productos.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}