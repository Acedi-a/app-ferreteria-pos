    import { Users, UserCheck, CreditCard, DollarSign } from "lucide-react";
    import { Card, CardHeader, CardTitle, CardContent } from "../Card";

    interface ClientStatsProps {
    stats: {
        totalClientes: number;
        clientesActivos: number;
        conSaldoPendiente: number;
        totalPorCobrar: number;
    };
    }

    export function ClientStats({ stats }: ClientStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-slate-600">Clientes registrados</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.clientesActivos}</div>
            <p className="text-xs text-slate-600">Clientes activos</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Saldo Pendiente</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.conSaldoPendiente}</div>
            <p className="text-xs text-slate-600">Clientes con deuda</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold text-red-600">
                ${stats.totalPorCobrar.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Saldo pendiente total</p>
            </CardContent>
        </Card>
        </div>
    );
    }
