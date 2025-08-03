import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import type { CategoriaForm } from "../../services/categoria-tipo-service";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingCategoria: CategoriaForm | null;
  formData: Partial<CategoriaForm>;
  setFormData: (data: Partial<CategoriaForm>) => void;
}

export default function CategoriaModal({
  isOpen,
  onClose,
  onSubmit,
  editingCategoria,
  formData,
  setFormData
}: CategoriaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription>
                {editingCategoria ? "Modifica los datos de la categoría" : "Ingresa los datos de la nueva categoría"}
              </DialogDescription>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-xl p-2 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
              value={formData.nombre || ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Herramientas, Textiles, etc."
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
              placeholder="Descripción opcional de la categoría"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
            <input
              type="checkbox"
              id="activo"
              className="h-4 w-4 text-gray-600 focus:ring-gray-300/50 border-gray-300 rounded transition-all duration-200"
              checked={formData.activo !== false}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Categoría activa
            </label>
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
              {editingCategoria ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
