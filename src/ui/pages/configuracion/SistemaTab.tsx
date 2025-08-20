import { CheckCircle, Settings, Save, Download, Upload } from "lucide-react";

interface Props {
  message: { type: 'success' | 'error'; text: string } | null;
  saving: boolean;
  sistemaConfig: any;
  setSistemaConfig: (v: any) => void;
  onSave: () => void;
  onCreateBackupMark: () => Promise<void>;
  onRestoreClick: () => Promise<void>;
}

export default function SistemaTab({ message, saving, sistemaConfig, setSistemaConfig, onSave, onCreateBackupMark, onRestoreClick }: Props) {
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
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Configuración del Sistema</h3>
              <p className="text-sm text-gray-600">Gestiona respaldos y configuraciones avanzadas</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Respaldo de Datos</h4>
              <div className="flex space-x-3">
                <button
                  onClick={onCreateBackupMark}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {saving ? 'Creando...' : 'Crear Respaldo (marca)'}
                </button>
                <button
                  onClick={onRestoreClick}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurar Respaldo (archivo)
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {sistemaConfig.ultimo_backup
                  ? `Último respaldo: ${new Date(sistemaConfig.ultimo_backup).toLocaleString()}`
                  : 'No se ha creado ningún respaldo'}
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Configuraciones Avanzadas</h4>
              <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-backup"
                      checked={sistemaConfig.auto_backup === 'true'}
                      onChange={(e) => setSistemaConfig({ ...sistemaConfig, auto_backup: e.target.checked ? 'true' : 'false' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-backup" className="text-sm text-gray-700">
                      Habilitar respaldos automáticos diarios
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="log-activity"
                      checked={sistemaConfig.log_activity === 'true'}
                      onChange={(e) => setSistemaConfig({ ...sistemaConfig, log_activity: e.target.checked ? 'true' : 'false' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="log-activity" className="text-sm text-gray-700">
                      Registrar actividad de usuarios
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="debug-mode"
                      checked={sistemaConfig.debug_mode === 'true'}
                      onChange={(e) => setSistemaConfig({ ...sistemaConfig, debug_mode: e.target.checked ? 'true' : 'false' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="debug-mode" className="text-sm text-gray-700">
                      Modo de desarrollo (mostrar errores detallados)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
