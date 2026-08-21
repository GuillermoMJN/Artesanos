const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startStr = '<!-- Modal Detalle Artesano -->';
const endStr = '<!-- Contenedor para Toast Notifications -->';

const startIndex = html.indexOf(startStr);
const endIndex = html.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end markers");
  process.exit(1);
}

const modalsHtml = html.substring(startIndex, endIndex);

const jsCode = `
export function injectAllModals() {
  if (document.getElementById('loginModal')) return;
  const container = document.createElement('div');
  container.innerHTML = \`${modalsHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
  while (container.firstChild) {
    document.body.appendChild(container.firstChild);
  }
}
`;

fs.writeFileSync('src/presentation/components/ModalsInjector.js', jsCode, 'utf8');
console.log('Extractor de todos los modales completado');
