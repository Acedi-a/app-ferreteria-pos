import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "../components/ui/Button";
import { ClientesService, type Cliente } from "../services/clientes-service";
import { ClientModal } from "../components/ui/Cliente/ClientModal";
import { ClientStats } from "../components/ui/Cliente/ClientStats";
import { ClientTable } from "../components/ui/Cliente/ClientTable";
import { SearchBar } from "../components/ui/SearchBar";
import { useToast } from "../components/ui/use-toast";

export default function Clientes() {
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Error al cargar los clientes",
        variant: "destructive"
      });
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
        toast({
          title: "Éxito",
          description: "Cliente eliminado correctamente",
          variant: "success"
        });
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        toast({
          title: "Error",
          description: "Error al eliminar el cliente",
          variant: "destructive"
        });
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
      toast({
        title: "Error",
        description: "Error al generar código de cliente",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast({
        title: "Error de validación",
        description: "El código y nombre son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar si el código ya existe
      const codigoExiste = await ClientesService.existeCodigo(
        formData.codigo, 
        editingClient?.id
      );
      
      if (codigoExiste) {
        toast({
          title: "Error de validación",
          description: "El código ya existe, por favor use otro",
          variant: "destructive"
        });
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
        toast({
          title: "Éxito",
          description: "Cliente actualizado correctamente",
          variant: "success"
        });
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
        toast({
          title: "Éxito",
          description: "Cliente creado correctamente",
          variant: "success"
        });
      }
      
      // Resetear formulario y cerrar modal
      setShowModal(false);
      setEditingClient(null);
      setFormData({
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
      await cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast({
        title: "Error",
        description: "Error al guardar el cliente",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header estilo macOS */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-light text-gray-900 tracking-tight">Clientes</h1>
              <p className="mt-2 text-base text-gray-600 font-light">Gestiona tu cartera de clientes</p>
            </div>
            <Button 
              onClick={handleNewClient}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Estadísticas */}
          <ClientStats stats={stats} />

          {/* Barra de búsqueda */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClear={() => {
                  setSearchTerm("");
                  cargarClientes();
                }}
                placeholder="Buscar clientes..."
              />
            </div>
          </div>

          {/* Tabla de clientes */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50 bg-white/50">
              <h2 className="text-xl font-light text-gray-900 tracking-tight">Lista de Clientes</h2>
              <p className="mt-2 text-sm text-gray-600 font-light">Administra y visualiza todos tus clientes</p>
            </div>
            
            {/* Table Content */}
            <ClientTable
              clients={filteredClients}
              loading={loading}
              searchTerm={searchTerm}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
          setFormData({
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
        }}
        onSubmit={handleSubmit}
        editingClient={editingClient}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
