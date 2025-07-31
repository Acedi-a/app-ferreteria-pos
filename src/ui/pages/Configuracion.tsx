import { useState } from "react";
import { Building2, Receipt, Calculator, Users, Settings, Plus, Edit, Trash2, Save, Download, Upload } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimo_acceso: string;
}

/* --- Datos --- */
const tabs: Tab[] = [
  { id: "empresa", name: "Información de Empresa", icon: <Building2 className="h-4 w-4" /> },
  { id: "tickets", name: "Configuración de Tickets", icon: <Receipt className="h-4 w-4" /> },
  { id: "impuestos", name: "Impuestos", icon: <Calculator className="h-4 w-4" /> },
  { id: "usuarios", name: "Usuarios", icon: <Users className="h-4 w-4" /> },
  { id: "sistema", name: "Sistema", icon: <Settings className="h-4 w-4" /> },
];

const initialUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: "Administrador",
    email: "admin@ferreteria.com",
    rol: "Administrador",
    activo: true,
    ultimo_acceso: "2024-01-20T14:30:00",
  },
  {
    id: 2,
    nombre: "Vendedor 1",
    email: "vendedor1@ferreteria.com",
    rol: "Vendedor",
    activo: true,
    ultimo_acceso: "2024-01-20T12:15:00",
  },
  {
    id: 3,
    nombre: "Cajero",
    email: "cajero@ferreteria.com",
    rol: "Cajero",
    activo: false,
    ultimo_acceso: "2024-01-18T16:45:00",
  },
];

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState("empresa");
  const [usuarios] = useState<Usuario[]>(initialUsuarios);

  const renderEmpresaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  defaultValue="Ferretería El Martillo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">NIT/RUT</label>
                <input
                  type="text"
                  defaultValue="900123456-7"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
              <input
                type="text"
                defaultValue="Calle 123 #45-67, Centro"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  defaultValue="(601) 234-5678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="info@ferreteria.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  defaultValue="Bogotá"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción del Negocio
              </label>
              <textarea
                rows={3}
                defaultValue="Ferretería especializada en herramientas, materiales de construcción y suministros industriales."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderTicketsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ancho del Ticket (mm)
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="58">58mm</option>
                  <option value="80" selected>80mm</option>
                  <option value="110">110mm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Impresora</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Seleccionar impresora...</option>
                  <option value="thermal1">Impresora Térmica 1</option>
                  <option value="thermal2">Impresora Térmica 2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensaje del Encabezado
              </label>
              <textarea
                rows={2}
                defaultValue="¡Gracias por su compra!"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensaje del Pie de Página
              </label>
              <textarea
                rows={2}
                defaultValue="Vuelva pronto. Garantía en todos nuestros productos."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="logo"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="logo" className="text-sm text-slate-700">
                  Mostrar logo en el ticket
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-print"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="auto-print" className="text-sm text-slate-700">
                  Imprimir automáticamente después de la venta
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="barcode"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="barcode" className="text-sm text-slate-700">
                  Mostrar código de barras en el ticket
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline">
                <Receipt className="mr-2 h-4 w-4" />
                Imprimir Prueba
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderImpuestosTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Impuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IVA General (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue="19.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IVA Reducido (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue="5.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Retención en la Fuente (%)
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="2.50"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default-iva"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="default-iva" className="text-sm text-slate-700">
                  Aplicar IVA por defecto en productos nuevos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-taxes"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="show-taxes" className="text-sm text-slate-700">
                  Mostrar impuestos desglosados en tickets
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-calc"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="auto-calc" className="text-sm text-slate-700">
                  Calcular impuestos automáticamente
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsuariosTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Gestión de Usuarios</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nombre}</TableCell>
                  <TableCell className="text-slate-500">{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant="default">{usuario.rol}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(usuario.ultimo_acceso).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.activo ? "success" : "destructive"}>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSistemaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-slate-900 mb-3">Respaldo de Datos</h4>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Crear Respaldo
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurar Respaldo
                </Button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Último respaldo: 20 de enero de 2024 a las 02:00 AM
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium text-slate-900 mb-3">Información del Sistema</h4>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Versión:</span> 1.0.0
                  </div>
                  <div>
                    <span className="font-medium">Base de Datos:</span> SQLite
                  </div>
                  <div>
                    <span className="font-medium">Última Actualización:</span> 15 de enero de 2024
                  </div>
                  <div>
                    <span className="font-medium">Espacio Usado:</span> 245 MB
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-slate-900 mb-3">Configuraciones Avanzadas</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-backup"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="auto-backup" className="text-sm text-slate-700">
                    Habilitar respaldos automáticos diarios
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="log-activity"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="log-activity" className="text-sm text-slate-700">
                    Registrar actividad de usuarios
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="debug-mode"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="debug-mode" className="text-sm text-slate-700">
                    Modo de desarrollo (mostrar errores detallados)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "empresa":
        return renderEmpresaTab();
      case "tickets":
        return renderTicketsTab();
      case "impuestos":
        return renderImpuestosTab();
      case "usuarios":
        return renderUsuariosTab();
      case "sistema":
        return renderSistemaTab();
      default:
        return renderEmpresaTab();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-sm text-slate-500">Personaliza y configura tu sistema POS</p>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </Card>
    </div>
  );
}
