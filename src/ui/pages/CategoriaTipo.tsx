import { useState, useEffect } from "react";
import { Plus, Folder, Ruler } from "lucide-react";

import { Button } from "../components/ui/Button";
import CategoriaStats from "../components/categoria-tipo/CategoriaStats";
import TipoUnidadStats from "../components/categoria-tipo/TipoUnidadStats";
import CategoriaTable from "../components/categoria-tipo/CategoriaTable";
import TipoUnidadTable from "../components/categoria-tipo/TipoUnidadTable";
import CategoriaModal from "../components/categoria-tipo/CategoriaModal";
import TipoUnidadModal from "../components/categoria-tipo/TipoUnidadModal";
import { categoriaTipoService } from "../services/categoria-tipo-service";
import type { 
  CategoriaForm, 
  TipoUnidadForm, 
  CategoriaStats as CategoriaStatsType,
  TipoUnidadStats as TipoUnidadStatsType
} from "../services/categoria-tipo-service";

export default function CategoriaTipo() {
  const [categorias, setCategorias] = useState<CategoriaForm[]>([]);
  const [tiposUnidad, setTiposUnidad] = useState<TipoUnidadForm[]>([]);
  const [categoriaStats, setCategoriaStats] = useState<CategoriaStatsType>({
    totalCategorias: 0,
    categoriasActivas: 0,
    productosAsignados: 0
  });
  const [tipoStats, setTipoStats] = useState<TipoUnidadStatsType>({
    totalTipos: 0,
    tiposActivos: 0,
    productosAsignados: 0
  });
  
  const [loading, setLoading] = useState(false);
  
  // Estados para categorías
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaForm | null>(null);
  const [categoriaFormData, setCategoriaFormData] = useState<Partial<CategoriaForm>>({});
  
  // Estados para tipos de unidad
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoUnidadForm | null>(null);
  const [tipoFormData, setTipoFormData] = useState<Partial<TipoUnidadForm>>({});

  const toast = (msg: string) => {
    alert(msg); // Reemplazar con toast real más adelante
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarCategorias(),
        cargarTiposUnidad(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await categoriaTipoService.obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      toast("Error al cargar categorías");
    }
  };

  const cargarTiposUnidad = async () => {
    try {
      const data = await categoriaTipoService.obtenerTiposUnidad();
      setTiposUnidad(data);
    } catch (error) {
      console.error("Error cargando tipos de unidad:", error);
      toast("Error al cargar tipos de unidad");
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const [categoriaStatsData, tipoStatsData] = await Promise.all([
        categoriaTipoService.obtenerEstadisticasCategorias(),
        categoriaTipoService.obtenerEstadisticasTipos()
      ]);
      setCategoriaStats(categoriaStatsData);
      setTipoStats(tipoStatsData);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  // Funciones para Categorías
  const handleNewCategoria = () => {
    setEditingCategoria(null);
    setCategoriaFormData({
      nombre: "",
      descripcion: "",
      activo: true
    });
    setShowCategoriaModal(true);
  };

  const handleEditCategoria = (categoria: CategoriaForm) => {
    setEditingCategoria(categoria);
    setCategoriaFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
      activo: categoria.activo
    });
    setShowCategoriaModal(true);
  };

  const handleSubmitCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoriaFormData.nombre) {
      toast("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      // Validar nombre único
      const nombreValido = await categoriaTipoService.validarNombreCategoria(
        categoriaFormData.nombre!, 
        editingCategoria?.id
      );
      
      if (!nombreValido) {
        toast("Ya existe una categoría con ese nombre");
        return;
      }

      if (editingCategoria) {
        // Actualizar categoría existente
        await categoriaTipoService.actualizarCategoria(editingCategoria.id!, categoriaFormData);
        toast("Categoría actualizada exitosamente");
      } else {
        // Crear nueva categoría
        await categoriaTipoService.crearCategoria(categoriaFormData as Omit<CategoriaForm, 'id'>);
        toast("Categoría creada exitosamente");
      }

      setShowCategoriaModal(false);
      await cargarCategorias();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error guardando categoría:", error);
      toast("Error al guardar la categoría");
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      await categoriaTipoService.eliminarCategoria(id);
      toast("Categoría eliminada exitosamente");
      await cargarCategorias();
      await cargarEstadisticas();
    } catch (error: any) {
      console.error("Error eliminando categoría:", error);
      toast(error.message || "Error al eliminar la categoría");
    }
  };

  // Funciones para Tipos de Unidad
  const handleNewTipo = () => {
    setEditingTipo(null);
    setTipoFormData({
      nombre: "",
      abreviacion: "",
      descripcion: "",
      activo: true
    });
    setShowTipoModal(true);
  };

  const handleEditTipo = (tipo: TipoUnidadForm) => {
    setEditingTipo(tipo);
    setTipoFormData({
      nombre: tipo.nombre,
      abreviacion: tipo.abreviacion,
      descripcion: tipo.descripcion || "",
      activo: tipo.activo
    });
    setShowTipoModal(true);
  };

  const handleSubmitTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoFormData.nombre || !tipoFormData.abreviacion) {
      toast("El nombre y la abreviación son obligatorios");
      return;
    }

    try {
      // Validar nombre único
      const nombreValido = await categoriaTipoService.validarNombreTipoUnidad(
        tipoFormData.nombre!, 
        editingTipo?.id
      );
      
      if (!nombreValido) {
        toast("Ya existe un tipo de unidad con ese nombre");
        return;
      }

      // Validar abreviación única
      const abreviacionValida = await categoriaTipoService.validarAbreviacionTipoUnidad(
        tipoFormData.abreviacion!, 
        editingTipo?.id
      );
      
      if (!abreviacionValida) {
        toast("Ya existe un tipo de unidad con esa abreviación");
        return;
      }

      if (editingTipo) {
        // Actualizar tipo existente
        await categoriaTipoService.actualizarTipoUnidad(editingTipo.id!, tipoFormData);
        toast("Tipo de unidad actualizado exitosamente");
      } else {
        // Crear nuevo tipo
        await categoriaTipoService.crearTipoUnidad(tipoFormData as Omit<TipoUnidadForm, 'id'>);
        toast("Tipo de unidad creado exitosamente");
      }

      setShowTipoModal(false);
      await cargarTiposUnidad();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error guardando tipo de unidad:", error);
      toast("Error al guardar el tipo de unidad");
    }
  };

  const handleDeleteTipo = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tipo de unidad?")) {
      return;
    }

    try {
      await categoriaTipoService.eliminarTipoUnidad(id);
      toast("Tipo de unidad eliminado exitosamente");
      await cargarTiposUnidad();
      await cargarEstadisticas();
    } catch (error: any) {
      console.error("Error eliminando tipo de unidad:", error);
      toast(error.message || "Error al eliminar el tipo de unidad");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías y Tipos de Unidad</h1>
          <p className="text-sm text-slate-500">Gestiona las categorías y unidades de medida de tus productos</p>
        </div>
      </div>

      {/* Sección de Categorías */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Categorías</h2>
          </div>
          <Button onClick={handleNewCategoria}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>

        <CategoriaStats stats={categoriaStats} />
        <CategoriaTable
          categorias={categorias}
          loading={loading}
          onEdit={handleEditCategoria}
          onDelete={handleDeleteCategoria}
        />
      </div>

      {/* Sección de Tipos de Unidad */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Tipos de Unidad</h2>
          </div>
          <Button onClick={handleNewTipo}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tipo
          </Button>
        </div>

        <TipoUnidadStats stats={tipoStats} />
        <TipoUnidadTable
          tiposUnidad={tiposUnidad}
          loading={loading}
          onEdit={handleEditTipo}
          onDelete={handleDeleteTipo}
        />
      </div>

      {/* Modales */}
      <CategoriaModal
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSubmit={handleSubmitCategoria}
        editingCategoria={editingCategoria}
        formData={categoriaFormData}
        setFormData={setCategoriaFormData}
      />

      <TipoUnidadModal
        isOpen={showTipoModal}
        onClose={() => setShowTipoModal(false)}
        onSubmit={handleSubmitTipo}
        editingTipo={editingTipo}
        formData={tipoFormData}
        setFormData={setTipoFormData}
      />
    </div>
  );
}
