    import { Search } from "lucide-react";
    import { Card, CardContent } from "../Card";
    import { Button } from "../Button";

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
        <Card>
        <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <Button
                variant="outline"
                onClick={onClear}
            >
                Limpiar
            </Button>
            </div>
        </CardContent>
        </Card>
    );
    }
