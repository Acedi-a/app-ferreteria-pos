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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 text-base font-light placeholder-gray-400 transition-all duration-200 shadow-lg focus:shadow-xl"
                />
                {searchTerm && (
                    <button
                        onClick={onClear}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
    }
