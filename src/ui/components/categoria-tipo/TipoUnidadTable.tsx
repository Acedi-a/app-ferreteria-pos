import { Edit, Trash2, Ruler } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import type { TipoUnidadForm } from "../../services/categoria-tipo-service";

interface TipoUnidadTableProps {
  tiposUnidad: TipoUnidadForm[];
  loading: boolean;
  onEdit: (tipo: TipoUnidadForm) => void;
  onDelete: (id: number) => void;
}

export default function TipoUnidadTable({ tiposUnidad, loading, onEdit, onDelete }: TipoUnidadTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Tipos de Unidad ({tiposUnidad.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-slate-500">Cargando tipos de unidad...</div>
          </div>
        ) : tiposUnidad.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-slate-500">No hay tipos de unidad registrados</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Abreviación</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposUnidad.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>
                    <div className="font-medium">{tipo.nombre}</div>
                  </TableCell>
                  <TableCell>
                    <Badge>{tipo.abreviacion}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">
                      {tipo.descripcion || 'Sin descripción'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tipo.activo ? "success" : "destructive"}>
                      {tipo.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">
                      {tipo.fecha_creacion ? new Date(tipo.fecha_creacion).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(tipo)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => tipo.id && onDelete(tipo.id)}
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
