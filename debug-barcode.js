// Script temporal para debuggear códigos de barras
const { app, BrowserWindow } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new Database(dbPath);

console.log('=== PRODUCTOS CON CÓDIGOS DE BARRAS ===');
const productos = db.prepare(`
  SELECT id, codigo_barras, codigo_interno, nombre 
  FROM productos 
  WHERE activo = 1 AND (codigo_barras IS NOT NULL OR codigo_interno IS NOT NULL) 
  LIMIT 10
`).all();

productos.forEach(p => {
  console.log(`ID: ${p.id}`);
  console.log(`Código Barras: "${p.codigo_barras}"`);
  console.log(`Código Interno: "${p.codigo_interno}"`);
  console.log(`Nombre: ${p.nombre}`);
  console.log('---');
});

// Probar búsqueda específica
const codigoTest = '694210011524';
console.log(`\n=== PROBANDO BÚSQUEDA CON: "${codigoTest}" ===`);

const exacto = db.prepare(`
  SELECT * FROM productos 
  WHERE activo = 1 AND (codigo_barras = ? OR codigo_interno = ?)
`).get(codigoTest, codigoTest);

console.log('Resultado búsqueda exacta:', exacto ? 'ENCONTRADO' : 'NO ENCONTRADO');
if (exacto) {
  console.log('Producto encontrado:', exacto.nombre);
}

// Probar con LIKE
const conLike = db.prepare(`
  SELECT * FROM productos 
  WHERE activo = 1 AND (codigo_barras LIKE ? OR codigo_interno LIKE ?)
`).get(`%${codigoTest}%`, `%${codigoTest}%`);

console.log('Resultado búsqueda LIKE:', conLike ? 'ENCONTRADO' : 'NO ENCONTRADO');
if (conLike) {
  console.log('Producto encontrado:', conLike.nombre);
}

db.close();
process.exit(0);