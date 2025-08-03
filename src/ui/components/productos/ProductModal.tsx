import { X, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import type { Producto, Categoria, TipoUnidad } from "../../services/productos-service";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProduct: Producto | null;
  formData: Partial<Producto>;
  setFormData: (data: Partial<Producto>) => void;
  categorias: Categoria[];
  tiposUnidad: TipoUnidad[];
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  formData,
  setFormData,
  categorias,
  tiposUnidad
}: ProductModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modifica los datos del producto" : "Ingresa los datos del nuevo producto"}
              </DialogDescription>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100/50 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Interno *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.codigo_interno || ""}
                onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
                placeholder="Ej: P001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.codigo_barras || ""}
                onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                placeholder="Código de barras del producto"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
              value={formData.nombre || ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select
                value={formData.categoria_id?.toString() || ""}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <Select
                value={formData.tipo_unidad_id?.toString() || ""}
                onChange={(e) => setFormData({ ...formData, tipo_unidad_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Seleccionar unidad</option>
                {tiposUnidad.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre} ({tipo.abreviacion})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.costo || ""}
                onChange={(e) => setFormData({ ...formData, costo: Number(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.precio_venta || ""}
                onChange={(e) => setFormData({ ...formData, precio_venta: Number(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Actual *
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.stock_actual || ""}
                onChange={(e) => setFormData({ ...formData, stock_actual: Number(e.target.value) })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.stock_minimo || ""}
                onChange={(e) => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="venta_fraccionada"
                className="h-4 w-4 text-gray-600 focus:ring-gray-300 border-gray-300 rounded-md"
                checked={formData.venta_fraccionada || false}
                onChange={(e) => setFormData({ ...formData, venta_fraccionada: e.target.checked })}
              />
              <label htmlFor="venta_fraccionada" className="text-sm text-gray-700 font-medium">
                Permitir venta fraccionada
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-gray-600 focus:ring-gray-300 border-gray-300 rounded-md"
                checked={formData.activo !== false}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
              <label htmlFor="activo" className="text-sm text-gray-700 font-medium">
                Producto activo
              </label>
            </div>
          </div>

          {/* Placeholder para fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos del Producto
            </label>
            <div className="rounded-2xl border-2 border-dashed border-gray-200/50 p-8 text-center bg-gray-50/30 backdrop-blur-sm">
              <div className="bg-white/80 rounded-2xl p-4 w-fit mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Subir fotos (próximamente)</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingProduct ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
