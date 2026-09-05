import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const rootDir = process.cwd();
const publicHtmlDir = path.join(rootDir, 'public_html');
const zipPath = path.join(rootDir, 'ZABALEGUI_PUBLIC_HTML.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 },
  forceLocalTime: true
});

output.on('close', () => {
  console.log('ZABALEGUI_PUBLIC_HTML.zip created successfully:', archive.pointer(), 'total bytes');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

function addDirectory(dirPath, zipPrefix = '') {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    const entryName = zipPrefix ? (zipPrefix + '/' + item) : item;
    
    if (stat.isDirectory()) {
      addDirectory(fullPath, entryName);
    } else {
      archive.file(fullPath, { name: entryName });
    }
  }
}

addDirectory(publicHtmlDir);
archive.finalize();
