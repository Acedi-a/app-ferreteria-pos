import { Search } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export interface InventoryFiltersProps {
  searchTerm: string;
  onSearchTerm: (v: string) => void;
  selectedCategory: string;
  onSelectedCategory: (v: string) => void;
  categorias: string[];
  selectedMarca: string;
  onSelectedMarca: (v: string) => void;
  marcas: string[];
  onClear: () => void;
}

export function InventoryFilters({ searchTerm, onSearchTerm, selectedCategory, onSelectedCategory, categorias, selectedMarca, onSelectedMarca, marcas, onClear }: InventoryFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar Producto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Nombre o código..."
                value={searchTerm}
                onChange={(e) => onSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => onSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat === "Todas" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Marca</label>
            <select
              value={selectedMarca}
              onChange={(e) => onSelectedMarca(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {marcas.map((marca) => (
                <option key={marca} value={marca === "Todas" ? "" : marca}>
                  {marca}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={onClear} className="w-full">Limpiar Filtros</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
