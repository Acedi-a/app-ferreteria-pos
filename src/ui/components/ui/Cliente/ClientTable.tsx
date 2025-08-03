import { Edit, Trash2 } from "lucide-react";

import { Button } from "../Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Table";

import { type Cliente } from "../../../services/clientes-service";

    interface ClientTableProps {
    clients: Cliente[];
    loading: boolean;
    searchTerm: string;
    onEdit: (client: Cliente) => void;
    onDelete: (id: number | undefined) => void;
    }

    export function ClientTable({ clients, loading, searchTerm, onEdit, onDelete }: ClientTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-500 mx-auto"></div>
                    <p className="mt-4 text-base font-medium text-gray-600 text-center">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="bg-gray-100/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 text-center">
                    <p className="text-gray-700 text-xl font-medium">{searchTerm ? `No hay resultados para "${searchTerm}"` : "No hay clientes registrados"}</p>
                    <p className="text-gray-500 text-base font-light mt-2">{searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer cliente"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50">
            <Table className="table-auto w-full">
            <TableHeader>
                <TableRow className="border-b border-gray-200/50 bg-gray-50/50">
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Cliente</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Documento</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Contacto</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Ubicación</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Total</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Saldo</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Estado</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="bg-white/50 divide-y divide-gray-100/50">
                {clients.map((client) => (
                 <TableRow key={client.id} className="hover:bg-gray-50/50 transition-all duration-200 border-gray-200/50">
                     <TableCell className="px-4 py-3 whitespace-nowrap">
                     <div>
                         <div className="text-sm font-medium text-gray-900 truncate">
                         {client.nombre} {client.apellido || ''}
                         </div>
                         <div className="text-xs text-gray-500 font-light truncate">
                         {client.codigo}
                         </div>
                     </div>
                     </TableCell>
                     <TableCell className="px-4 py-3 whitespace-nowrap">
                     <div>
                         <div className="text-sm text-gray-900 font-light truncate">{client.documento || 'N/A'}</div>
                         <div className="text-xs text-gray-500 capitalize font-light">
                         {client.tipo_documento}
                         </div>
                     </div>
                     </TableCell>
                     <TableCell className="px-4 py-3 whitespace-nowrap">
                     <div>
                         <div className="text-sm text-gray-900 font-light truncate">{client.telefono || 'N/A'}</div>
                         <div className="text-xs text-gray-500 font-light truncate">{client.email || 'N/A'}</div>
                     </div>
                     </TableCell>
                     <TableCell className="px-4 py-3 whitespace-nowrap">
                     <div>
                         <div className="text-sm text-gray-900 font-light truncate">{client.ciudad || 'N/A'}</div>
                         <div className="text-xs text-gray-500 font-light truncate">{client.direccion || 'N/A'}</div>
                     </div>
                     </TableCell>
                     <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                     ${client.total_compras.toFixed(0)}
                     </TableCell>
                     <TableCell className="px-4 py-3 whitespace-nowrap">
                     <span
                         className={`text-sm font-medium ${
                         client.saldo_pendiente > 0
                             ? "text-red-600"
                             : "text-green-600"
                         }`}
                     >
                         ${client.saldo_pendiente.toFixed(0)}
                     </span>
                     </TableCell>
                     <TableCell className="px-4 py-3 whitespace-nowrap">
                     <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${
                         client.activo 
                             ? 'bg-green-50/80 text-green-700 border-green-200/50' 
                             : 'bg-red-50/80 text-red-700 border-red-200/50'
                     }`}>
                         {client.activo ? "Activo" : "Inactivo"}
                     </span>
                     </TableCell>
                     <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                     <div className="flex justify-center space-x-2">
                         <Button
                             variant="ghost"
                             onClick={() => onEdit(client)}
                             className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200/50"
                             >
                             <Edit className="h-4 w-4" />  
                         </Button>

                         <Button
                             variant="ghost"
                             onClick={() => onDelete(client.id)}
                             className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200/50"
                             >
                             <Trash2 className="h-4 w-4" />
                         </Button>
                     </div>
                     </TableCell>
                 </TableRow>
                 ))}
            </TableBody>
            </Table>
        </div>
    );
    }
