// src/components/cuentas-por-cobrar/CuentasPorCobrarStats.tsx
import { CreditCard, AlertTriangle, Clock, CheckCircle, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import type { EstadisticasCuentasPorCobrar } from "../../services/cuentas-por-cobrar-service";

interface CuentasPorCobrarStatsProps {
  estadisticas: EstadisticasCuentasPorCobrar;
  loading?: boolean;
}

export default function CuentasPorCobrarStats({ 
  estadisticas, 
  loading = false 
}: CuentasPorCobrarStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total por Cobrar",
      value: `Bs ${estadisticas.totalPorCobrar.toFixed(2)}`,
      description: "Saldo pendiente total",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Vencido",
      value: `Bs ${estadisticas.totalVencido.toFixed(2)}`,
      description: "Cuentas vencidas",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Pendientes",
      value: estadisticas.cantidadPendientes.toString(),
      description: "Cuentas pendientes",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Vencidas",
      value: estadisticas.cantidadVencidas.toString(),
      description: "Cuentas vencidas",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pagadas",
      value: estadisticas.cantidadPagadas.toString(),
      description: "Cuentas pagadas",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Clientes con Deuda",
      value: estadisticas.clientesConDeuda.toString(),
      description: "Clientes deudores",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-600">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
