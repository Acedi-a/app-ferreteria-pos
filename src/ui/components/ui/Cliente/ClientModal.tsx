import React from "react";
import { X, User, Phone, Mail, MapPin, Building2, CreditCard, FileText, Shield, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../Dialog";
import { Button } from "../Button";
import { type Cliente } from "../../../services/clientes-service";

    interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingClient: Cliente | null;
    formData: {
        codigo: string;
        nombre: string;
        apellido: string;
        telefono: string;
        email: string;
        direccion: string;
        ciudad: string;
        documento: string;
        tipo_documento: "cedula" | "nit" | "pasaporte";
        activo: boolean;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        codigo: string;
        nombre: string;
        apellido: string;
        telefono: string;
        email: string;
        direccion: string;
        ciudad: string;
        documento: string;
        tipo_documento: "cedula" | "nit" | "pasaporte";
        activo: boolean;
    }>>;
    }

    export function ClientModal({
    isOpen,
    onClose,
    onSubmit,
    editingClient,
    formData,
    setFormData
    }: ClientModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm">
            <DialogHeader className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-medium text-gray-900">
                            {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            {editingClient ? "Modifica la información del cliente" : "Complete el formulario para registrar"}
                        </DialogDescription>
                    </div>
                </div>
                <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-2 transition-colors"
                >
                <X className="h-4 w-4" />
                </button>
            </div>
            </DialogHeader>

            <form id="client-form" onSubmit={onSubmit} className="space-y-5 pt-4">
            {/* Sección de Identificación */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">Información de Identificación</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código del Cliente *
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            placeholder="CLI-001"
                            required
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento *
                    </label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select 
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 appearance-none"
                            value={formData.tipo_documento}
                            onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value as "cedula" | "nit" | "pasaporte" })}
                        >
                            <option value="cedula">Cédula de Identidad</option>
                            <option value="nit">NIT (Número de Identificación Tributaria)</option>
                            <option value="pasaporte">Pasaporte</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento *
                    </label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                        value={formData.documento}
                        onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                        placeholder="Número de documento"
                        />
                    </div>
                    </div>
                </div>
            </div>

            {/* Sección de Información Personal */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Nombre"
                            required
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                            value={formData.apellido}
                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                            placeholder="Apellido"
                        />
                    </div>
                    </div>
                </div>
            </div>

            {/* Sección de Información de Contacto */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                        <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">Información de Contacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="tel"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            placeholder="+591 70123456"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="cliente@ejemplo.com"
                        />
                    </div>
                    </div>
                </div>
            </div>

            {/* Sección de Ubicación */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                        <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">Información de Ubicación</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2.5 border-0 bg-gray-50/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:bg-white transition-all duration-300 shadow-sm backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Dirección completa"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2.5 border-0 bg-gray-50/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:bg-white transition-all duration-300 shadow-sm backdrop-blur-sm text-gray-900 placeholder-gray-400"
                        value={formData.ciudad}
                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                        placeholder="Ciudad"
                        />
                    </div>
                    </div>
                </div>
            </div>

            {/* Sección de Estado */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                        <Shield className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">Estado del Cliente</h3>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white rounded-md border border-gray-200">
                    <input
                    type="checkbox"
                    id="activo"
                    className="h-4 w-4 text-gray-600 focus:ring-gray-400 border-gray-300 rounded transition-colors"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Cliente activo en el sistema
                    </label>
                    <div className={`ml-auto px-3 py-1 rounded-md text-sm font-medium ${
                        formData.activo 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {formData.activo ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
            </div>
            </form>
            
            <DialogFooter>
                <div className="flex justify-end space-x-3 bg-white border-t border-gray-200 p-6 w-full">
                    <Button 
                    type="button"
                    variant="outline" 
                    onClick={onClose}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors rounded-md font-medium"
                    >
                    Cancelar
                    </Button>
                    <Button 
                    type="submit"
                    form="client-form"
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white transition-colors rounded-md font-medium"
                    >
                    {editingClient ? "Actualizar Cliente" : "Registrar Cliente"}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}
