import { Edit, Trash2, Folder } from "lucide-react";
import { Button } from "../ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import type { CategoriaForm } from "../../services/categoria-tipo-service";
import { formatBoliviaDateOnly } from "../../lib/utils";

interface CategoriaTableProps {
  categorias: CategoriaForm[];
  loading: boolean;
  onEdit: (categoria: CategoriaForm) => void;
  onDelete: (id: number) => void;
}

export default function CategoriaTable({ categorias, loading, onEdit, onDelete }: CategoriaTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200/50">
        <h3 className="text-lg font-light text-gray-900 flex items-center gap-3">
          <Folder className="h-5 w-5 text-gray-500" />
          Categorías ({categorias.length})
        </h3>
      </div>
      
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-500 mx-auto"></div>
              <p className="mt-4 text-base font-medium text-gray-600 text-center">Cargando categorías...</p>
            </div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="bg-gray-100/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 text-center">
              <p className="text-gray-700 text-xl font-medium">No hay categorías registradas</p>
              <p className="text-gray-500 text-base font-light mt-2">Comienza agregando tu primera categoría</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200/50 hover:bg-gray-50/50">
                <TableHead className="text-gray-600 font-light">Nombre</TableHead>
                <TableHead className="text-gray-600 font-light">Descripción</TableHead>
                <TableHead className="text-gray-600 font-light">Estado</TableHead>
                <TableHead className="text-gray-600 font-light">Fecha Creación</TableHead>
                <TableHead className="text-gray-600 font-light">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id} className="border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="font-light text-gray-900">{categoria.nombre}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm font-light text-gray-500">
                      {categoria.descripcion || 'Sin descripción'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge 
                      variant={categoria.activo ? "success" : "destructive"}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border ${
                        categoria.activo 
                          ? 'bg-green-50/80 text-green-700 border-green-200/50' 
                          : 'bg-red-50/80 text-red-700 border-red-200/50'
                      }`}
                    >
                      {categoria.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm font-light text-gray-500">
                      {categoria.fecha_creacion ? formatBoliviaDateOnly(categoria.fecha_creacion) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(categoria)}
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => categoria.id && onDelete(categoria.id)}
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
        )}
      </div>
    </div>
  );
}
