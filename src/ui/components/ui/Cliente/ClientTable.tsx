import { Edit, Trash2, Phone, Mail, MapPin, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";

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
            <div className="flex items-center justify-center py-24">
                <div className="bg-white rounded-lg p-8 border border-gray-200">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
                        <div className="text-center">
                            <p className="text-base font-medium text-gray-900">Cargando información</p>
                            <p className="text-sm text-gray-500 mt-1">Obteniendo datos de clientes...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center max-w-md">
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-6">
                        <AlertTriangle className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {searchTerm ? `Sin resultados para "${searchTerm}"` : "No hay clientes registrados"}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {searchTerm ? "Intenta con otros términos de búsqueda o verifica la ortografía" : "Comienza registrando tu primer cliente para gestionar tu cartera comercial"}
                    </p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="w-full">
                <Table className="w-full min-w-[1200px]">
                <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">Cliente</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Documento</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[18%]">Contacto</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">Ubicación</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[12%]">Compras</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[12%]">Saldo</TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[8%]">Estado</TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[10%]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                     <TableRow key={client.id} className="hover:bg-gray-50 transition-colors group">
                         <TableCell className="px-6 py-4">
                         <div className="flex items-center space-x-3">
                             <div className="flex-shrink-0">
                                 <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                                     <span className="text-sm font-medium text-white">
                                         {client.nombre.charAt(0).toUpperCase()}{client.apellido?.charAt(0)?.toUpperCase() || ''}
                                     </span>
                                 </div>
                             </div>
                             <div className="min-w-0 flex-1">
                                 <div className="text-sm font-medium text-gray-900 truncate">
                                     {client.nombre} {client.apellido || ''}
                                 </div>
                                 <div className="flex items-center space-x-2 mt-1">
                                     <CreditCard className="h-4 w-4 text-gray-400" />
                                     <span className="text-xs text-gray-500 font-medium tracking-wide">{client.codigo}</span>
                                 </div>
                             </div>
                         </div>
                         </TableCell>
                         <TableCell className="px-4 py-4">
                         <div>
                             <div className="text-sm font-medium text-gray-900">{client.documento || 'Sin documento'}</div>
                             <div className="flex items-center space-x-1 mt-1">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                     {client.tipo_documento}
                                 </span>
                             </div>
                         </div>
                         </TableCell>
                         <TableCell className="px-4 py-4">
                         <div className="space-y-1">
                             {client.telefono && (
                                 <div className="flex items-center space-x-2">
                                     <Phone className="h-3 w-3 text-gray-400" />
                                     <span className="text-sm text-gray-900 font-medium truncate">{client.telefono}</span>
                                 </div>
                             )}
                             {client.email && (
                                 <div className="flex items-center space-x-2">
                                     <Mail className="h-3 w-3 text-gray-400" />
                                     <span className="text-xs text-gray-600 truncate max-w-28 font-medium">{client.email}</span>
                                 </div>
                             )}
                             {!client.telefono && !client.email && (
                                 <span className="text-sm text-gray-400">Sin contacto</span>
                             )}
                         </div>
                         </TableCell>
                         <TableCell className="px-4 py-4">
                         <div className="space-y-1">
                             {client.ciudad && (
                                 <div className="flex items-center space-x-2">
                                     <MapPin className="h-3 w-3 text-gray-400" />
                                     <span className="text-sm text-gray-900 font-medium truncate">{client.ciudad}</span>
                                 </div>
                             )}
                             {client.direccion && (
                                 <div className="text-xs text-gray-600 truncate max-w-24 font-medium ml-5">{client.direccion}</div>
                             )}
                             {!client.ciudad && !client.direccion && (
                                 <span className="text-sm text-gray-400">Sin ubicación</span>
                             )}
                         </div>
                         </TableCell>
                         <TableCell className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-gray-500" />
                              <div>
                                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(client.total_compras)}</div>
                                  <div className="text-xs text-gray-500 font-medium">Total</div>
                              </div>
                          </div>
                          </TableCell>
                         <TableCell className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full shadow-sm ${
                                  client.saldo_pendiente > 0 ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                              <div>
                                  <span className={`text-sm font-semibold ${
                                      client.saldo_pendiente > 0 ? "text-red-600" : "text-green-600"
                                  }`}>
                                      {formatCurrency(client.saldo_pendiente)}
                                  </span>
                                  <div className="text-xs text-gray-500 font-medium">
                                      {client.saldo_pendiente > 0 ? 'Pendiente' : 'Al día'}
                                  </div>
                              </div>
                          </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                           <div className="flex items-center justify-center">
                               <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                   client.activo 
                                       ? 'bg-gray-100 text-gray-700' 
                                       : 'bg-red-100 text-red-700'
                               }`}>
                                   <div className={`w-1.5 h-1.5 rounded-full mr-1.5 shadow-sm ${
                                       client.activo ? 'bg-gray-500' : 'bg-red-500'
                                   }`}></div>
                                   {client.activo ? "Activo" : "Inactivo"}
                               </span>
                           </div>
                           </TableCell>
                          <TableCell className="px-4 py-4">
                           <div className="flex justify-center space-x-2">
                               <Button
                                   variant="ghost"
                                   onClick={() => onEdit(client)}
                                   className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                   title="Editar cliente"
                                   >
                                   <Edit className="h-4 w-4" />  
                               </Button>

                               <Button
                                   variant="ghost"
                                   onClick={() => onDelete(client.id)}
                                   className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                   title="Eliminar cliente"
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
        </div>
    );
}
