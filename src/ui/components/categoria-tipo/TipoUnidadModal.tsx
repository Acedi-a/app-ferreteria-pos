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
      <DialogContent className="max-w-2xl">
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
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Kilogramo, Metro, Litro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Abreviación *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.abreviacion || ""}
                onChange={(e) => setFormData({ ...formData, abreviacion: e.target.value })}
                placeholder="Ej: kg, m, l"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional del tipo de unidad"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo_tipo"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              checked={formData.activo !== false}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            />
            <label htmlFor="activo_tipo" className="text-sm text-slate-700">
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
