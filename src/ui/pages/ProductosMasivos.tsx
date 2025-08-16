import React from 'react';
import { Button } from "../components/ui/Button";
import BulkProductImport from "../components/productos/BulkProductImport";
import BulkProductManual from "../components/productos/BulkProductManual";
import { productosService } from "../services/productos-service";
import type { Categoria, TipoUnidad } from "../services/productos-service";
import { useToast } from "../components/ui/use-toast";

export default function ProductosMasivos() {
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [tiposUnidad, setTiposUnidad] = React.useState<TipoUnidad[]>([]);
  const [ready, setReady] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    (async () => {
      const [cats, tus] = await Promise.all([
        productosService.obtenerCategorias(),
        productosService.obtenerTiposUnidad()
      ]);
      setCategorias(cats);
      setTiposUnidad(tus);
      setReady(true);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className=" mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Registros Masivos de Productos</h1>
              <p className="text-sm text-gray-600">Importa desde archivo o captura manualmente muchos productos</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => history.back()}>Volver</Button>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto  space-y-8">
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Importación desde archivo</h2>
          <p className="text-sm text-gray-600 mb-4">Usa archivos CSV o XLSX, mapea las columnas y revisa un preview antes de importar.</p>
          {ready && (
            <BulkProductImport
              isOpen={true}
              onClose={() => {}}
              categorias={categorias}
              tiposUnidad={tiposUnidad}
              embedded
              onImported={({ created, skipped, errors }) => {
                toast({ title: 'Importación', description: `Creados: ${created} · Omitidos: ${skipped} · Errores: ${errors}` });
              }}
            />
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Registro masivo manual</h2>
          <p className="text-sm text-gray-600 mb-4">Agrega múltiples filas e ingresa los datos a mano, todo en una sola vista.</p>
          {ready && (
            <BulkProductManual
              isOpen={true}
              onClose={() => {}}
              categorias={categorias}
              tiposUnidad={tiposUnidad}
              embedded
              onSaved={(created, errors) => {
                toast({ title: 'Registro masivo', description: `Creados: ${created} · Errores: ${errors}` });
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}
