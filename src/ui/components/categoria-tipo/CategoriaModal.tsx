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
      <DialogContent className="max-w-2xl">
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
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.nombre || ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Herramientas, Textiles, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional de la categoría"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              checked={formData.activo !== false}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            />
            <label htmlFor="activo" className="text-sm text-slate-700">
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
