import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export interface ResumenFinanzas {
  ingresos: number;
  costos: number;
  utilidad_bruta: number;
  gastos: number;
  utilidad_neta: number;
  margen_bruto: number;
  margen_neto: number;
}

export function ResumenFinanciero({ datos }: { datos: ResumenFinanzas | null }) {
  if (!datos) return null;
  const items = [
    { k: 'Ingresos', v: datos.ingresos },
    { k: 'Costos', v: datos.costos },
    { k: 'Utilidad bruta', v: datos.utilidad_bruta },
    { k: 'Gastos', v: datos.gastos },
    { k: 'Utilidad neta', v: datos.utilidad_neta },
    { k: 'Margen bruto %', v: datos.margen_bruto },
    { k: 'Margen neto %', v: datos.margen_neto },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen financiero</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {items.map((it) => (
            <div key={it.k} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{it.k}</div>
              <div style={{ fontWeight: 600 }}>{typeof it.v === 'number' ? (it.k.includes('%') ? `${it.v.toFixed(2)}%` : it.v.toFixed(2)) : it.v}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
