import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { AlertTriangle, FileText } from 'lucide-react';
import { VentasService, type Venta } from '../../services/ventas-service';
import { toast } from '../ui/use-toast';

interface CancelarVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventaId: number | null;
  onVentaCancelada: () => void;
}

export const CancelarVentaModal: React.FC<CancelarVentaModalProps> = ({
  isOpen,
  onClose,
  ventaId,
  onVentaCancelada,
}) => {
  const [venta, setVenta] = useState<Venta | null>(null);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (isOpen && ventaId) {
      cargarVenta();
    }
  }, [isOpen, ventaId]);

  const cargarVenta = async () => {
    if (!ventaId) return;
    
    setLoading(true);
    try {
      const ventaData = await VentasService.obtenerVentaPorId(ventaId);
      setVenta(ventaData);
    } catch (error) {
      console.error('Error al cargar venta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la venta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!venta) return;

    setCanceling(true);
    try {
      const motivoFinal = motivo.trim() || 'Cancelación manual';
      await VentasService.cancelarVenta(venta.id, motivoFinal);
      
      toast({
        title: 'Venta cancelada',
        description: `La venta ${venta.numero_venta} ha sido cancelada`,
      });
      
      onVentaCancelada();
      handleClose();
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la venta',
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    setVenta(null);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Cargando venta...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              disabled={canceling}
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

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={canceling}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCancelar}
            disabled={canceling}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {canceling ? "Cancelando..." : "Confirmar Cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelarVentaModal;