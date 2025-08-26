import React, { useState, useEffect } from "react";
import { Plus, Users, Building2, Shield, TrendingUp } from "lucide-react";

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
    genero?: 'masculino' | 'femenino' | 'otro' | 'no_especificado';
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
    genero: 'no_especificado',
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

  // Exponer función para actualizar estadísticas globalmente
  useEffect(() => {
    // Crear función global para actualizar estadísticas desde otras páginas
    (window as any).actualizarEstadisticasClientes = cargarEstadisticas;
    
    // Limpiar al desmontar
    return () => {
      delete (window as any).actualizarEstadisticasClientes;
    };
  }, []);

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
      genero: client.genero || 'no_especificado',
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
        genero: 'no_especificado',
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
    
    // Validaciones mínimas requeridas
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.telefono.trim() || !formData.documento.trim() || !formData.genero) {
      toast({
        title: "Error de validación",
        description: "Nombre, apellido, teléfono, documento y género son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar si el código ya existe (aunque se autogenere)
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
          genero: formData.genero,
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
          genero: formData.genero,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          documento: formData.documento,
          tipo_documento: formData.tipo_documento,
          activo: formData.activo,
          saldo_pendiente: 0
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
        genero: 'no_especificado',
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
      {/* Header Profesional con Branding */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Gestión de Clientes</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Sistema empresarial de administración de clientes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded border border-gray-200">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Sistema Seguro</span>
              </div>
              <Button 
                onClick={handleNewClient}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Cliente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Panel de Estadísticas Mejorado */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Panel de Control</h2>
                  <p className="text-sm text-gray-600">Métricas y estadísticas en tiempo real</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">En línea</span>
              </div>
            </div>
            <ClientStats stats={stats} />
          </div>

          {/* Sección de Búsqueda Mejorada */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Directorio de Clientes</h3>
                <p className="text-sm text-gray-600">Busca y administra tu cartera de clientes</p>
              </div>
              <div className="w-full sm:w-96">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onClear={() => {
                    setSearchTerm("");
                    cargarClientes();
                  }}
                  placeholder="Buscar por nombre, código o documento..."
                />
              </div>
            </div>
          </div>

          {/* Tabla de clientes con diseño empresarial */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Registro de Clientes</h2>
                    <p className="text-sm text-gray-600">Gestión completa de información comercial</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">{filteredClients.length}</span>
                  <span>cliente{filteredClients.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
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
            genero: 'no_especificado',
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
