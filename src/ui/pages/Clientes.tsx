import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "../components/ui/Button";
import { ClientesService, type Cliente } from "../services/clientes-service";
import { ClientModal } from "../components/ui/Cliente/ClientModal";
import { ClientStats } from "../components/ui/Cliente/ClientStats";
import { ClientTable } from "../components/ui/Cliente/ClientTable";
import { SearchBar } from "../components/ui/SearchBar";

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
      <ClientStats stats={stats} />

      {/* Search */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => {
          setSearchTerm("");
          cargarClientes();
        }}
        placeholder="Buscar por nombre, apellido, código o documento..."
      />

      {/* Clients Table */}
      <ClientTable
        clients={filteredClients}
        loading={loading}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Client Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingClient={editingClient}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
