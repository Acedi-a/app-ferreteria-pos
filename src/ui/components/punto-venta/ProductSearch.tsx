import React from 'react';
import { Search } from 'lucide-react';
import { PuntoVentaService, type Producto } from '../../services/punto-venta-service';

interface ProductSearchProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (producto: Producto) => void;
  onEnter?: () => void;
  onQuickCreate?: (nombre: string) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
}

export default function ProductSearch({ value, onChange, onSelect, onEnter, onQuickCreate, placeholder = 'Escanee código o escriba nombre/código', inputRef, autoFocus }: ProductSearchProps) {
  const [results, setResults] = React.useState<Producto[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Cargar data en vivo con debounce
  React.useEffect(() => {
    const term = value.trim();
    if (!term) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const list = await PuntoVentaService.buscarProductos(term, 12);
        setResults(list);
        setOpen(list.length > 0);
        setHighlight(0);
      } catch {}
      setLoading(false);
    }, 200);
    return () => clearTimeout(id);
  }, [value]);

  // Cerrar al click fuera
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Atajo: Shift + Espacio => alta rápida con el nombre actual
    if ((e.code === 'Space' || e.key === ' ') && e.shiftKey) {
      e.preventDefault();
      const nombre = value.trim();
      if (nombre && onQuickCreate) onQuickCreate(nombre);
      return;
    }
    if (e.key === 'ArrowDown' && open && results.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === 'ArrowUp' && open && results.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (open && results.length > 0) {
        e.preventDefault();
        const sel = results[highlight];
        if (sel) handleSelect(sel);
      } else if (onEnter) {
        // Permite al padre manejar Enter para escaneo exacto
        onEnter();
      }
    }
  };

  const handleSelect = (p: Producto) => {
    onSelect(p);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
          {results.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 ${idx === highlight ? 'bg-gray-50' : ''}`}
            >
              <ResultItem producto={p} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultItem({ producto }: { producto: Producto }) {
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!producto.imagen_url) { setSrc(null); return; }
        if (producto.imagen_url.startsWith('file://')) {
          const data = await window.electronAPI.imageToDataUrl(producto.imagen_url);
          if (active) setSrc(data);
        } else {
          setSrc(producto.imagen_url);
        }
      } catch {
        setSrc(null);
      }
    })();
    return () => { active = false; };
  }, [producto.imagen_url]);

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-gray-100 border overflow-hidden flex items-center justify-center">
        {src ? (
          <img src={src} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded" />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{producto.nombre}</div>
        {producto.marca && (
          <div className="text-xs text-gray-600 truncate">{producto.marca}</div>
        )}
        <div className="text-xs text-gray-500 truncate">{producto.codigo_interno || producto.codigo_barras || '—'} • Bs {producto.precio_venta.toFixed(2)}</div>
        <div className="text-[11px] text-gray-400">
          {producto.categoria_nombre || 'Sin categoría'} • Stock: {Number(producto.stock_actual || 0)}
        </div>
      </div>
    </div>
  );
}
