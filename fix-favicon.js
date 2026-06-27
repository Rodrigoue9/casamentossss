const fs = require('fs');
const path = require('path');
const outDir = path.join(__dirname, 'out');

function fixFaviconPaths(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fixFaviconPaths(filePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('href="/favicon.ico')) {
        content = content.replace(/href="\/favicon\.ico/g, 'href="favicon.ico');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed favicon path in: ${filePath}`);
      }
    }
  }
}

fixFaviconPaths(outDir);
console.log("Postbuild favicon path fix applied successfully!");
