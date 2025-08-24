import React from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Select } from "../ui/Select";
import type { Categoria, Producto, TipoUnidad } from "../../services/productos-service";
import { MovimientosService } from "../../services/movimientos-service";
import { productosService } from "../../services/productos-service";

// Claves soportadas en el import (incluye stock_actual que no es campo directo en productos)
type ColumnKey = keyof Pick<Producto, 'codigo_interno' | 'codigo_barras' | 'nombre' | 'descripcion' | 'precio_venta' | 'costo_unitario' | 'stock_minimo' | 'categoria_id' | 'tipo_unidad_id' | 'unidad_medida' | 'activo' | 'imagen_url'> | 'stock_actual';

interface BulkProductImportProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: Categoria[];
  tiposUnidad: TipoUnidad[];
  onImported: (result: { created: number; skipped: number; errors: number }) => void;
  embedded?: boolean;
}

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
}

const FIELD_LABELS: Record<ColumnKey, string> = {
  codigo_interno: 'Código Interno*',
  codigo_barras: 'Código Barras',
  nombre: 'Nombre*',
  descripcion: 'Descripción',
  precio_venta: 'Precio Venta*',
  costo_unitario: 'Costo Unitario',
  stock_actual: 'Stock Actual (carga inicial)',
  stock_minimo: 'Stock Mínimo*',
  categoria_id: 'Categoría (ID o Nombre)',
  tipo_unidad_id: 'Tipo Unidad (ID o Nombre)',
  unidad_medida: 'Unidad Medida',
  activo: 'Activo (1/0, true/false, sí/no)',
  imagen_url: 'Imagen URL'
};

const REQUIRED_FIELDS: ColumnKey[] = ['codigo_interno', 'nombre', 'precio_venta', 'stock_minimo'];

// Orden estable para generar plantilla CSV
const TEMPLATE_ORDER: ColumnKey[] = [
  'codigo_interno','codigo_barras','nombre','descripcion','precio_venta','costo_unitario','stock_actual','stock_minimo','categoria_id','tipo_unidad_id','unidad_medida','activo','imagen_url'
];

function guessMapping(headers: string[]): Partial<Record<ColumnKey, string>> {
  const map: Partial<Record<ColumnKey, string>> = {};
  const norm = (s: string) => s.toLowerCase().trim();
  const headerNorms = headers.map(norm);
  const pairs: [ColumnKey, string[]][] = [
    ['codigo_interno', ['codigo_interno', 'codigo', 'sku', 'code']],
    ['codigo_barras', ['codigo_barras', 'barcode', 'ean', 'upc']],
    ['nombre', ['nombre', 'producto', 'name', 'titulo', 'título']],
    ['descripcion', ['descripcion', 'descripción', 'description', 'detalle']],
    ['precio_venta', ['precio_venta', 'precio', 'price', 'pvp', 'venta']],
    ['costo_unitario', ['costo_unitario', 'costo', 'cost', 'compra']],
  // Priorizar detectar 'stock' como stock_actual para evitar confundir con stock_minimo
  ['stock_actual', ['stock_actual', 'stock', 'existencia', 'existencias', 'qty', 'cantidad']],
  ['stock_minimo', ['stock_minimo', 'stock min', 'minimo', 'mínimo', 'min stock']],
    ['categoria_id', ['categoria', 'categoría', 'categoria_id', 'category']],
    ['tipo_unidad_id', ['tipo_unidad', 'unidad', 'tipo_unidad_id', 'unit', 'unidad_medida']],
    ['unidad_medida', ['unidad_medida', 'um', 'unidad', 'unit_name']],
    ['activo', ['activo', 'active', 'habilitado', 'enabled']],
    ['imagen_url', ['imagen', 'imagen_url', 'image', 'image_url', 'foto']]
  ];
  for (const [field, alts] of pairs) {
    const idx = headerNorms.findIndex(h => alts.includes(h));
    if (idx >= 0) map[field] = headers[idx];
  }
  return map;
}

