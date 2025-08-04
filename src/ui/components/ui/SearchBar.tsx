import { Search, X } from "lucide-react";

    interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    }

    export function SearchBar({ 
    searchTerm, 
    onSearchChange, 
    onClear, 
    placeholder = "Buscar..." 
    }: SearchBarProps) {
    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 transition-colors"
                />
                {searchTerm && (
                    <button
                        onClick={onClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
    }
