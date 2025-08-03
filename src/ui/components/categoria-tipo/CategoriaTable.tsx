import { Edit, Trash2, Folder } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import type { CategoriaForm } from "../../services/categoria-tipo-service";

interface CategoriaTableProps {
  categorias: CategoriaForm[];
  loading: boolean;
  onEdit: (categoria: CategoriaForm) => void;
  onDelete: (id: number) => void;
}

export default function CategoriaTable({ categorias, loading, onEdit, onDelete }: CategoriaTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          Categorías ({categorias.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-slate-500">Cargando categorías...</div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-slate-500">No hay categorías registradas</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>
                    <div className="font-medium">{categoria.nombre}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">
                      {categoria.descripcion || 'Sin descripción'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoria.activo ? "success" : "destructive"}>
                      {categoria.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">
                      {categoria.fecha_creacion ? new Date(categoria.fecha_creacion).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(categoria)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => categoria.id && onDelete(categoria.id)}
                        className="h-8 w-8 p-0"
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
      </CardContent>
    </Card>
  );
}
