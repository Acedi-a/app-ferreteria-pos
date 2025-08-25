import { CheckCircle, Receipt } from "lucide-react";

interface Props {
  message: { type: 'success' | 'error'; text: string } | null;
  ticketsConfig: any;
  setTicketsConfig: (v: any) => void;
  onSave: () => void;
}

export default function TicketsTab({ message, ticketsConfig, setTicketsConfig, onSave }: Props) {
  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <Receipt className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Configuración de Tickets</h3>
              <p className="text-sm text-gray-600">Personaliza el formato y opciones de impresión</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ancho del Ticket (mm)
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={["58","80","110"].includes(ticketsConfig.ticket_ancho) ? ticketsConfig.ticket_ancho : "custom"}
                    onChange={(e) => {
                      if (e.target.value === "custom") return;
                      setTicketsConfig({ ...ticketsConfig, ticket_ancho: e.target.value });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="58">58mm</option>
                    <option value="80">80mm</option>
                    <option value="110">110mm</option>
                    <option value="custom">Otro...</option>
                  </select>
                  <input
                    type="number"
                    min={30}
                    max={200}
                    step={1}
                    placeholder="Personalizado"
                    value={!(["58","80","110"].includes(ticketsConfig.ticket_ancho)) ? ticketsConfig.ticket_ancho : ''}
                    onChange={e => {
                      const val = e.target.value;
                      setTicketsConfig({ ...ticketsConfig, ticket_ancho: val });
                    }}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                  <span className="text-sm text-gray-500">mm</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Puedes elegir una opción o escribir el ancho deseado (30-200mm).</p>
              </div>  
              
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensaje del Encabezado
              </label>
              <textarea
                rows={2}
                value={ticketsConfig.ticket_encabezado}
                onChange={(e) => setTicketsConfig({ ...ticketsConfig, ticket_encabezado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensaje del Pie de Página
              </label>
              <textarea
                rows={2}
                value={ticketsConfig.ticket_pie_pagina}
                onChange={(e) => setTicketsConfig({ ...ticketsConfig, ticket_pie_pagina: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            
          </form>
        </div>
      </div>
    </div>
  );
}
