import { Users, UserCheck, DollarSign, AlertCircle } from "lucide-react";


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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Total Clientes */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Total Clientes</p>
                        <p className="text-3xl font-light text-gray-900 mt-2">{stats.totalClientes}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50">
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Clientes Activos */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Clientes Activos</p>
                        <p className="text-3xl font-light text-gray-900 mt-2">{stats.clientesActivos}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50">
                        <UserCheck className="h-8 w-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Con Saldo Pendiente */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Con Saldo Pendiente</p>
                        <p className="text-3xl font-light text-gray-900 mt-2">{stats.conSaldoPendiente}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50">
                        <AlertCircle className="h-8 w-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Total por Cobrar */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Total por Cobrar</p>
                        <p className="text-3xl font-light text-gray-900 mt-2">${stats.totalPorCobrar.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50">
                        <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                </div>
            </div>
        </div>
    );
    }
