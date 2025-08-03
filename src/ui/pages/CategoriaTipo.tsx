import { useState, useEffect } from "react";
import { Plus, Folder, Ruler } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
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



const { toast } = useToast();

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
      toast({ title: "Error", description: "Error al cargar los datos" });
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
      toast({ title: "Error", description: "Error al cargar categorías" });
    }
  };

  const cargarTiposUnidad = async () => {
    try {
      const data = await categoriaTipoService.obtenerTiposUnidad();
      setTiposUnidad(data);
    } catch (error) {
      console.error("Error cargando tipos de unidad:", error);
      toast({ title: "Error", description: "Error al cargar tipos de unidad" });
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
      toast({ title: "Error", description: "El nombre de la categoría es obligatorio", variant: "destructive" });
      return;
    }

    try {
      // Validar nombre único
      const nombreValido = await categoriaTipoService.validarNombreCategoria(
        categoriaFormData.nombre!, 
        editingCategoria?.id
      );
      
      if (!nombreValido) {
        toast({ title: "Error", description: "Ya existe una categoría con ese nombre", variant: "destructive" });
        return;
      }

      if (editingCategoria) {
        // Actualizar categoría existente
        await categoriaTipoService.actualizarCategoria(editingCategoria.id!, categoriaFormData);
        toast({ title: "Éxito", description: "Categoría actualizada exitosamente", variant: "success" });
      } else {
        // Crear nueva categoría
        await categoriaTipoService.crearCategoria(categoriaFormData as Omit<CategoriaForm, 'id'>);
        toast({ title: "Éxito", description: "Categoría creada exitosamente", variant: "success" });
      }

      setShowCategoriaModal(false);
      await cargarCategorias();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error guardando categoría:", error);
      toast({ title: "Error", description: "Error al guardar la categoría", variant: "destructive" });
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      await categoriaTipoService.eliminarCategoria(id);
      toast({ title: "Éxito", description: "Categoría eliminada exitosamente", variant: "success" });
      await cargarCategorias();
      await cargarEstadisticas();
    } catch (error: any) {
      console.error("Error eliminando categoría:", error);
      toast({ title: "Error", description: error.message || "Error al eliminar la categoría", variant: "destructive" });
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
      toast({ title: "Error", description: "El nombre y la abreviación son obligatorios", variant: "destructive" });
      return;
    }

    try {
      // Validar nombre único
      const nombreValido = await categoriaTipoService.validarNombreTipoUnidad(
        tipoFormData.nombre!, 
        editingTipo?.id
      );
      
      if (!nombreValido) {
        toast({ title: "Error", description: "Ya existe un tipo de unidad con ese nombre", variant: "destructive" });
        return;
      }

      // Validar abreviación única
      const abreviacionValida = await categoriaTipoService.validarAbreviacionTipoUnidad(
        tipoFormData.abreviacion!, 
        editingTipo?.id
      );
      
      if (!abreviacionValida) {
        toast({ title: "Error", description: "Ya existe un tipo de unidad con esa abreviación", variant: "destructive" });
        return;
      }

      if (editingTipo) {
        // Actualizar tipo existente
        await categoriaTipoService.actualizarTipoUnidad(editingTipo.id!, tipoFormData);
        toast({ title: "Éxito", description: "Tipo de unidad actualizado exitosamente", variant: "success" });
      } else {
        // Crear nuevo tipo
        await categoriaTipoService.crearTipoUnidad(tipoFormData as Omit<TipoUnidadForm, 'id'>);
        toast({ title: "Éxito", description: "Tipo de unidad creado exitosamente", variant: "success" });
      }

      setShowTipoModal(false);
      await cargarTiposUnidad();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error guardando tipo de unidad:", error);
      toast({ title: "Error", description: "Error al guardar el tipo de unidad", variant: "destructive" });
    }
  };

  const handleDeleteTipo = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tipo de unidad?")) {
      return;
    }

    try {
      await categoriaTipoService.eliminarTipoUnidad(id);
      toast({ title: "Éxito", description: "Tipo de unidad eliminado exitosamente", variant: "success" });
      await cargarTiposUnidad();
      await cargarEstadisticas();
    } catch (error: any) {
      console.error("Error eliminando tipo de unidad:", error);
      toast({ title: "Error", description: error.message || "Error al eliminar el tipo de unidad", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header estilo macOS */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-light text-gray-900 tracking-tight">Categorías y Tipos de Unidad</h1>
              <p className="mt-2 text-base text-gray-600 font-light">Gestiona las categorías y unidades de medida de tus productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {/* Sección de Categorías */}
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50">
                  <Folder className="h-6 w-6 text-blue-500" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 tracking-tight">Categorías</h2>
              </div>
              <Button 
                onClick={handleNewCategoria}
                className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </div>

            <CategoriaStats stats={categoriaStats} />
            
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/50 bg-white/50">
                <h3 className="text-xl font-light text-gray-900 tracking-tight">Lista de Categorías</h3>
                <p className="mt-2 text-sm text-gray-600 font-light">Administra y visualiza todas las categorías</p>
              </div>
              <CategoriaTable
                categorias={categorias}
                loading={loading}
                onEdit={handleEditCategoria}
                onDelete={handleDeleteCategoria}
              />
            </div>
          </div>

          {/* Sección de Tipos de Unidad */}
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-green-50">
                  <Ruler className="h-6 w-6 text-green-500" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 tracking-tight">Tipos de Unidad</h2>
              </div>
              <Button 
                onClick={handleNewTipo}
                className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tipo
              </Button>
            </div>

            <TipoUnidadStats stats={tipoStats} />
            
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/50 bg-white/50">
                <h3 className="text-xl font-light text-gray-900 tracking-tight">Lista de Tipos de Unidad</h3>
                <p className="mt-2 text-sm text-gray-600 font-light">Administra y visualiza todos los tipos de unidad</p>
              </div>
              <TipoUnidadTable
                tiposUnidad={tiposUnidad}
                loading={loading}
                onEdit={handleEditTipo}
                onDelete={handleDeleteTipo}
              />
            </div>
          </div>
        </div>
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
