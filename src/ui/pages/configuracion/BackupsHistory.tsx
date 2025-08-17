import { useEffect, useState } from 'react';
import { FolderOpen, RotateCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

type BackupRow = {
  id: number;
  file_path: string;
  size_bytes: number | null;
  status: string | null;
  triggered_by: string | null;
  operation: string | null;
  notes: string | null;
  created_at: string;
};

export default function BackupsHistory() {
  const [rows, setRows] = useState<BackupRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.db.query(
        `SELECT id, file_path, size_bytes, status, triggered_by, operation, notes, created_at
         FROM backups ORDER BY created_at DESC, id DESC LIMIT 200`
      );
      setRows(data as any);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reveal = async (p: string) => {
    await window.electronAPI.revealInFolder(p);
  };

  const restoreFrom = async (p: string) => {
    if (!confirm('Esto restaurará la base y reiniciará la app. ¿Continuar?')) return;
    const res = await window.electronAPI.restoreDbFromPath(p);
    if (!res.ok) alert(res.error || 'Error al restaurar');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Historial de Backups</h3>
        <div className="flex items-center gap-2">
          <Button className="h-8 px-3" variant="outline" onClick={load} disabled={loading}>
            <RotateCw className="h-4 w-4 mr-1" /> Actualizar
          </Button>
        </div>
      </div>
      <div className="p-4">
        {error && (
          <div className="mb-3 p-2 text-sm text-red-700 bg-red-50 rounded border border-red-200">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Archivo</th>
                <th className="py-2 pr-4">Tamaño</th>
                <th className="py-2 pr-4">Origen</th>
                <th className="py-2 pr-4">Operación</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-4 text-gray-500" colSpan={7}>Cargando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="py-4 text-gray-500" colSpan={7}>Sin registros</td></tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-4 max-w-[360px] truncate" title={r.file_path}>{r.file_path}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{r.size_bytes ? (Math.round(r.size_bytes/1024) + ' KB') : '-'}</td>
                    <td className="py-2 pr-4">{r.triggered_by || '-'}</td>
                    <td className="py-2 pr-4">{r.operation || '-'}</td>
                    <td className="py-2 pr-4">{r.status || '-'}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Button className="h-8 px-3" variant="outline" onClick={() => reveal(r.file_path)} title="Mostrar en carpeta">
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                        {r.operation === 'backup' && (
                          <Button className="h-8 px-3" onClick={() => restoreFrom(r.file_path)} title="Restaurar desde este archivo">
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
