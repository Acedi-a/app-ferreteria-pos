import { useState } from "react";
import { Search, Plus, Edit, Trash2, Package, ImageIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";
import { Select } from "../components/ui/Select";

interface Producto {
  id: number;
  codigoBarras: string;
  codigoInterno: string;
  nombre: string;
  descripcion: string;
  costo: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  ventaFraccionada: boolean;
  unidadMedida: string;
  categoria: string;
  activo: boolean;
  fotos: string[];
}

/* --- Datos --- */
const initialProducts: Producto[] = [
  {
    id: 1,
    codigoBarras: "1234567890123",
    codigoInterno: "P001",
    nombre: "Producto Ejemplo A",
    descripcion: "Descripción del producto A",
    costo: 15,
    precioVenta: 25.5,
    stockActual: 100,
    stockMinimo: 10,
    ventaFraccionada: false,
    unidadMedida: "unidad",
    categoria: "Categoría 1",
    activo: true,
    fotos: [],
  },
  {
    id: 2,
    codigoBarras: "1234567890124",
    codigoInterno: "P002",
    nombre: "Tela Premium",
    descripcion: "Tela de alta calidad",
    costo: 8.5,
    precioVenta: 15.75,
    stockActual: 50,
    stockMinimo: 5,
    ventaFraccionada: true,
    unidadMedida: "metro",
    categoria: "Textiles",
    activo: true,
    fotos: [],
  },
];

const categorias = ["Categoría 1", "Textiles", "Electrónicos", "Hogar", "Deportes"];
const unidadesMedida = ["unidad", "metro", "kilogramo", "litro", "pieza", "caja"];

/* --- helpers --- */
const toast = (msg: string) => alert(msg);
const calcMargen = (costo: number, precio: number) =>
  costo === 0 ? "0" : (((precio - costo) / costo) * 100).toFixed(1);

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>(initialProducts);
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<Partial<Producto>>({});

  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoInterno.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoBarras.includes(busqueda) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const openDialog = (p?: Producto) => {
    setEditing(p ?? null);
    setForm(
      p
        ? p
        : {
            codigoBarras: "",
            codigoInterno: "",
            nombre: "",
            descripcion: "",
            costo: 0,
            precioVenta: 0,
            stockActual: 0,
            stockMinimo: 0,
            ventaFraccionada: false,
            unidadMedida: "unidad",
            categoria: "",
            activo: true,
            fotos: [],
          }
    );
    setDialogOpen(true);
  };

  const saveProduct = () => {
    if (!form.nombre || !form.codigoInterno) {
      toast("Nombre y código interno son obligatorios");
      return;
    }
    const prod = { ...form, id: editing?.id ?? Math.max(...productos.map((p) => p.id), 0) + 1 } as Producto;
    setProductos(editing ? productos.map((p) => (p.id === prod.id ? prod : p)) : [...productos, prod]);
    toast(editing ? "Producto actualizado" : "Producto creado");
    setDialogOpen(false);
  };

  const deleteProduct = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id));
    toast("Producto eliminado");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-slate-500">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pl-8 text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Lista de Productos ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Margen</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.codigoInterno}</p>
                    <p className="text-xs text-slate-500">{p.codigoBarras}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.descripcion}</p>
                    {p.ventaFraccionada && <Badge className="mt-1">{p.unidadMedida}</Badge>}
                  </TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell>${p.costo.toFixed(2)}</TableCell>
                  <TableCell>${p.precioVenta.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge>{calcMargen(p.costo, p.precioVenta)}%</Badge>
                  </TableCell>
                  <TableCell>
                    <p className={p.stockActual <= p.stockMinimo ? "text-red-600 font-medium" : ""}>
                      {p.stockActual}
                    </p>
                    <p className="text-xs text-slate-500">Min: {p.stockMinimo}</p>
                  </TableCell>
                  <TableCell>
                    <Badge >
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => openDialog(p)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost"  onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {editing ? "Modifica los datos del producto" : "Ingresa los datos del nuevo producto"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <input
              placeholder="Código Interno *"
              value={form.codigoInterno || ""}
              onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })}
              className="rounded border px-3 py-2"
            />
            <input
              placeholder="Código de Barras"
              value={form.codigoBarras || ""}
              onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
              className="rounded border px-3 py-2"
            />
            <input
              placeholder="Nombre *"
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="rounded border px-3 py-2"
            />
            <textarea
              placeholder="Descripción"
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              className="rounded border px-3 py-2"
            />
            <Select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={form.unidadMedida}
              onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
            >
              {unidadesMedida.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
            <input
              type="number"
              placeholder="Costo"
              value={form.costo || ""}
              onChange={(e) => setForm({ ...form, costo: Number(e.target.value) })}
              className="rounded border px-3 py-2"
            />
            <input
              type="number"
              placeholder="Precio de Venta"
              value={form.precioVenta || ""}
              onChange={(e) => setForm({ ...form, precioVenta: Number(e.target.value) })}
              className="rounded border px-3 py-2"
            />
            <input
              type="number"
              placeholder="Stock Actual"
              value={form.stockActual || ""}
              onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })}
              className="rounded border px-3 py-2"
            />
            <input
              type="number"
              placeholder="Stock Mínimo"
              value={form.stockMinimo || ""}
              onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
              className="rounded border px-3 py-2"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ventaFraccionada"
                checked={form.ventaFraccionada}
                onChange={(e) => setForm({ ...form, ventaFraccionada: e.target.checked })}
              />
              <label htmlFor="ventaFraccionada">Permitir venta fraccionada</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              <label htmlFor="activo">Producto activo</label>
            </div>
            {/* fotos placeholder */}
            <div className="rounded border-2 border-dashed p-4 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm">Subir fotos (placeholder)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProduct}>
              {editing ? "Actualizar" : "Crear"} Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}