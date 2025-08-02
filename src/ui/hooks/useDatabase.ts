import { useState, useEffect, useCallback } from 'react';

interface UseDbQueryOptions {
  immediate?: boolean;
}

// Hook para ejecutar consultas SELECT
export function useDbQuery<T = any>(
  sql: string, 
  params: any[] = [], 
  options: UseDbQueryOptions = { immediate: true }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.db.query(sql, params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Database query error:', err);
    } finally {
      setLoading(false);
    }
  }, [sql, JSON.stringify(params)]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, loading, error, refetch: execute };
}

// Hook para ejecutar operaciones INSERT, UPDATE, DELETE
export function useDbMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (sql: string, params: any[] = []) => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.db.run(sql, params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Database mutation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

// Hook para obtener un solo registro
export function useDbGet<T = any>(sql: string, params: any[] = [], immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.db.get(sql, params);
      setData(result || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Database get error:', err);
    } finally {
      setLoading(false);
    }
  }, [sql, JSON.stringify(params)]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
}
