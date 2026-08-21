const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const loginStart = html.indexOf('<div class="modal-overlay" id="loginModal">');
const shopManageStart = html.indexOf('<div class="modal-overlay" id="shopManageModal">');

const modalsHtml = html.substring(loginStart, shopManageStart);

const jsCode = `
export function injectAuthModals() {
  if (document.getElementById('loginModal')) return;
  const container = document.createElement('div');
  container.innerHTML = \`${modalsHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
  while (container.firstChild) {
    document.body.appendChild(container.firstChild);
  }
}
`;

fs.writeFileSync('src/presentation/components/AuthModalsInjector.js', jsCode, 'utf8');
console.log('Extractor completado');
