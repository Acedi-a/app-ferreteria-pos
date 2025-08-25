import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { RangoFechas } from '../../services/reportes-service';

export type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export function FiltrosReportes({
  preset,
  setPreset,
  rango,
  setRango,
  loading,
  onApply,
}: {
  preset: Preset;
  setPreset: (p: Preset) => void;
  rango: RangoFechas;
  setRango: (r: RangoFechas) => void;
  loading: boolean;
  onApply?: () => void;
}) {
  return (
    <Card>
      <div style={{ paddingTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <label>Período de Análisis</label>
            <select 
              value={preset} 
              onChange={(e) => setPreset(e.target.value as Preset)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          {preset === 'custom' && (
            <>
              <div>
                <label>Desde</label>
                <input
                  type="date"
                  value={rango.desde || ''}
                  onChange={(e) => setRango({ ...rango, desde: e.target.value })}
                />
              </div>
              <div>
                <label>Hasta</label>
                <input
                  type="date"
                  value={rango.hasta || ''}
                  onChange={(e) => setRango({ ...rango, hasta: e.target.value })}
                />
              </div>
            </>
          )}
          {onApply && (
            <Button onClick={onApply} disabled={loading}>
              {loading ? 'Cargando…' : 'Aplicar'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
