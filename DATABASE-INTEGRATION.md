# Integración SQLite en Aplicación Electron - Ferretería POS

## 📋 Resumen de la Implementación

Se ha implementado una solución completa para integrar SQLite directamente en tu aplicación Electron, evitando la necesidad de un servidor Node.js separado. Esta implementación incluye:

1. **Servicio de Base de Datos** (`src/electron/database.ts`)
2. **IPC Handlers** en el proceso principal
3. **Preload Script** para exposición segura de APIs
4. **Hooks de React** para facilitar el uso en componentes
5. **Servicios específicos** para cada entidad del negocio

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React UI      │────▶│   Preload       │────▶│  Main Process   │
│   (Renderer)    │     │   (Bridge)      │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   useDatabase   │     │  electronAPI    │     │   SQLite DB     │
│     hooks       │     │                 │     │   (db.sqlite)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install sqlite3 @types/sqlite3
```

### 2. Crear/actualizar la base de datos
Ejecuta el script SQL en `database-schema.sql` para crear las tablas:

```bash
# Si tienes sqlite3 instalado globalmente
sqlite3 db.sqlite < database-schema.sql

# O desde Node.js (crear un script temporal)
node -e "
const sqlite3 = require('sqlite3');
const fs = require('fs');
const db = new sqlite3.Database('db.sqlite');
const sql = fs.readFileSync('database-schema.sql', 'utf8');
db.exec(sql, (err) => {
  if (err) console.error(err);
  else console.log('Base de datos creada exitosamente');
  db.close();
});
"
```

### 3. Compilar Electron
```bash
npm run transpile:electron
```

### 4. Ejecutar la aplicación
```bash
npm run dev
```

## 📁 Estructura de Archivos Creados

```
src/
├── electron/
│   ├── database.ts           # Servicio principal de base de datos
│   ├── preload.ts           # Bridge seguro entre renderer y main
│   └── main.ts              # Actualizado con IPC handlers
├── ui/
│   ├── hooks/
│   │   └── useDatabase.ts   # Hooks de React para database
│   ├── services/
│   │   └── database-services.ts  # Servicios específicos por entidad
│   ├── types/
│   │   └── electron.d.ts    # Tipos TypeScript para Electron API
│   └── examples/
│       ├── ProductosWithDatabase.tsx     # Ejemplo básico
│       └── ProductosConServicio.tsx      # Ejemplo con servicios
└── database-schema.sql      # Schema de la base de datos
```

## 🛠️ Uso en Componentes

### Opción 1: Usando hooks directamente
```tsx
import { useDbQuery, useDbMutation } from '../hooks/useDatabase';

function MiComponente() {
  const { data, loading, error, refetch } = useDbQuery<Producto>(
    'SELECT * FROM productos WHERE activo = 1'
  );
  
  const { execute: crear } = useDbMutation();
  
  const handleCreate = async () => {
    await crear('INSERT INTO productos (nombre, precio) VALUES (?, ?)', ['Producto', 10.99]);
    refetch();
  };
}
```

### Opción 2: Usando servicios específicos (RECOMENDADO)
```tsx
import { ProductoService } from '../services/database-services';

function MiComponente() {
  const [productos, setProductos] = useState([]);
  
  useEffect(() => {
    cargarProductos();
  }, []);
  
  const cargarProductos = async () => {
    const data = await ProductoService.obtenerTodos();
    setProductos(data);
  };
  
  const crearProducto = async (producto) => {
    await ProductoService.crear(producto);
    cargarProductos();
  };
}
```

## 📊 Servicios Disponibles

### ProductoService
- `obtenerTodos()` - Obtener todos los productos activos
- `obtenerPorId(id)` - Obtener producto por ID
- `buscar(termino)` - Buscar productos por término
- `crear(producto)` - Crear nuevo producto
- `actualizar(id, producto)` - Actualizar producto existente
- `eliminar(id)` - Marcar producto como inactivo
- `obtenerStockBajo()` - Productos con stock bajo

### ClienteService
- `obtenerTodos()` - Obtener todos los clientes activos
- `obtenerPorId(id)` - Obtener cliente por ID
- `buscar(termino)` - Buscar clientes
- `crear(cliente)` - Crear nuevo cliente
- `actualizar(id, cliente)` - Actualizar cliente
- `eliminar(id)` - Marcar cliente como inactivo

### VentaService
- `obtenerTodas()` - Obtener todas las ventas
- `obtenerPorId(id)` - Obtener venta por ID
- `obtenerDetalleVenta(ventaId)` - Obtener detalles de una venta
- `crear(venta, detalles)` - Crear nueva venta con detalles
- `obtenerVentasPorFecha(inicio, fin)` - Ventas por rango de fechas

### CuentaPorCobrarService
- `obtenerTodas()` - Obtener todas las cuentas pendientes
- `obtenerVencidas()` - Obtener cuentas vencidas
- `registrarPago(cuentaId, monto)` - Registrar pago

## 🔧 Personalización

### Agregar nuevas operaciones de base de datos

1. **En el servicio específico** (`src/ui/services/database-services.ts`):
```typescript
export class ProductoService {
  static async miNuevaOperacion(parametro: string): Promise<Producto[]> {
    return window.electronAPI.db.query(
      'SELECT * FROM productos WHERE campo = ?', 
      [parametro]
    );
  }
}
```

2. **Usar en componentes**:
```typescript
const resultado = await ProductoService.miNuevaOperacion('valor');
```

### Crear nuevos servicios

Sigue el patrón de `ProductoService` para crear servicios para otras entidades como `ProveedorService`, `ConfiguracionService`, etc.

## 🔒 Seguridad

- ✅ **Context Isolation** habilitado
- ✅ **Node Integration** deshabilitado
- ✅ **IPC seguro** a través de preload script
- ✅ **APIs limitadas** solo las necesarias para base de datos

## 🎯 Ventajas de esta implementación

1. **No requiere servidor** - Todo funciona localmente
2. **Rendimiento** - Acceso directo a SQLite sin overhead de red
3. **Simplicidad** - No hay que manejar un servidor separado
4. **Portabilidad** - La aplicación es completamente standalone
5. **Tipado** - Full TypeScript support
6. **Hooks de React** - Integración natural con React
7. **Servicios específicos** - Operaciones CRUD organizadas por entidad

## 🔄 Migración desde tu código actual

Para migrar tus páginas existentes:

1. **Reemplaza datos hardcodeados** por llamadas a servicios
2. **Usa los hooks** `useDbQuery` y `useDbMutation` para operaciones reactivas
3. **Importa servicios específicos** según la entidad que manejes
4. **Actualiza interfaces** para que coincidan con la estructura de la DB

## 📈 Próximos pasos recomendados

1. **Crear la base de datos** ejecutando el schema
2. **Actualizar una página** (ej: Productos) para usar los servicios
3. **Probar la funcionalidad** CRUD completa
4. **Migrar gradualmente** las demás páginas
5. **Agregar validaciones** y manejo de errores más robusto
6. **Implementar reportes** usando las consultas SQL
