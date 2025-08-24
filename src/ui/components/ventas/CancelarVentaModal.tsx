// src/ui/components/ventas/CancelarVentaModal.tsx
import { useState } from "react";
import { AlertTriangle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import type { Venta } from "../../services/ventas-service";

interface CancelarVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  venta: Venta | null;
  loading?: boolean;
}

export default function CancelarVentaModal({
  isOpen,
  onClose,
  onConfirm,
  venta,
  loading = false
}: CancelarVentaModalProps) {
  const [motivo, setMotivo] = useState("");

  const handleSubmit = () => {
    const motivoFinal = motivo.trim() || "Cancelación manual";
    onConfirm(motivoFinal);
    onClose();
  };

  const handleClose = () => {
    setMotivo("");
    onClose();
  };

  if (!venta) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Cancelar Venta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">¿Está seguro de cancelar esta venta?</span>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p><strong>Número:</strong> {venta.numero_venta}</p>
              <p><strong>Total:</strong> Bs {venta.total.toFixed(2)}</p>
              <p><strong>Cliente:</strong> {venta.cliente_nombre || "Cliente general"}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Motivo de cancelación (opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ingrese el motivo de la cancelación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {motivo.length}/200 caracteres
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Esta acción restaurará el stock de los productos y no se puede deshacer.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Cancelando..." : "Confirmar Cancelación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}