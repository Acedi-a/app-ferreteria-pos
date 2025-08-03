    import { Edit, Trash2 } from "lucide-react";
    import { Card, CardHeader, CardTitle, CardContent } from "../Card";
    import { Button } from "../Button";
    import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Table";
    import { Badge } from "../Badge";
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
        <Card>
            <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex justify-center items-center py-8">
                <div className="text-slate-500">Cargando clientes...</div>
            </div>
            </CardContent>
        </Card>
        );
    }

    if (clients.length === 0) {
        return (
        <Card>
            <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex justify-center items-center py-8">
                <div className="text-slate-500">
                {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
                </div>
            </div>
            </CardContent>
        </Card>
        );
    }

    return (
        <Card>
        <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((client) => (
                <TableRow key={client.id}>
                    <TableCell>
                    <div>
                        <div className="font-medium">
                        {client.nombre} {client.apellido || ''}
                        </div>
                        <div className="text-sm text-slate-500">
                        Código: {client.codigo}
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>
                    <div>
                        <div className="text-sm">{client.documento || 'N/A'}</div>
                        <div className="text-sm text-slate-500 capitalize">
                        {client.tipo_documento}
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>
                    <div>
                        <div className="text-sm">{client.telefono || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{client.email || 'N/A'}</div>
                    </div>
                    </TableCell>
                    <TableCell>
                    <div>
                        <div className="text-sm">{client.ciudad || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{client.direccion || 'N/A'}</div>
                    </div>
                    </TableCell>
                    <TableCell className="font-medium">
                    ${client.total_compras.toFixed(2)}
                    </TableCell>
                    <TableCell>
                    <span
                        className={`font-medium ${
                        client.saldo_pendiente > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                    >
                        ${client.saldo_pendiente.toFixed(2)}
                    </span>
                    </TableCell>
                    <TableCell>
                    <Badge variant={client.activo ? "success" : "destructive"}>
                        {client.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            onClick={() => onEdit(client)}
                            className="h-12 w-12 p-0"
                            >
                            <Edit className="h-10 w-10 text-slate-700" />  
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => onDelete(client.id)}
                            className="h-12 w-12 p-0"
                            >
                            <Trash2 className="h-10 w-10 text-red-700" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
    }
