import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import type { TipoUnidadForm } from "../../services/categoria-tipo-service";

interface TipoUnidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingTipo: TipoUnidadForm | null;
  formData: Partial<TipoUnidadForm>;
  setFormData: (data: Partial<TipoUnidadForm>) => void;
}

export default function TipoUnidadModal({
  isOpen,
  onClose,
  onSubmit,
  editingTipo,
  formData,
  setFormData
}: TipoUnidadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {editingTipo ? "Editar Tipo de Unidad" : "Nuevo Tipo de Unidad"}
              </DialogTitle>
              <DialogDescription>
                {editingTipo ? "Modifica los datos del tipo de unidad" : "Ingresa los datos del nuevo tipo de unidad"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Kilogramo, Metro, Litro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abreviación *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200"
                value={formData.abreviacion || ""}
                onChange={(e) => setFormData({ ...formData, abreviacion: e.target.value })}
                placeholder="Ej: kg, m, l"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional del tipo de unidad"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
            <input
              type="checkbox"
              id="activo_tipo"
              className="h-4 w-4 text-gray-600 focus:ring-gray-300/50 border-gray-300 rounded transition-all duration-200"
              checked={formData.activo !== false}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            />
            <label htmlFor="activo_tipo" className="text-sm font-medium text-gray-700">
              Tipo de unidad activo
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
              {editingTipo ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
