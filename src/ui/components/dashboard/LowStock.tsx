import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

export interface StockBajoItem {
  nombre: string;
  stock: number;
  minimo: number;
}

export default function LowStock({ items }: { items: StockBajoItem[] }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          Stock Bajo
        </CardTitle>
        <CardDescription>Productos que necesitan reposición</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{p.nombre}</p>
                <p className="text-sm text-slate-500">Mínimo: {p.minimo}</p>
              </div>
              <Badge variant="destructive">{p.stock}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
