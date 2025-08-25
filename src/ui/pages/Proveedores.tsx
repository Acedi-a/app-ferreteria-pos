import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "../components/ui/Button";
import { SearchBar } from "../components/ui/SearchBar";
import { ProviderModal } from "../components/ui/Proveedor/ProviderModal";
import { ProviderTable } from "../components/ui/Proveedor/ProviderTable";
import { ProviderStats } from "../components/ui/Proveedor/ProviderStats";
import { ProveedoresService, type Proveedor } from "../services/proveedores-service";
import { useToast } from "../components/ui/use-toast";

export default function Proveedores() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Proveedor | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProveedores: 0, proveedoresActivos: 0, totalCompras: 0, promedioCompra: 0 });
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    documento: "",
    activo: true,
  });

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { searchTerm.trim() ? buscar() : cargarLista(); }, [searchTerm]);

  const cargarDatos = async () => {
    await Promise.all([cargarLista(), cargarEstadisticas()]);
  };

  const cargarLista = async () => {
    try {
      setLoading(true);
      const data = await ProveedoresService.obtenerTodos();
      setProveedores(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Error al cargar proveedores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const s = await ProveedoresService.obtenerEstadisticas();
      setStats({ ...stats, totalProveedores: s.totalProveedores, proveedoresActivos: s.proveedoresActivos });
    } catch (e) { console.error(e); }
  };

  const buscar = async () => {
    try {
      setLoading(true);
      const data = await ProveedoresService.buscar(searchTerm);
      setProveedores(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleEdit = (prov: Proveedor) => {
    setEditingProvider(prov);
    setFormData({
      codigo: '',
      nombre: prov.nombre,
      contacto: '',
      telefono: prov.telefono || "",
      email: prov.email || "",
      direccion: prov.direccion || "",
      ciudad: prov.ciudad || "",
      documento: '',
      activo: prov.activo,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm("¿Está seguro de eliminar este proveedor?")) {
      try {
        await ProveedoresService.eliminar(id);
        await cargarDatos();
        toast({ title: "Éxito", description: "Proveedor eliminado", variant: "success" });
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
      }
    }
  };

  const handleNew = async () => {
    try {
      const codigo = await ProveedoresService.generarCodigo();
      setEditingProvider(null);
      setFormData({ codigo, nombre: "", contacto: "", telefono: "", email: "", direccion: "", ciudad: "", documento: "", activo: true });
      setShowModal(true);
    } catch (e) {
      toast({ title: "Error", description: "No se pudo generar código", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast({ title: "Validación", description: "Código y nombre son requeridos", variant: "destructive" });
      return;
    }

    try {
      // validar código único
      const existe = await ProveedoresService.existeCodigo(formData.codigo, editingProvider?.id);
      if (existe) {
        toast({ title: "Código duplicado", description: "Ya existe un proveedor con ese código", variant: "destructive" });
        return;
      }

      if (editingProvider?.id) {
        await ProveedoresService.actualizar(editingProvider.id, formData);
        toast({ title: "Actualizado", description: "Proveedor actualizado", variant: "success" });
      } else {
        await ProveedoresService.crear(formData);
        toast({ title: "Creado", description: "Proveedor registrado", variant: "success" });
      }
      setShowModal(false);
      await cargarDatos();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    }
  };

  const filteredProviders = proveedores; // server-side like filtering already applied

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
          <p className="text-sm text-slate-500">Administra la información de tus proveedores</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <ProviderStats totalProveedores={stats.totalProveedores} proveedoresActivos={stats.proveedoresActivos} totalCompras={stats.totalCompras} promedioCompra={stats.promedioCompra} />

      <SearchBar placeholder="Buscar por nombre, código, contacto o documento..." searchTerm={searchTerm} onSearchChange={setSearchTerm} onClear={() => setSearchTerm("")} />

      <ProviderTable providers={filteredProviders} loading={loading} searchTerm={searchTerm} onEdit={handleEdit} onDelete={handleDelete} />

      <ProviderModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmit} editingProvider={editingProvider} formData={formData} setFormData={setFormData} />
    </div>
  );
}