export default function BulkProductImport({ isOpen, onClose, categorias, tiposUnidad, onImported, embedded = false }: BulkProductImportProps) {
  const [fileName, setFileName] = React.useState<string>('');
  const [parsed, setParsed] = React.useState<ParsedData | null>(null);
  const [mapping, setMapping] = React.useState<Partial<Record<ColumnKey, string>>>({});
  const [importing, setImporting] = React.useState(false);
  const [log, setLog] = React.useState<{ ok: number; skipped: number; errors: number; details: string[] }>({ ok: 0, skipped: 0, errors: 0, details: [] });

  const reset = () => {
    setFileName('');
    setParsed(null);
    setMapping({});
    setImporting(false);
    setLog({ ok: 0, skipped: 0, errors: 0, details: [] });
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'csv') {
      await new Promise<void>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (res: { data: unknown[]; meta: { fields?: string[] } }) => {
            const rows = (res.data as any[]).filter(Boolean);
            const headers = res.meta.fields || Object.keys(rows[0] || {});
            setParsed({ headers, rows });
            setMapping(guessMapping(headers));
            resolve();
          },
          error: (err: unknown) => reject(err)
        });
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];
      const headers = Object.keys(json[0] || {});
      setParsed({ headers, rows: json });
      setMapping(guessMapping(headers));
    } else {
      alert('Formato no soportado. Usa CSV o XLSX.');
    }
  };

  const setMap = (field: ColumnKey, header: string) => {
    setMapping({ ...mapping, [field]: header });
  };

  const downloadTemplateCSV = (withExample = true) => {
    const headers = TEMPLATE_ORDER;
    const headerRow = headers.join(',');
    const exampleValues: Record<ColumnKey, string> = {
      codigo_interno: 'SKU-0001',
      codigo_barras: '7751234567890',
      nombre: 'Martillo de carpintero',
      descripcion: 'Martillo mango de madera',
      precio_venta: '25.9',
      costo_unitario: '18.5',
      stock_actual: '10',
      stock_minimo: '2',
      categoria_id: '1',
      tipo_unidad_id: '1',
      unidad_medida: 'UNIDAD',
      activo: 'true',
      imagen_url: ''
    };
    const example = withExample ? ('\n' + headers.map(h => exampleValues[h] ?? '').join(',')) : '';
    const csvContent = headerRow + example;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, withExample ? 'plantilla_productos_ejemplo.csv' : 'columnas_esperadas_productos.csv');
  };

  const normalizeBool = (v: any): boolean => {
    if (typeof v === 'boolean') return v;
    const s = String(v ?? '').toLowerCase().trim();
    return ['1', 'true', 'sí', 'si', 'activo', 'yes', 'y'].includes(s);
  };

  const toNumber = (v: any): number | undefined => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(String(v).replace(/,/g, '.'));
    return isNaN(n) ? undefined : n;
  };

  const resolveCategoriaId = (val: any): number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    if (!isNaN(n)) return n;
    const name = String(val).trim().toLowerCase();
    const c = categorias.find(x => x.nombre.trim().toLowerCase() === name);
    return c?.id;
  };

  const resolveTipoUnidadId = (val: any): number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    if (!isNaN(n)) return n;
    const name = String(val).trim().toLowerCase();
    const t = tiposUnidad.find(x => x.nombre.trim().toLowerCase() === name || x.abreviacion.trim().toLowerCase() === name);
    return t?.id;
  };

  const canImport = React.useMemo(() => {
    if (!parsed) return false;
    const m = mapping as Record<ColumnKey, string>;
    return REQUIRED_FIELDS.every(f => !!m[f]);
  }, [parsed, mapping]);

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    const m = mapping as Record<ColumnKey, string>;
    let ok = 0, skipped = 0, errors = 0;
    const details: string[] = [];

    for (let i = 0; i < parsed.rows.length; i++) {
      const r = parsed.rows[i];
      try {
        const producto: Partial<Producto> = {
          codigo_interno: r[m.codigo_interno]?.toString().trim(),
          codigo_barras: m.codigo_barras ? r[m.codigo_barras]?.toString().trim() : undefined,
          nombre: r[m.nombre]?.toString().trim(),
          descripcion: m.descripcion ? r[m.descripcion]?.toString().trim() : undefined,
          precio_venta: toNumber(r[m.precio_venta])!,
          costo_unitario: m.costo_unitario ? toNumber(r[m.costo_unitario]) : undefined,
          stock_minimo: toNumber(r[m.stock_minimo])!,
          categoria_id: m.categoria_id ? resolveCategoriaId(r[m.categoria_id]) : undefined,
          tipo_unidad_id: m.tipo_unidad_id ? resolveTipoUnidadId(r[m.tipo_unidad_id]) : undefined,
          unidad_medida: m.unidad_medida ? r[m.unidad_medida]?.toString().trim() : undefined,
          activo: m.activo ? normalizeBool(r[m.activo]) : true,
          imagen_url: m.imagen_url ? r[m.imagen_url]?.toString().trim() : undefined,
        };

        if (!producto.codigo_interno || !producto.nombre || producto.precio_venta === undefined || producto.stock_minimo === undefined) {
          skipped++;
          details.push(`Fila ${i + 2}: faltan campos requeridos`);
          continue;
        }

        const existing = await productosService.obtenerProductoPorCodigo(producto.codigo_interno);
        if (existing) {
          skipped++;
          details.push(`Fila ${i + 2}: código ya existe (${producto.codigo_interno})`);
          continue;
        }

        const prodId = await productosService.crearProducto(producto as Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>);

        // Si se proporcionó stock_actual, registrar un ajuste de stock como carga inicial
        const stockActualVal = m.stock_actual ? toNumber(r[m.stock_actual]) : undefined;
        if (prodId && stockActualVal !== undefined && stockActualVal !== 0) {
          try {
            await MovimientosService.registrarAjuste({
              producto_id: prodId,
              cantidad: stockActualVal,
              observaciones: 'Carga inicial (importación)'
            });
          } catch (e) {
            console.warn('No se pudo registrar ajuste inicial de stock para producto', prodId, e);
          }
        }
        ok++;
      } catch (e: any) {
        console.error('Import error row', i, e);
        errors++;
        details.push(`Fila ${i + 2}: error ${e?.message || e}`);
      }
    }

    setLog({ ok, skipped, errors, details });
    setImporting(false);
    onImported({ created: ok, skipped, errors });
  };

  const Inner = (
    <div className="min-h-full">
      <DialogHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">Importación Masiva</DialogTitle>
            <DialogDescription className="text-gray-600">
              Sube tu archivo CSV o XLSX, mapea las columnas y revisa antes de importar
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-8">
        {/* Sección de plantillas */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-blue-100">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Plantillas CSV</h3>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                variant="outline" 
                onClick={() => downloadTemplateCSV(true)}
                className="bg-white/80 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2z" />
                </svg>
                Plantilla con ejemplo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadTemplateCSV(false)}
                className="bg-white/80 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Solo columnas
              </Button>
            </div>

            {/* Columnas esperadas */}
            <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Columnas esperadas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600">
                {(Object.keys(FIELD_LABELS) as ColumnKey[]).map((k) => (
                  <div key={k} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                    <code className="font-mono text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{k}</code>
                    <span className="text-gray-600">{FIELD_LABELS[k]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subir archivo */}
            <div className="mt-6">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                />
                <div className="bg-white/80 border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-500 mt-1">Formatos soportados: CSV, XLSX, XLS</p>
                    </div>
                  </div>
                </div>
              </div>
              {fileName && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 font-medium">Archivo cargado:</span>
                  <span className="text-gray-600">{fileName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mapeo de columnas */}
        {parsed && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Mapeo de Columnas</h4>
                  <p className="text-indigo-100 text-sm">Asocia cada campo con las columnas de tu archivo</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(FIELD_LABELS).map((k) => {
                  const key = k as ColumnKey;
                  const isRequired = REQUIRED_FIELDS.includes(key);
                  const isMapped = !!mapping[key];
                  
                  return (
                    <div key={key} className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <label className={`text-sm font-medium ${isRequired ? 'text-red-700' : 'text-gray-700'}`}>
                          {FIELD_LABELS[key]}
                        </label>
                        {isRequired && (
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="relative">
                        <Select
                          value={mapping[key] || ''}
                          onValueChange={(value) => setMap(key, value)}
                        >
                          <option value="">— Seleccionar columna —</option>
                          {parsed.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </Select>
                        {isMapped && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Información importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>Los campos con punto rojo son obligatorios</li>
                      <li>Puedes mapear categorías por ID numérico o por nombre exacto</li>
                      <li>Los tipos de unidad se pueden mapear por ID, nombre o abreviación</li>
                      <li>El campo "Activo" acepta: 1/0, true/false, sí/no</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa */}
        {parsed && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Vista Previa</h4>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  Mostrando {Math.min(20, parsed.rows.length)} de {parsed.rows.length} filas
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-80">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    {parsed.headers.map((h) => (
                      <TableHead key={h} className="whitespace-nowrap font-medium text-gray-700 bg-gray-50">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.rows.slice(0, 20).map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50/50">
                      {parsed.headers.map((h) => (
                        <TableCell key={h} className="text-sm text-gray-700 whitespace-nowrap">
                          {String(row[h] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Resultado */}
        {(log.ok + log.skipped + log.errors > 0) && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Resultado de Importación</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{log.ok}</div>
                      <div className="text-sm text-green-600 font-medium">Productos creados</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-700">{log.skipped}</div>
                      <div className="text-sm text-yellow-600 font-medium">Productos omitidos</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-700">{log.errors}</div>
                      <div className="text-sm text-red-600 font-medium">Errores encontrados</div>
                    </div>
                  </div>
                </div>
              </div>

              {log.details.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 list-none">
                      <svg className="w-4 h-4 transform transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Ver detalles del procesamiento ({log.details.length} elementos)
                    </summary>
                    <div className="mt-4 pl-6">
                      <div className="max-h-48 overflow-auto bg-white rounded-lg border border-gray-200 p-3">
                        <ul className="space-y-2 text-sm">
                          {log.details.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {parsed && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{parsed.rows.length}</span> filas detectadas
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!embedded && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </Button>
            )}
            <Button 
              type="button" 
              disabled={!parsed || !canImport || importing} 
              onClick={handleImport}
              className={`${
                canImport && !importing
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } min-w-[120px]`}
            >
              {importing ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Importando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Importar productos</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </div>
  );

  if (embedded) {
    return (
      <div className="max-w-none bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          {Inner}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white border-0 rounded-2xl shadow-2xl">
        <div className="overflow-y-auto max-h-[95vh] p-6">
          {Inner}
        </div>
      </DialogContent>
    </Dialog>
  );
}