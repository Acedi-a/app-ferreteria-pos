import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Users, UserCheck, CreditCard, DollarSign, X } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";
import { ClientesService, type Cliente } from "../services/clientes-service";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesActivos: 0,
    conSaldoPendiente: 0,
    totalPorCobrar: 0,
  });
  const [formData, setFormData] = useState<{
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
  }>({
    codigo: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    documento: '',
    tipo_documento: 'cedula',
    activo: true
  });

  // Cargar datos al inicio y cuando se actualiza
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar clientes basado en búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      buscarClientes();
    } else {
      cargarClientes();
    }
  }, [searchTerm]);

  const cargarDatos = async () => {
    await Promise.all([cargarClientes(), cargarEstadisticas()]);
  };

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const clientesData = await ClientesService.obtenerTodos();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const estadisticas = await ClientesService.obtenerEstadisticas();
      setStats(estadisticas);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const buscarClientes = async () => {
    try {
      setLoading(true);
      const clientesData = await ClientesService.buscar(searchTerm);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clientes;

  const handleEdit = (client: Cliente) => {
    setEditingClient(client);
    setFormData({
      codigo: client.codigo,
      nombre: client.nombre,
      apellido: client.apellido || '',
      telefono: client.telefono || '',
      email: client.email || '',
      direccion: client.direccion || '',
      ciudad: client.ciudad || '',
      documento: client.documento || '',
      tipo_documento: client.tipo_documento,
      activo: client.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    if (window.confirm("¿Está seguro de eliminar este cliente?")) {
      try {
        await ClientesService.eliminar(id);
        await cargarDatos(); // Recargar datos
        alert('Cliente eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleNewClient = async () => {
    try {
      const nuevoCodigo = await ClientesService.generarCodigo();
      setEditingClient(null);
      setFormData({
        codigo: nuevoCodigo,
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        documento: '',
        tipo_documento: 'cedula',
        activo: true
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error al generar código:', error);
      alert('Error al generar código de cliente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      alert('El código y nombre son obligatorios');
      return;
    }

    try {
      // Verificar si el código ya existe
      const codigoExiste = await ClientesService.existeCodigo(
        formData.codigo, 
        editingClient?.id
      );
      
      if (codigoExiste) {
        alert('El código ya existe, por favor use otro');
        return;
      }

      if (editingClient) {
        // Actualizar cliente existente
        await ClientesService.actualizar(editingClient.id!, {
          codigo: formData.codigo,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          documento: formData.documento,
          tipo_documento: formData.tipo_documento,
          activo: formData.activo
        });
        alert('Cliente actualizado correctamente');
      } else {
        // Crear nuevo cliente
        await ClientesService.crear({
          codigo: formData.codigo,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          documento: formData.documento,
          tipo_documento: formData.tipo_documento,
          activo: formData.activo,
          saldo_pendiente: 0,
          total_compras: 0
        });
        alert('Cliente creado correctamente');
      }
      
      setShowModal(false);
      await cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

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
              onClick={() => {
                setSearchTerm("");
                cargarClientes();
              }}
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-slate-500">Cargando clientes...</div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-slate-500">
                {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
              </div>
            </div>
          ) : (
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
                          {client.nombre} {client.apellido || ''}
                        </div>
                        <div className="text-sm text-slate-500">
                          Código: {client.codigo}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{client.documento || 'N/A'}</div>
                        <div className="text-sm text-slate-500 capitalize">
                          {client.tipo_documento}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{client.telefono || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{client.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{client.ciudad || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{client.direccion || 'N/A'}</div>
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
          )}
        </CardContent>
      </Card>

      {/* Client Modal */}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ej: C001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Documento
                </label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value as "cedula" | "nit" | "pasaporte" })}
                >
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
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
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
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
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
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ciudad"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
              <label htmlFor="activo" className="text-sm text-slate-700">
                Cliente activo
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingClient ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
