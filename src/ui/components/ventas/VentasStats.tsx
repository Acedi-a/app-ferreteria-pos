// src/components/ventas/VentasStats.tsx
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

interface EstadisticasVentas {
  ventasHoy: {
    cantidad: number;
    total: number;
  };
  ventasSemana: {
    cantidad: number;
    total: number;
  };
  ventasMes: {
    cantidad: number;
    total: number;
  };
  topProductos: Array<{
    nombre: string;
    cantidad_vendida: number;
    total_vendido: number;
  }>;
}

interface VentasStatsProps {
  estadisticas: EstadisticasVentas;
  loading?: boolean;
}

export default function VentasStats({ estadisticas, loading = false }: VentasStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Ventas Hoy",
      value: `Bs ${estadisticas.ventasHoy.total.toFixed(2)}`,
      subtitle: `${estadisticas.ventasHoy.cantidad} ventas`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Esta Semana",
      value: `Bs ${estadisticas.ventasSemana.total.toFixed(2)}`,
      subtitle: `${estadisticas.ventasSemana.cantidad} ventas`,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Este Mes",
      value: `Bs ${estadisticas.ventasMes.total.toFixed(2)}`,
      subtitle: `${estadisticas.ventasMes.cantidad} ventas`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Productos Top",
      value: estadisticas.topProductos[0]?.nombre || "Sin datos",
      subtitle: `${estadisticas.topProductos[0]?.cantidad_vendida || 0} vendidos`,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-gray-500">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
