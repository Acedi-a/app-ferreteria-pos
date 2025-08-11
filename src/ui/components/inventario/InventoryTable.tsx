import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Settings } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import type { InventarioItem } from "../../services/inventario-service";

export interface InventoryTableProps {
  items: InventarioItem[];
  onAdjust: (item: InventarioItem) => void;
}

export function InventoryTable({ items, onAdjust }: InventoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Stock Actual</TableHead>
          <TableHead>Stock Mínimo</TableHead>
          <TableHead>Costo Unit.</TableHead>
          <TableHead>Valor Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const stockStatus = item.stock_actual <= (item.stock_minimo ?? 0) ? "low" : "normal";
          return (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{item.nombre}</div>
                  <div className="text-sm text-slate-500">
                    Último mov: {item.ultimo_movimiento ? new Date(item.ultimo_movimiento).toLocaleDateString() : "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell>{item.codigo_interno}</TableCell>
              <TableCell>
                <Badge variant="default">{item.categoria}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={`font-medium ${stockStatus === "low" ? "text-red-600" : "text-slate-900"}`}>
                    {item.stock_actual}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {item.tipo_unidad_abrev || item.unidad_medida || 'uds'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {item.stock_minimo ?? 0} {item.tipo_unidad_abrev || item.unidad_medida || 'uds'}
              </TableCell>
              <TableCell>
                Bs {(item.costo_unitario_ultimo ?? 0).toFixed(2)}
              </TableCell>
              <TableCell className="font-medium">Bs {(item.valor_total ?? 0).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={stockStatus === "low" ? "destructive" : "success"}>
                  {stockStatus === "low" ? "Stock Bajo" : "Normal"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => onAdjust(item)} className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
