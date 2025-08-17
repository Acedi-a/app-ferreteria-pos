import { CheckCircle, Calculator, Save } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface Props {
  message: { type: 'success' | 'error'; text: string } | null;
  saving: boolean;
  impuestosConfig: any;
  setImpuestosConfig: (v: any) => void;
  onSave: () => void;
}

export default function ImpuestosTab({ message, saving, impuestosConfig, setImpuestosConfig, onSave }: Props) {
  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
              <Calculator className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Configuración de Impuestos</h3>
              <p className="text-sm text-gray-600">Gestiona las tasas de impuestos y configuraciones fiscales</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IVA General (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={impuestosConfig.iva_general}
                  onChange={(e) => setImpuestosConfig({ ...impuestosConfig, iva_general: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IVA Reducido (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={impuestosConfig.iva_reducido}
                  onChange={(e) => setImpuestosConfig({ ...impuestosConfig, iva_reducido: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Retención en la Fuente (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={impuestosConfig.retencion_fuente}
                onChange={(e) => setImpuestosConfig({ ...impuestosConfig, retencion_fuente: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default-iva"
                  checked={impuestosConfig.aplicar_iva_defecto === 'true'}
                  onChange={(e) => setImpuestosConfig({ ...impuestosConfig, aplicar_iva_defecto: e.target.checked ? 'true' : 'false' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="default-iva" className="text-sm text-slate-700">
                  Aplicar IVA por defecto en productos nuevos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-taxes"
                  checked={impuestosConfig.mostrar_impuestos_ticket === 'true'}
                  onChange={(e) => setImpuestosConfig({ ...impuestosConfig, mostrar_impuestos_ticket: e.target.checked ? 'true' : 'false' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show-taxes" className="text-sm text-slate-700">
                  Mostrar impuestos desglosados en tickets
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-calc"
                  checked={impuestosConfig.calcular_impuestos_auto === 'true'}
                  onChange={(e) => setImpuestosConfig({ ...impuestosConfig, calcular_impuestos_auto: e.target.checked ? 'true' : 'false' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-calc" className="text-sm text-slate-700">
                  Calcular impuestos automáticamente
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
