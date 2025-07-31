import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, UserCheck, CreditCard, DollarSign, X } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  documento: string;
  tipo_documento: "cedula" | "nit" | "pasaporte";
  activo: boolean;
  fecha_creacion: string;
  saldo_pendiente: number;
  total_compras: number;
}

/* --- Datos --- */
const initialClients: Cliente[] = [
  {
    id: 1,
    codigo: "C001",
    nombre: "Juan Carlos",
    apellido: "Pérez González",
    telefono: "555-0123",
    email: "juan.perez@email.com",
    direccion: "Calle 123 #45-67",
    ciudad: "Bogotá",
    documento: "12345678",
    tipo_documento: "cedula",
    activo: true,
    fecha_creacion: "2024-01-15",
    saldo_pendiente: 150.75,
    total_compras: 2450.5,
  },
  {
    id: 2,
    codigo: "C002",
    nombre: "María Elena",
    apellido: "García López",
    telefono: "555-0124",
    email: "maria.garcia@email.com",
    direccion: "Carrera 89 #12-34",
    ciudad: "Medellín",
    documento: "87654321",
    tipo_documento: "cedula",
    activo: true,
    fecha_creacion: "2024-01-10",
    saldo_pendiente: 0,
    total_compras: 1875.25,
  },
  {
    id: 3,
    codigo: "C003",
    nombre: "Carlos Alberto",
    apellido: "López Martínez",
    telefono: "555-0125",
    email: "carlos.lopez@email.com",
    direccion: "Avenida 56 #78-90",
    ciudad: "Cali",
    documento: "11223344",
    tipo_documento: "cedula",
    activo: true,
    fecha_creacion: "2024-01-08",
    saldo_pendiente: 320.0,
    total_compras: 3200.75,
  },
  {
    id: 4,
    codigo: "C004",
    nombre: "Ana Patricia",
    apellido: "Martínez Rodríguez",
    telefono: "555-0126",
    email: "ana.martinez@email.com",
    direccion: "Calle 34 #56-78",
    ciudad: "Barranquilla",
    documento: "55667788",
    tipo_documento: "cedula",
    activo: false,
    fecha_creacion: "2024-01-05",
    saldo_pendiente: 0,
    total_compras: 890.5,
  },
];

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [clientes] = useState<Cliente[]>(initialClients);

  const filteredClients = clientes.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nombre.toLowerCase().includes(searchLower) ||
      client.apellido.toLowerCase().includes(searchLower) ||
      client.codigo.toLowerCase().includes(searchLower) ||
      client.documento.includes(searchTerm)
    );
  });

  const stats = {
    totalClientes: clientes.length,
    clientesActivos: clientes.filter((c) => c.activo).length,
    conSaldoPendiente: clientes.filter((c) => c.saldo_pendiente > 0).length,
    totalPorCobrar: clientes.reduce((sum, c) => sum + c.saldo_pendiente, 0),
  };

  const handleEdit = (client: Cliente) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este cliente?")) {
      console.log("Eliminar cliente:", id);
    }
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const ClientModal = () => (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {editingClient ? "Modifica la información del cliente" : "Ingresa los datos del nuevo cliente"}
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
                defaultValue={editingClient?.codigo || ""}
                placeholder="Ej: C001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Documento
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="cedula">Cédula</option>
                <option value="nit">NIT</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Número de Documento *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={editingClient?.documento || ""}
              placeholder="Número de documento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingClient?.nombre || ""}
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingClient?.apellido || ""}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingClient?.telefono || ""}
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
                defaultValue={editingClient?.email || ""}
                placeholder="correo@ejemplo.com"
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
              defaultValue={editingClient?.direccion || ""}
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
              defaultValue={editingClient?.ciudad || ""}
              placeholder="Ciudad"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              defaultChecked={editingClient?.activo !== false}
            />
            <label htmlFor="activo" className="text-sm text-slate-700">
              Cliente activo
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
            {editingClient ? "Actualizar" : "Guardar"}
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-sm text-slate-500">Administra la información de tus clientes</p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-slate-600">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.clientesActivos}</div>
            <p className="text-xs text-slate-600">Clientes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Saldo Pendiente</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.conSaldoPendiente}</div>
            <p className="text-xs text-slate-600">Clientes con deuda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalPorCobrar.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Saldo pendiente total</p>
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
                placeholder="Buscar por nombre, apellido, código o documento..."
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

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {client.nombre} {client.apellido}
                      </div>
                      <div className="text-sm text-slate-500">
                        Código: {client.codigo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{client.documento}</div>
                      <div className="text-sm text-slate-500 capitalize">
                        {client.tipo_documento}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{client.telefono}</div>
                      <div className="text-sm text-slate-500">{client.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{client.ciudad}</div>
                      <div className="text-sm text-slate-500">{client.direccion}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${client.total_compras.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        client.saldo_pendiente > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ${client.saldo_pendiente.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.activo ? "success" : "destructive"}>
                      {client.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(client)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(client.id)}
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

      {showModal && <ClientModal />}
    </div>
  );
}
