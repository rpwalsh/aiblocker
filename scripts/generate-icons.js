// Generates images/icon-16.png, icon-48.png, icon-128.png from embedded base64 icons.
// This fixes "Could not load icon ..." errors when loading unpacked.

'use strict';

const fs = require('fs');
const path = require('path');

const { ICONS } = require('../src/icons.js');

function writePng(filePath, base64) {
  const cleaned = String(base64).replace(/\s/g, '');
  const buf = Buffer.from(cleaned, 'base64');
  fs.writeFileSync(filePath, buf);
}

function main() {
  const root = path.resolve(__dirname, '..');
  const outDir = path.join(root, 'images');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  writePng(path.join(outDir, 'icon-16.png'), ICONS.icon16Base64);
  writePng(path.join(outDir, 'icon-48.png'), ICONS.icon48Base64);
  writePng(path.join(outDir, 'icon-128.png'), ICONS.icon128Base64);

  console.log('Wrote icons to images/: icon-16.png, icon-48.png, icon-128.png');
}

main();
