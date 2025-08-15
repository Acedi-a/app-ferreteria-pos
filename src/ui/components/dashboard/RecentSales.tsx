import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export interface VentaReciente {
  id: string;
  cliente: string | null;
  total: number;
  fecha: string;
}

export default function RecentSales({ ventas }: { ventas: VentaReciente[] }) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <CardDescription>Últimas transacciones realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ventas.map((v) => (
            <div key={v.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {v.id} - {v.cliente || 'Cliente general'}
                </p>
                <p className="text-sm text-slate-500">{v.fecha}</p>
              </div>
              <div className="font-medium">Bs {v.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/ventas">
            <Button variant="outline" className="w-full">
              Ver todas las ventas
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
