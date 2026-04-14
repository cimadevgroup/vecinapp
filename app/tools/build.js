// build.js - Genera worker.js incrustando todos los assets estáticos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

// Leer archivos HTML
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
const superadminHtml = fs.readFileSync(path.join(root, 'superadmin.html'), 'utf8');

// Leer CSS
const styleCss = fs.readFileSync(path.join(root, 'app/style/style.css'), 'utf8');
const themeCss = fs.readFileSync(path.join(root, 'app/style/theme.css'), 'utf8');

// Leer todos los JS del sistema
const systemDir = path.join(root, 'app/system');
const jsFiles = fs.readdirSync(systemDir).filter(f => f.endsWith('.js') && f !== 'worker.js');
const modules = {};
for (const file of jsFiles) {
  modules[file] = fs.readFileSync(path.join(systemDir, file), 'utf8');
}

// Leer plantilla worker-src.js (asumimos que está en app/worker-src.js)
let workerSrc = fs.readFileSync(path.join(root, 'app/worker-src.js'), 'utf8');

// Reemplazar placeholders
workerSrc = workerSrc.replace('__INDEX_HTML__', JSON.stringify(indexHtml));
workerSrc = workerSrc.replace('__ADMIN_HTML__', JSON.stringify(adminHtml));
workerSrc = workerSrc.replace('__SUPERADMIN_HTML__', JSON.stringify(superadminHtml));
workerSrc = workerSrc.replace('__STYLE_CSS__', JSON.stringify(styleCss));
workerSrc = workerSrc.replace('__THEME_CSS__', JSON.stringify(themeCss));
workerSrc = workerSrc.replace('__JS_MODULES__', JSON.stringify(modules));

// Escribir worker.js final
fs.writeFileSync(path.join(root, 'app/worker.js'), workerSrc);
console.log('✅ worker.js generado correctamente');