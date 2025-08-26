import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    barcodeSearch?: boolean;
}

    export function SearchBar({ 
    searchTerm, 
    onSearchChange, 
    onClear, 
    placeholder = "Buscar...",
    barcodeSearch = false
}: SearchBarProps) {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Actualizar localSearchTerm cuando cambia searchTerm desde props
    // pero solo si no estamos en proceso de limpiar
    useEffect(() => {
        if (searchTerm !== "") {
            setLocalSearchTerm(searchTerm);
        }
    }, [searchTerm]);

    // Manejar el debounce del término de búsqueda local
    useEffect(() => {
        const term = localSearchTerm.trim();
        
        // Detectar si es un código de barras (solo números y/o guiones)
        const isBarcode = /^[0-9\-]+$/.test(term);
        
        // Si es código de barras y barcodeSearch está habilitado, usar un delay más corto
        const delay = (isBarcode && barcodeSearch) ? 300 : 500;
        
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(term);
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [localSearchTerm, barcodeSearch]);

    // Disparar onSearchChange solo cuando debouncedSearchTerm cambia
    useEffect(() => {
        if (debouncedSearchTerm !== searchTerm) {
            onSearchChange(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, onSearchChange, searchTerm]);

    const handleClear = () => {
        setLocalSearchTerm("");
        setDebouncedSearchTerm("");
        onClear();
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                />
                {localSearchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
    }
