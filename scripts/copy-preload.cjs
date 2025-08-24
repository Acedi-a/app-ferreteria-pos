const fs = require('fs');
const path = require('path');

// Rutas de origen y destino
const source = path.join(__dirname, '..', 'src', 'electron', 'preload.cjs');
const dest = path.join(__dirname, '..', 'dist-electron', 'preload.cjs');

// Crear directorio dist-electron si no existe
const distDir = path.dirname(dest);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copiar archivo
fs.copyFileSync(source, dest);
console.log('✓ Preload script copied to dist-electron/preload.cjs');
