import { Edit, Trash2, Phone, Mail, MapPin, CreditCard, Factory } from "lucide-react";
import { Button } from "../Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Table";
import { type Proveedor } from "../../../services/proveedores-service";

interface ProviderTableProps {
  providers: Proveedor[];
  loading: boolean;
  searchTerm: string;
  onEdit: (prov: Proveedor) => void;
  onDelete: (id: number | undefined) => void;
}

export function ProviderTable({ providers, loading, searchTerm, onEdit, onDelete }: ProviderTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
            <div className="text-center">
              <p className="text-base font-medium text-gray-900">Cargando proveedores</p>
              <p className="text-sm text-gray-500 mt-1">Obteniendo datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-6">
            <Factory className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {searchTerm ? `Sin resultados para "${searchTerm}"` : "No hay proveedores registrados"}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Registra tu primer proveedor para empezar"}
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="w-full">
        <Table className="w-full min-w-[1100px]">
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[22%]">Proveedor</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[16%]">Documento</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[18%]">Contacto</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[16%]">Ubicación</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[12%]">Compras</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[8%]">Estado</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-[10%]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {providers.map((prov) => (
              <TableRow key={prov.id} className="hover:bg-gray-50 transition-colors group">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                        <span className="text-sm font-medium text-white">
                          {prov.nombre?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{prov.nombre}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium tracking-wide">{prov.codigo}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-900 font-medium">{prov.documento || 'Sin documento'}</div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="space-y-1">
                    {prov.telefono && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900 font-medium truncate">{prov.telefono}</span>
                      </div>
                    )}
                    {prov.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600 truncate max-w-28 font-medium">{prov.email}</span>
                      </div>
                    )}
                    {!prov.telefono && !prov.email && (
                      <span className="text-sm text-gray-400">Sin contacto</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="space-y-1">
                    {prov.ciudad && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900 font-medium truncate">{prov.ciudad}</span>
                      </div>
                    )}
                    {prov.direccion && (
                      <div className="text-xs text-gray-600 truncate max-w-24 font-medium ml-5">{prov.direccion}</div>
                    )}
                    {!prov.ciudad && !prov.direccion && (
                      <span className="text-sm text-gray-400">Sin ubicación</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(prov.total_compras || 0)}</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${prov.activo ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 shadow-sm ${prov.activo ? 'bg-gray-500' : 'bg-red-500'}`}></div>
                      {prov.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" onClick={() => onEdit(prov)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Editar proveedor">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => onDelete(prov.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar proveedor">
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
