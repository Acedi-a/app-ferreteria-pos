    import { X } from "lucide-react";
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
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
            <div className="flex items-center justify-between">
                <div>
                <DialogTitle>
                    {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>
                <DialogDescription>
                    {editingClient ? "Modifica la información del cliente" : "Ingresa los datos del nuevo cliente"}
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
                    Código *
                </label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ej: C001"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Documento
                </label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.tipo_documento}
                    onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value as "cedula" | "nit" | "pasaporte" })}
                >
                    <option value="cedula">Cédula</option>
                    <option value="nit">NIT</option>
                    <option value="pasaporte">Pasaporte</option>
                </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de Documento *
                </label>
                <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                placeholder="Número de documento"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre *
                </label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Nombre"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido *
                </label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Apellido"
                />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono
                </label>
                <input
                    type="tel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Número de teléfono"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección
                </label>
                <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                Ciudad
                </label>
                <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ciudad"
                />
            </div>

            <div className="flex items-center space-x-2">
                <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <label htmlFor="activo" className="text-sm text-slate-700">
                Cliente activo
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
                {editingClient ? "Actualizar" : "Guardar"}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );
    }
