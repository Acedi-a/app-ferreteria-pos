import { useState } from "react";
import { Search, Plus, Edit, Trash2, Warehouse, Building, DollarSign, TrendingUp, X } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

interface Proveedor {
  id: number;
  codigo: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  documento: string;
  activo: boolean;
  fecha_creacion: string;
  total_compras: number;
  ultima_compra: string;
}

/* --- Datos --- */
const initialProviders: Proveedor[] = [
  {
    id: 1,
    codigo: "PROV001",
    nombre: "Ferretería Industrial S.A.S.",
    contacto: "Carlos Mendoza",
    telefono: "601-234-5678",
    email: "ventas@ferreteriaind.com",
    direccion: "Calle 45 #23-67",
    ciudad: "Bogotá",
    documento: "900123456-7",
    activo: true,
    fecha_creacion: "2024-01-15",
    total_compras: 15420.75,
    ultima_compra: "2024-01-18",
  },
  {
    id: 2,
    codigo: "PROV002",
    nombre: "Distribuidora Eléctrica del Norte",
    contacto: "Ana Patricia Ruiz",
    telefono: "604-567-8901",
    email: "pedidos@electricanorte.com",
    direccion: "Carrera 78 #45-12",
    ciudad: "Medellín",
    documento: "800987654-3",
    activo: true,
    fecha_creacion: "2024-01-10",
    total_compras: 8750.5,
    ultima_compra: "2024-01-16",
  },
  {
    id: 3,
    codigo: "PROV003",
    nombre: "Pinturas y Acabados Ltda.",
    contacto: "Miguel Ángel Torres",
    telefono: "602-345-6789",
    email: "comercial@pinturasacabados.com",
    direccion: "Avenida 6 #34-89",
    ciudad: "Cali",
    documento: "890456123-1",
    activo: true,
    fecha_creacion: "2024-01-08",
    total_compras: 12300.25,
    ultima_compra: "2024-01-15",
  },
  {
    id: 4,
    codigo: "PROV004",
    nombre: "Suministros de Construcción",
    contacto: "Laura Jiménez",
    telefono: "605-678-9012",
    email: "info@sumiconstruccion.com",
    direccion: "Calle 12 #56-34",
    ciudad: "Barranquilla",
    documento: "901234567-8",
    activo: false,
    fecha_creacion: "2024-01-05",
    total_compras: 5680.0,
    ultima_compra: "2024-01-10",
  },
];

export default function Proveedores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Proveedor | null>(null);
  const [proveedores] = useState<Proveedor[]>(initialProviders);

  const filteredProviders = proveedores.filter((provider) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      provider.nombre.toLowerCase().includes(searchLower) ||
      provider.codigo.toLowerCase().includes(searchLower) ||
      provider.contacto.toLowerCase().includes(searchLower) ||
      provider.documento.includes(searchTerm)
    );
  });

  const stats = {
    totalProveedores: proveedores.length,
    proveedoresActivos: proveedores.filter((p) => p.activo).length,
    totalCompras: proveedores.reduce((sum, p) => sum + p.total_compras, 0),
    promedioCompra: proveedores.reduce((sum, p) => sum + p.total_compras, 0) / proveedores.length,
  };

  const handleEdit = (provider: Proveedor) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este proveedor?")) {
      console.log("Eliminar proveedor:", id);
    }
  };

  const handleNewProvider = () => {
    setEditingProvider(null);
    setShowModal(true);
  };

  const ProviderModal = () => (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {editingProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <DialogDescription>
                {editingProvider ? "Modifica la información del proveedor" : "Ingresa los datos del nuevo proveedor"}
              </DialogDescription>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingProvider?.codigo || ""}
                placeholder="Ej: PROV001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                NIT/Documento *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingProvider?.documento || ""}
                placeholder="NIT o documento"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={editingProvider?.nombre || ""}
              placeholder="Nombre completo de la empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Persona de Contacto
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={editingProvider?.contacto || ""}
              placeholder="Nombre del contacto principal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingProvider?.telefono || ""}
                placeholder="Número de teléfono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingProvider?.email || ""}
                placeholder="correo@empresa.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={editingProvider?.direccion || ""}
              placeholder="Dirección completa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={editingProvider?.ciudad || ""}
              placeholder="Ciudad"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              defaultChecked={editingProvider?.activo !== false}
            />
            <label htmlFor="activo" className="text-sm text-slate-700">
              Proveedor activo
            </label>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </Button>
          <Button>
            {editingProvider ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
          <p className="text-sm text-slate-500">Administra la información de tus proveedores</p>
        </div>
        <Button onClick={handleNewProvider}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Warehouse className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProveedores}</div>
            <p className="text-xs text-slate-600">Proveedores registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.proveedoresActivos}</div>
            <p className="text-xs text-slate-600">Proveedores activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalCompras.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Volumen total de compras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Compra</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${stats.promedioCompra.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Promedio por proveedor</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, código, contacto o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{provider.nombre}</div>
                      <div className="text-sm text-slate-500">
                        Código: {provider.codigo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{provider.documento}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{provider.contacto}</div>
                      <div className="text-sm text-slate-500">{provider.telefono}</div>
                      <div className="text-sm text-slate-500">{provider.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{provider.ciudad}</div>
                      <div className="text-sm text-slate-500">{provider.direccion}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${provider.total_compras.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">
                      {new Date(provider.ultima_compra).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={provider.activo ? "success" : "destructive"}>
                      {provider.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(provider)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(provider.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && <ProviderModal />}
    </div>
  );
}
