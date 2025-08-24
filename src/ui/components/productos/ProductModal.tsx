import { X, ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import type { Producto, Categoria, TipoUnidad } from "../../services/productos-service";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProduct: Producto | null;
  formData: Partial<Producto>;
  setFormData: (data: Partial<Producto>) => void;
  categorias: Categoria[];
  tiposUnidad: TipoUnidad[];
}

function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  formData,
  setFormData,
  categorias,
  tiposUnidad
}: ProductModalProps) {
  
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const handleInputChange = (field: keyof Producto, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDialogOpenChange = (open: boolean) => {
    // Solo permitir cerrar el modal si se hace explícitamente
    if (!open) {
      onClose();
    }
  };

  const handleImportImage = async () => {
    try {
      const res = await window.electronAPI.importImage();
      if (res && res.url) {
        const old = formData.imagen_url;
        // Si había una imagen previa gestionada por la app, eliminarla antes de asignar la nueva (evita condiciones de carrera)
        if (old && old.startsWith('file://') && old !== res.url) {
          try { await window.electronAPI.deleteImage(old); } catch {}
        }
        setFormData({ ...formData, imagen_url: res.url });
      }
    } catch (e) {
      console.error('Error importando imagen:', e);
    }
  };

  // Resolver preview entre data URL y rutas file://
  React.useEffect(() => {
    let active = true;
    const src = formData.imagen_url;
    const run = async () => {
      if (!src) { setPreviewUrl(null); return; }
      if (src.startsWith('file://')) {
        const data = await window.electronAPI.imageToDataUrl(src);
        if (active) setPreviewUrl(data);
      } else {
        setPreviewUrl(src);
      }
    };
    run();
    return () => { active = false; };
  }, [formData.imagen_url]);

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modifica los datos del producto" : "Ingresa los datos del nuevo producto"}
              </DialogDescription>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Interno *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="product-codigo-interno"
                  key="product-codigo-interno"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !editingProduct ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                  value={formData.codigo_interno || ""}
                  onChange={(e) => handleInputChange('codigo_interno', e.target.value)}
                  placeholder="Generado automáticamente"
                  readOnly={!editingProduct}
                  required
                />
                {!editingProduct && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('codigo_interno', nanoid(12))}
                    className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs flex items-center gap-1"
                    title="Generar nuevo código"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Nuevo
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                id="product-codigo-barras"
                key="product-codigo-barras"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.codigo_barras || ""}
                onChange={(e) => handleInputChange('codigo_barras', e.target.value)}
                placeholder="Código de barras del producto"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="product-nombre"
              key="product-nombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={formData.nombre || ""}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              id="product-marca"
              key="product-marca"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={formData.marca || ""}
              onChange={(e) => handleInputChange('marca' as any, e.target.value)}
              placeholder="Marca / fabricante"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="product-descripcion"
              key="product-descripcion"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              value={formData.descripcion || ""}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select
                value={formData.categoria_id?.toString() || ""}
                onValueChange={(value) => handleInputChange('categoria_id', value ? Number(value) : undefined)}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <Select
                value={formData.tipo_unidad_id?.toString() || ""}
                onValueChange={(value) => handleInputChange('tipo_unidad_id', value ? Number(value) : undefined)}
              >
                <option value="">Seleccionar unidad</option>
                {tiposUnidad.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre} ({tipo.abreviacion})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Unitario (Base)
              </label>
              <input
                type="number"
                step="0.01"
                id="product-costo-unitario"
                key="product-costo-unitario"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={(formData as any).costo_unitario ?? ""}
                onChange={(e) => handleInputChange('costo_unitario' as any, Number(e.target.value))}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Este costo se usará por defecto en entradas y para cálculos de margen.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta Sugerido *
              </label>
              <input
                type="number"
                step="0.01"
                id="product-precio-venta"
                key="product-precio-venta"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.precio_venta || ""}
                onChange={(e) => handleInputChange('precio_venta', Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Stock actual removed - now calculated from movimientos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                id="product-stock-minimo"
                key="product-stock-minimo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.stock_minimo || ""}
                onChange={(e) => handleInputChange('stock_minimo', Number(e.target.value))}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="venta-fraccionada"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={Boolean((formData as any).venta_fraccionada)}
                onChange={(e) => setFormData({ ...formData, venta_fraccionada: e.target.checked } as any)}
              />
              <label htmlFor="venta-fraccionada" className="text-sm text-gray-700 font-medium">
                Permitir venta fraccionada (cantidades decimales)
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.activo !== false}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
              <label htmlFor="activo" className="text-sm text-gray-700 font-medium">
                Producto activo
              </label>
            </div>
          </div>

          {/* Imagen del producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto
            </label>
    {formData.imagen_url ? (
              <div className="flex items-start gap-4">
                <img
      src={previewUrl || ''}
                  alt="Producto"
                  className="w-28 h-28 object-cover rounded border"
                />
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" onClick={handleImportImage}>
                    Cambiar imagen
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 w-fit"
                    onClick={async () => {
                      if (formData.imagen_url && formData.imagen_url.startsWith('file://')) {
                        try { await window.electronAPI.deleteImage(formData.imagen_url); } catch {}
                      }
                      setPreviewUrl(null);
                      setFormData({ ...formData, imagen_url: undefined });
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Quitar imagen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center bg-gray-50">
                <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-3">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">No hay imagen seleccionada</p>
                <Button type="button" onClick={handleImportImage}>Seleccionar imagen…</Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingProduct ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(ProductModal);
