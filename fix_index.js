const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Añadir script de transición si no está
if (!content.includes('src/pageTransition.js')) {
  content = content.replace('</head>', '  <script src="src/pageTransition.js"></script>\n</head>');
}

// Eliminar introOverlay
content = content.replace(/<!-- Transición blanca de entrada -->\s*<div id="introOverlay"><\/div>/g, '');

fs.writeFileSync('index.html', content, 'utf8');
console.log('index.html arreglado');
