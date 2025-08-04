import { Users, UserCheck, DollarSign, AlertCircle, TrendingUp, Activity } from "lucide-react";

    interface ClientStatsProps {
    stats: {
        totalClientes: number;
        clientesActivos: number;
        conSaldoPendiente: number;
        totalPorCobrar: number;
    };
    }

    export function ClientStats({ stats }: ClientStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const activePercentage = stats.totalClientes > 0 ? (stats.clientesActivos / stats.totalClientes * 100).toFixed(1) : '0';
    const pendingPercentage = stats.totalClientes > 0 ? (stats.conSaldoPendiente / stats.totalClientes * 100).toFixed(1) : '0';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Clientes */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
                        <Activity className="h-3 w-3 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Total</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 uppercase">Base de Clientes</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalClientes.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
                </div>
            </div>

            {/* Clientes Activos */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                        <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
                        <TrendingUp className="h-3 w-3 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">{activePercentage}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 uppercase">Clientes Activos</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.clientesActivos.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Con actividad comercial</p>
                </div>
            </div>

            {/* Con Saldo Pendiente */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 rounded">
                        <AlertCircle className="h-3 w-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">{pendingPercentage}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 uppercase">Saldos Pendientes</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.conSaldoPendiente.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Clientes con deuda</p>
                </div>
            </div>

            {/* Total por Cobrar */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded">
                        <DollarSign className="h-3 w-3 text-red-600" />
                        <span className="text-xs font-medium text-red-700">BOB</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 uppercase">Total por Cobrar</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(stats.totalPorCobrar)}</p>
                    <p className="text-xs text-gray-500 mt-1">Cartera pendiente</p>
                </div>
            </div>
        </div>
    );
}
