import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';

export class DatabaseService {
  private db: sqlite3.Database | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    const dbPath = path.join(app.getAppPath(), 'db.sqlite');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        // Ejecutar migraciones ligeras
        this.migrate().catch((e) => console.error('DB migration error:', e));
      }
    });
  }

  private async migrate() {
    // Agregar columna costo_unitario a productos si no existe
    try {
      const hasCol: any[] = await this.query(
        "PRAGMA table_info('productos')"
      );
      const exists = hasCol.some((c: any) => c.name === 'costo_unitario');
      if (!exists) {
        console.log('Migrating: adding productos.costo_unitario ...');
        await this.run(
          "ALTER TABLE productos ADD COLUMN costo_unitario DECIMAL(10,2) DEFAULT 0"
        );
        console.log('Migration done: productos.costo_unitario');
      }
    } catch (e) {
      console.error('Migration check/add costo_unitario failed:', e);
    }
  }

  // Método genérico para ejecutar consultas SELECT
  query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  // Método para ejecutar INSERT, UPDATE, DELETE
  run(sql: string, params: any[] = []): Promise<{ id?: number; changes: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  // Método para obtener un solo registro
  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
export const dbService = new DatabaseService();
