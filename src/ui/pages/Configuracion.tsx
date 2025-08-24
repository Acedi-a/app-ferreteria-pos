import { useState, useEffect } from "react";
import { Building2, Receipt, Settings, Shield, TrendingUp } from "lucide-react";
import { ConfiguracionService } from "../services/configuracion-service";
import EmpresaTab from "./configuracion/EmpresaTab";
import TicketsTab from "./configuracion/TicketsTab";
import SistemaTab from "./configuracion/SistemaTab";
import BackupTab from "./configuracion/BackupTab";
import BackupsHistory from "./configuracion/BackupsHistory";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}


const tabs: Tab[] = [
  { id: "empresa", name: "Información de Empresa", icon: <Building2 className="h-4 w-4" /> },
  { id: "tickets", name: "Configuración de Tickets", icon: <Receipt className="h-4 w-4" /> },
  { id: "sistema", name: "Sistema", icon: <Settings className="h-4 w-4" /> },
  { id: "backup", name: "Backup & Restore", icon: <Shield className="h-4 w-4" /> },
];

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState("empresa");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [empresaConfig, setEmpresaConfig] = useState({ nombre_empresa: '', nit_empresa: '', direccion_empresa: '', telefono_empresa: '', email_empresa: '', ciudad_empresa: '', descripcion_empresa: '' });
  const [ticketsConfig, setTicketsConfig] = useState({ ticket_ancho: '80', ticket_impresora: '', ticket_encabezado: '', ticket_pie_pagina: '', ticket_mostrar_logo: 'true', ticket_auto_imprimir: 'true', ticket_mostrar_barcode: 'false' });
  const [sistemaConfig, setSistemaConfig] = useState({ auto_backup: 'true', log_activity: 'true', debug_mode: 'false', ultimo_backup: '' });

  useEffect(() => { cargarConfiguraciones(); }, []);

  const cargarConfiguraciones = async () => {
    try {
  const [empresa, tickets, sistema] = await Promise.all([
        ConfiguracionService.obtenerConfiguracionEmpresa(),
        ConfiguracionService.obtenerConfiguracionTickets(),
        ConfiguracionService.obtenerConfiguracionSistema()
      ]);
      setEmpresaConfig(prev => ({ ...prev, ...empresa }));
      setTicketsConfig(prev => ({ ...prev, ...tickets }));
      setSistemaConfig(prev => ({ ...prev, ...sistema }));
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      setMessage({ type: 'error', text: 'Error al cargar las configuraciones' });
    }
  };

  const mostrarMensaje = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const guardarEmpresa = async () => { try { setSaving(true); await ConfiguracionService.guardarConfiguracionEmpresa(empresaConfig); mostrarMensaje('success', 'Configuración de empresa guardada'); } catch (e) { mostrarMensaje('error', 'Error al guardar empresa'); } finally { setSaving(false); } };
  const guardarTickets = async () => { try { setSaving(true); await ConfiguracionService.guardarConfiguracionTickets(ticketsConfig); mostrarMensaje('success', 'Configuración de tickets guardada'); } catch (e) { mostrarMensaje('error', 'Error al guardar tickets'); } finally { setSaving(false); } };
  const guardarSistema = async () => { try { setSaving(true); await ConfiguracionService.guardarConfiguracionSistema(sistemaConfig); mostrarMensaje('success', 'Configuración del sistema guardada'); } catch (e) { mostrarMensaje('error', 'Error al guardar sistema'); } finally { setSaving(false); } };

  const crearRespaldoMarca = async () => {
    try {
      setSaving(true);
      await ConfiguracionService.crearRespaldo();
      const sistemaActualizado = await ConfiguracionService.obtenerConfiguracionSistema();
      setSistemaConfig(prev => ({ ...prev, ...sistemaActualizado }));
      mostrarMensaje('success', 'Marca de respaldo registrada');
    } finally { setSaving(false); }
  };

  const ejecutarBackupArchivo = async () => {
    const res = await window.electronAPI.backupDb();
    if (res.canceled) return;
    if (res.ok) { mostrarMensaje('success', `Respaldo guardado: ${res.path}`); await crearRespaldoMarca(); }
    else { mostrarMensaje('error', `No se pudo crear respaldo: ${res.error || ''}`); }
  };

  const ejecutarRestoreArchivo = async () => {
    const res = await window.electronAPI.restoreDb();
    if (res.canceled) return;
    if (res.ok) { mostrarMensaje('success', `Restaurado desde: ${res.path}. Reiniciando...`); }
    else { mostrarMensaje('error', `No se pudo restaurar: ${res.error || ''}`); }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'empresa':
        return (
          <EmpresaTab message={message} saving={saving} empresaConfig={empresaConfig} setEmpresaConfig={setEmpresaConfig} onSave={guardarEmpresa} />
        );
      case 'tickets':
        return (
          <TicketsTab message={message} saving={saving} ticketsConfig={ticketsConfig} setTicketsConfig={setTicketsConfig} onSave={guardarTickets} />
        );
      case 'sistema':
        return (
          <SistemaTab message={message} saving={saving} sistemaConfig={sistemaConfig} setSistemaConfig={setSistemaConfig} onSave={guardarSistema} onCreateBackupMark={crearRespaldoMarca} onRestoreClick={ejecutarRestoreArchivo} />
        );
      case 'backup':
        return (
          <div className="space-y-6">
            <BackupTab message={message} onBackupClick={ejecutarBackupArchivo} onRestoreClick={ejecutarRestoreArchivo} />
            <BackupsHistory />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-sm text-gray-600">Personaliza y configura tu sistema POS</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded border border-gray-200">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sistema Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Panel de Configuración</h2>
                <p className="text-sm text-gray-600">Selecciona una sección para configurar</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <nav className="grid grid-cols-1 md:grid-cols-6 gap-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-gray-900 bg-gray-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      activeTab === tab.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {tab.icon}
                    </div>
                    <span className="text-sm font-medium">{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
