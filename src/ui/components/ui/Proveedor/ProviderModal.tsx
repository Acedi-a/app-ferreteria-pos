import React from "react";
import { X, Phone, Building2, CreditCard, Factory } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../Dialog";
import { Button } from "../Button";
import { type Proveedor } from "../../../services/proveedores-service";

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProvider: Proveedor | null;
  formData: {
    codigo: string;
    nombre: string;
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    documento: string;
    activo: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    codigo: string;
    nombre: string;
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    documento: string;
    activo: boolean;
  }>>;
}

export function ProviderModal({ isOpen, onClose, onSubmit, editingProvider, formData, setFormData }: ProviderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm">
        <DialogHeader className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md">
                <Factory className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-medium text-gray-900">
                  {editingProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {editingProvider ? "Modifica la información del proveedor" : "Complete el formulario para registrar"}
                </DialogDescription>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-2 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <form id="provider-form" onSubmit={onSubmit} className="space-y-5 pt-4">
          {/* Identificación */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Identificación</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="P001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIT/Documento</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="NIT o documento"
                />
              </div>
            </div>
          </div>

          {/* Información Empresa */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Información de la Empresa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Persona de Contacto</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  placeholder="Nombre del contacto"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Información de Contacto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Ubicación y Estado */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Dirección completa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  placeholder="Ciudad"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 p-4 bg-white rounded-md border border-gray-200">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-gray-600 focus:ring-gray-400 border-gray-300 rounded transition-colors"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">Proveedor activo</label>
            </div>
          </div>
        </form>

        <DialogFooter>
          <div className="flex justify-end space-x-3 bg-white border-t border-gray-200 p-6 w-full">
            <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors rounded-md font-medium">Cancelar</Button>
            <Button type="submit" form="provider-form" className="px-4 py-2 bg-gray-900 hover:bg-black text-white transition-colors rounded-md font-medium">
              {editingProvider ? "Actualizar Proveedor" : "Registrar Proveedor"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
