import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';

export class DatabaseService {
  private db: sqlite3.Database | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // En desarrollo, usar la ruta del proyecto
    // En producción, usar userData para que sea escribible
    const isDev = process.env.NODE_ENV === 'development';
    const dbPath = isDev 
      ? path.join(app.getAppPath(), 'db.sqlite')
      : path.join(app.getPath('userData'), 'db.sqlite');
    
    // Si es producción y no existe la DB, copiar desde recursos
    if (!isDev) {
      const fs = require('fs');
      const resourceDbPath = path.join(process.resourcesPath, 'db.sqlite');
      if (!fs.existsSync(dbPath) && fs.existsSync(resourceDbPath)) {
        fs.copyFileSync(resourceDbPath, dbPath);
      }
    }
    
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

    // Crear tabla cuentas_por_pagar si no existe
    try {
      await this.run(`
        CREATE TABLE IF NOT EXISTS cuentas_por_pagar (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proveedor_id INTEGER NOT NULL,
          compra_id INTEGER,
          monto DECIMAL(10,2) NOT NULL,
          saldo DECIMAL(10,2) NOT NULL,
          fecha_vencimiento DATE,
          estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'vencida', 'pagada')),
          observaciones TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
        )
      `);
      console.log('Migration done: cuentas_por_pagar table created');
    } catch (e) {
      console.error('Migration create cuentas_por_pagar failed:', e);
    }

    // Crear tabla pagos_proveedores si no existe
    try {
      await this.run(`
        CREATE TABLE IF NOT EXISTS pagos_proveedores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cuenta_id INTEGER NOT NULL,
          monto DECIMAL(10,2) NOT NULL,
          metodo_pago TEXT NOT NULL,
          fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
          observaciones TEXT,
          FOREIGN KEY (cuenta_id) REFERENCES cuentas_por_pagar(id)
        )
      `);
      console.log('Migration done: pagos_proveedores table created');
    } catch (e) {
      console.error('Migration create pagos_proveedores failed:', e);
    }

    // Agregar columna saldo_pendiente a proveedores si no existe
    try {
      const hasProvCol: any[] = await this.query(
        "PRAGMA table_info('proveedores')"
      );
      const existsProv = hasProvCol.some((c: any) => c.name === 'saldo_pendiente');
      if (!existsProv) {
        console.log('Migrating: adding proveedores.saldo_pendiente ...');
        await this.run(
          "ALTER TABLE proveedores ADD COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0"
        );
        console.log('Migration done: proveedores.saldo_pendiente');
      }
    } catch (e) {
      console.error('Migration check/add saldo_pendiente to proveedores failed:', e);
    }

    // Agregar columna imagen_url a productos si no existe
    try {
      const cols: any[] = await this.query("PRAGMA table_info('productos')");
      const hasImagen = cols.some((c: any) => c.name === 'imagen_url');
      if (!hasImagen) {
        console.log('Migrating: adding productos.imagen_url ...');
        await this.run("ALTER TABLE productos ADD COLUMN imagen_url TEXT");
        console.log('Migration done: productos.imagen_url');
      }
    } catch (e) {
      console.error('Migration check/add imagen_url failed:', e);
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
