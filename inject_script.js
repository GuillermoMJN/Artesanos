const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('src/pageTransition.js')) {
    content = content.replace('</head>', '  <script src="src/pageTransition.js"></script>\n</head>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Inyectado script en ${file}`);
  } else {
    console.log(`${file} ya tiene el script`);
  }
});
