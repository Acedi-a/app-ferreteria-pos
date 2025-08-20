import { CheckCircle, Shield, Download, Upload } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface Props {
  message: { type: 'success' | 'error'; text: string } | null;
  onBackupClick: () => Promise<void>;
  onRestoreClick: () => Promise<void>;
}

export default function BackupTab({ message, onBackupClick, onRestoreClick }: Props) {
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
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Backup y Restore</h3>
              <p className="text-sm text-gray-600">Crea un respaldo de la base de datos o restaura desde un archivo</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Button onClick={onBackupClick}>
              <Download className="mr-2 h-4 w-4" /> Crear Backup (.sqlite)
            </Button>
            <Button variant="outline" onClick={onRestoreClick}>
              <Upload className="mr-2 h-4 w-4" /> Restaurar desde archivo
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            - El backup se guarda como un archivo .sqlite que puedes mover o copiar.
            <br/>
            - Restaurar reemplaza la base actual por el archivo seleccionado. La app se reiniciará tras restaurar.
          </div>
        </div>
      </div>
    </div>
  );
}
