import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();
const rootDir = process.cwd();
const publicHtmlDir = path.join(rootDir, 'public_html');
const zipPath = path.join(rootDir, 'ZABALEGUI_PUBLIC_HTML.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

function addDirectory(dirPath, zipPrefix = '') {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    // FORCE forward slash for zip specification
    const entryName = zipPrefix ? (zipPrefix + '/' + item) : item;

    if (stat.isDirectory()) {
      addDirectory(fullPath, entryName);
    } else {
      const data = fs.readFileSync(fullPath);
      zip.file(entryName, data, { binary: true });
      console.log('Added entry:', entryName);
    }
  }
}

addDirectory(publicHtmlDir);

zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
  platform: 'UNIX' // Ensures UNIX forward slash directory handling
}).then(content => {
  fs.writeFileSync(zipPath, content);
  console.log('ZABALEGUI_PUBLIC_HTML.zip created successfully with size:', content.length, 'bytes');
}).catch(err => {
  console.error('Error generating zip:', err);
});
