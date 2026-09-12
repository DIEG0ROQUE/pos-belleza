import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const publicHtmlDir = path.join(rootDir, 'public_html');
const zipPath = path.join(rootDir, 'ZABALEGUI_PUBLIC_HTML.zip');

// 1. Sync dist to public_html
if (fs.existsSync(distDir)) {
  console.log('Syncing dist to public_html...');
  // Copy index.html
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(publicHtmlDir, 'index.html'));

  // Clean and copy assets
  const pubAssetsDir = path.join(publicHtmlDir, 'assets');
  if (fs.existsSync(pubAssetsDir)) {
    const oldAssets = fs.readdirSync(pubAssetsDir);
    for (const file of oldAssets) {
      fs.unlinkSync(path.join(pubAssetsDir, file));
    }
  } else {
    fs.mkdirSync(pubAssetsDir, { recursive: true });
  }

  const distAssetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(distAssetsDir)) {
    const distAssets = fs.readdirSync(distAssetsDir);
    for (const file of distAssets) {
      fs.copyFileSync(path.join(distAssetsDir, file), path.join(pubAssetsDir, file));
    }
  }

  // Copy SQL migration file if exists
  const sqlFile = path.join(rootDir, 'add_discount_columns.sql');
  if (fs.existsSync(sqlFile)) {
    fs.copyFileSync(sqlFile, path.join(publicHtmlDir, 'add_discount_columns.sql'));
  }
}

// 2. Build ZIP with UNIX paths
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const zip = new JSZip();

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
  console.log('✅ ZABALEGUI_PUBLIC_HTML.zip created successfully with size:', content.length, 'bytes');
}).catch(err => {
  console.error('❌ Error generating zip:', err);
});

