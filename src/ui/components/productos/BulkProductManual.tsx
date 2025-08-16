import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import type { Categoria, TipoUnidad, Producto } from "../../services/productos-service";
import { productosService } from "../../services/productos-service";
import { nanoid } from "nanoid";

interface BulkProductManualProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: Categoria[];
  tiposUnidad: TipoUnidad[];
  onSaved: (created: number, errors: number) => void;
  embedded?: boolean;
}

interface Row extends Partial<Producto> {
  _key: string;
  _status?: 'ready' | 'saving' | 'ok' | 'error';
  _errorMsg?: string;
  _preview?: string | null;
}

const emptyRow = (): Row => ({
  _key: Math.random().toString(36).slice(2),
  activo: true,
  codigo_barras: '',
  codigo_interno: nanoid(12),
  nombre: '',
  descripcion: '',
  precio_venta: 0,
  costo_unitario: undefined,
  stock_minimo: 0,
  categoria_id: undefined,
  tipo_unidad_id: undefined,
  unidad_medida: '',
  imagen_url: undefined,
});

export default function BulkProductManual({ isOpen, onClose, categorias, tiposUnidad, onSaved, embedded = false }: BulkProductManualProps) {
  const [rows, setRows] = React.useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [saving, setSaving] = React.useState(false);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setRows([emptyRow(), emptyRow(), emptyRow()]);
      onClose();
    }
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);
  const removeRow = (key: string) => setRows(prev => prev.filter(r => r._key !== key));

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows(prev => prev.map(r => r._key === key ? { ...r, ...patch } : r));
  };

  const validar = (r: Row): string | null => {
    if (!r.codigo_interno?.trim()) return 'Código interno es requerido';
    if (!r.nombre?.trim()) return 'Nombre es requerido';
    if (r.precio_venta === undefined || isNaN(Number(r.precio_venta))) return 'Precio venta inválido';
    if (r.stock_minimo === undefined || isNaN(Number(r.stock_minimo))) return 'Stock mínimo inválido';
    return null;
  };

  const guardarTodo = async () => {
    setSaving(true);
    let created = 0;
    let errors = 0;

    for (const r of rows) {
      const errMsg = validar(r);
      if (errMsg) {
        errors++;
        updateRow(r._key, { _status: 'error', _errorMsg: errMsg });
        continue;
      }

      const dup = await productosService.obtenerProductoPorCodigo(r.codigo_interno!);
      if (dup) {
        errors++;
        updateRow(r._key, { _status: 'error', _errorMsg: 'Código ya existe' });
        continue;
      }

      try {
        updateRow(r._key, { _status: 'saving', _errorMsg: '' });
        const payload: Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> = {
          codigo_barras: r.codigo_barras || undefined,
          codigo_interno: r.codigo_interno!,
          nombre: r.nombre!,
          descripcion: r.descripcion || undefined,
          precio_venta: Number(r.precio_venta),
          costo_unitario: r.costo_unitario !== undefined ? Number(r.costo_unitario) : undefined,
          stock_minimo: Number(r.stock_minimo),
          categoria_id: r.categoria_id || undefined,
          tipo_unidad_id: r.tipo_unidad_id || undefined,
          unidad_medida: r.unidad_medida || undefined,
          activo: r.activo ?? true,
          imagen_url: r.imagen_url || undefined,
        };
        await productosService.crearProducto(payload);
        created++;
        updateRow(r._key, { _status: 'ok' });
      } catch (e: any) {
        errors++;
        updateRow(r._key, { _status: 'error', _errorMsg: e?.message || 'Error al guardar' });
      }
    }

    setSaving(false);
    onSaved(created, errors);
  };

  const selectImage = async (r: Row) => {
    try {
      const res = await window.electronAPI.importImage();
      if (res && res.url) {
        if (r.imagen_url && r.imagen_url.startsWith('file://') && r.imagen_url !== res.url) {
          try { await window.electronAPI.deleteImage(r.imagen_url); } catch {}
        }
        let preview: string | null = null;
        try { preview = await window.electronAPI.imageToDataUrl(res.url); } catch { preview = null; }
        updateRow(r._key, { imagen_url: res.url, _preview: preview });
      }
    } catch (e) {
      // noop
    }
  };

  const removeImage = async (r: Row) => {
    if (r.imagen_url && r.imagen_url.startsWith('file://')) {
      try { await window.electronAPI.deleteImage(r.imagen_url); } catch {}
    }
    updateRow(r._key, { imagen_url: undefined, _preview: null });
  };

  const getRowStatusIcon = (status?: string) => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-medium">Guardando</span>
          </div>
        );
      case 'ok':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium">Guardado</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs font-medium">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Pendiente</span>
          </div>
        );
    }
  };

  const completedCount = rows.filter(r => r._status === 'ok').length;
  const errorCount = rows.filter(r => r._status === 'error').length;
  const pendingCount = rows.filter(r => !r._status || r._status === 'ready').length;

  const Inner = (
    <div className="min-h-full">
      <DialogHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">Registro Masivo Manual</DialogTitle>
            <DialogDescription className="text-gray-600">
              Crea varios productos directamente desde esta tabla. Todos los cambios se guardan de una vez.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Panel de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">{rows.length}</div>
                <div className="text-xs text-blue-600 font-medium">Total filas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-700">{pendingCount}</div>
                <div className="text-xs text-yellow-600 font-medium">Pendientes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-green-700">{completedCount}</div>
                <div className="text-xs text-green-600 font-medium">Completados</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-red-700">{errorCount}</div>
                <div className="text-xs text-red-600 font-medium">Con errores</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Tabla de Productos</h4>
              </div>
              <Button 
                variant="outline" 
                onClick={addRow}
                className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar fila
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Estado</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Imagen</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                    Código interno<span className="text-red-500 ml-1">*</span>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Código barras</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                    Nombre<span className="text-red-500 ml-1">*</span>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Descripción</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                    Precio venta<span className="text-red-500 ml-1">*</span>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Costo unitario</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                    Stock mínimo<span className="text-red-500 ml-1">*</span>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Categoría</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Tipo unidad</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Unidad medida</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200">Activo</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r) => {
                  const hasError = r._status === 'error';
                  const isComplete = r._status === 'ok';
                  const isProcessing = r._status === 'saving';
                  
                  return (
                    <tr 
                      key={r._key} 
                      className={`
                        transition-colors duration-200
                        ${hasError ? 'bg-red-50/50' : ''}
                        ${isComplete ? 'bg-green-50/50' : ''}
                        ${isProcessing ? 'bg-blue-50/50' : ''}
                        ${!hasError && !isComplete && !isProcessing ? 'hover:bg-gray-50/50' : ''}
                      `}
                    >
                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="flex flex-col gap-1">
                          {getRowStatusIcon(r._status)}
                          {hasError && r._errorMsg && (
                            <div className="text-xs text-red-600 max-w-24 truncate" title={r._errorMsg}>
                              {r._errorMsg}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            {r._preview ? (
                              <img 
                                src={r._preview} 
                                alt="Preview" 
                                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm" 
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => selectImage(r)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              {r._preview ? 'Cambiar' : 'Seleccionar'}
                            </Button>
                            {r.imagen_url && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => removeImage(r)}
                                className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700"
                              >
                                Quitar
                              </Button>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.codigo_interno || ''} 
                          onChange={(e) => updateRow(r._key, { codigo_interno: e.target.value })}
                          placeholder="SKU-001"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.codigo_barras || ''} 
                          onChange={(e) => updateRow(r._key, { codigo_barras: e.target.value })}
                          placeholder="775123456789"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          className="w-48 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.nombre || ''} 
                          onChange={(e) => updateRow(r._key, { nombre: e.target.value })}
                          placeholder="Nombre del producto"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          className="w-48 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.descripcion || ''} 
                          onChange={(e) => updateRow(r._key, { descripcion: e.target.value })}
                          placeholder="Descripción opcional"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          type="number" 
                          step="0.01" 
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.precio_venta ?? ''} 
                          onChange={(e) => updateRow(r._key, { precio_venta: Number(e.target.value) })}
                          placeholder="0.00"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          type="number" 
                          step="0.01" 
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.costo_unitario ?? ''} 
                          onChange={(e) => updateRow(r._key, { costo_unitario: Number(e.target.value) })}
                          placeholder="0.00"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          type="number" 
                          className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.stock_minimo ?? ''} 
                          onChange={(e) => updateRow(r._key, { stock_minimo: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <Select 
                          value={r.categoria_id ?? ''} 
                          onChange={(e) => updateRow(r._key, { categoria_id: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-32 text-sm"
                        >
                          <option value="">— Categoría —</option>
                          {categorias.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </Select>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <Select 
                          value={r.tipo_unidad_id ?? ''} 
                          onChange={(e) => updateRow(r._key, { tipo_unidad_id: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-32 text-sm"
                        >
                          <option value="">— Tipo —</option>
                          {tiposUnidad.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre} ({t.abreviacion})</option>
                          ))}
                        </Select>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <input 
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                          value={r.unidad_medida || ''} 
                          onChange={(e) => updateRow(r._key, { unidad_medida: e.target.value })}
                          placeholder="kg, lt, pz"
                        />
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={r.activo ?? true} 
                            onChange={(e) => updateRow(r._key, { activo: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-600">{r.activo ? 'Sí' : 'No'}</span>
                        </label>
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Button 
                          variant="ghost" 
                          onClick={() => removeRow(r._key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                          disabled={rows.length <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de acciones */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">
                  {saving ? 'Procesando productos...' : `${rows.length} productos en la tabla`}
                </span>
              </div>
              
              {(completedCount > 0 || errorCount > 0) && (
                <div className="flex items-center gap-3 text-sm">
                  {completedCount > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{completedCount} guardados</span>
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{errorCount} con errores</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={addRow}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                disabled={saving}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar producto
              </Button>
              
              <Button 
                onClick={guardarTodo} 
                disabled={saving || rows.length === 0}
                className={`${
                  !saving && rows.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } min-w-[140px]`}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Guardar todos</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Instrucciones de uso:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Los campos marcados con <span className="text-red-600 font-medium">*</span> son obligatorios</li>
                  <li>El código interno se genera automáticamente, pero puedes modificarlo</li>
                  <li>Puedes seleccionar imágenes para cada producto</li>
                  <li>Los productos se guardan uno por uno al hacer clic en "Guardar todos"</li>
                  <li>Los errores se muestran en tiempo real en la columna de estado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!embedded && (
        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Progreso:</span> {completedCount} de {rows.length} productos guardados
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      )}
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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden bg-white border-0 rounded-2xl shadow-2xl">
        <div className="overflow-y-auto max-h-[95vh] p-6">
          {Inner}
        </div>
      </DialogContent>
    </Dialog>
  );
}