import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { CajasService, type Caja } from '../services/cajas-service';

interface CajaContextType {
  cajaActiva: Caja | null;
  loading: boolean;
  refreshCaja: () => Promise<void>;
  onCajaChange: (callback: (caja: Caja | null) => void) => () => void;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

interface CajaProviderProps {
  children: ReactNode;
}

export function CajaProvider({ children }: CajaProviderProps) {
  const [cajaActiva, setCajaActiva] = useState<Caja | null>(null);
  const [loading, setLoading] = useState(true);
  const callbacksRef = useRef<Set<(caja: Caja | null) => void>>(new Set());
  const cajaAnteriorRef = useRef<Caja | null>(null);

  const refreshCaja = useCallback(async () => {
    try {
      setLoading(true);
      const caja = await CajasService.getCajaActiva();
      const cajaAnterior = cajaAnteriorRef.current;
      
      setCajaActiva(caja);
      cajaAnteriorRef.current = caja;
      
      // Notificar a todos los callbacks si la caja cambió
      if (cajaAnterior?.id !== caja?.id) {
        callbacksRef.current.forEach(callback => callback(caja));
      }
    } catch (error) {
      console.error('Error al obtener caja activa:', error);
      setCajaActiva(null);
      cajaAnteriorRef.current = null;
    } finally {
      setLoading(false);
    }
  }, []);

  const onCajaChange = useCallback((callback: (caja: Caja | null) => void) => {
    callbacksRef.current.add(callback);
    
    // Retornar función de cleanup
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    refreshCaja();
  }, []);

  const value: CajaContextType = {
    cajaActiva,
    loading,
    refreshCaja,
    onCajaChange
  };

  return (
    <CajaContext.Provider value={value}>
      {children}
    </CajaContext.Provider>
  );
}

export function useCaja() {
  const context = useContext(CajaContext);
  if (context === undefined) {
    throw new Error('useCaja must be used within a CajaProvider');
  }
  return context;
}

// Hook personalizado para reaccionar a cambios de caja
export function useCajaChange(callback: (caja: Caja | null) => void) {
  const { onCajaChange } = useCaja();
  const callbackRef = useRef(callback);
  
  // Actualizar la referencia del callback en cada render
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  useEffect(() => {
    const stableCallback = (caja: Caja | null) => callbackRef.current(caja);
    const unsubscribe = onCajaChange(stableCallback);
    return unsubscribe;
  }, [onCajaChange]);
}