/*
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function fail(message) {
  throw new Error(message);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function walk(dirRel, out = []) {
  const dir = path.join(root, dirRel);
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.tmp', '.chrome-profile'].includes(entry.name)) continue;
      walk(rel, out);
    } else {
      out.push(rel);
    }
  }
  return out;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const manifest = JSON.parse(read('manifest.json'));

assert(manifest.manifest_version === 3, 'manifest must use Manifest V3');
assert(manifest.background?.service_worker, 'manifest must define a service worker');
assert(exists(manifest.background.service_worker), `missing service worker: ${manifest.background.service_worker}`);

for (const script of manifest.content_scripts || []) {
  for (const js of script.js || []) assert(exists(js), `missing content script: ${js}`);
  for (const css of script.css || []) assert(exists(css), `missing content css: ${css}`);
}

for (const icon of Object.values(manifest.icons || {})) {
  assert(exists(icon), `missing icon: ${icon}`);
}

assert(exists(manifest.action.default_popup), `missing popup: ${manifest.action.default_popup}`);
assert(exists(manifest.options_page), `missing options page: ${manifest.options_page}`);

const permissions = new Set(manifest.permissions || []);
for (const permission of ['webRequest', 'scripting', 'unlimitedStorage', 'cookies', 'management']) {
  assert(!permissions.has(permission), `high-risk or unused permission must not be required: ${permission}`);
}

for (const permission of ['storage', 'tabs', 'alarms', 'contextMenus']) {
  assert(permissions.has(permission), `expected permission missing: ${permission}`);
}

const authoredFiles = walk('.')
  .filter(rel => /\.(js|html|json|css|md|ps1)$/i.test(rel));

for (const rel of authoredFiles) {
  const text = read(rel);
  assert(!/MODEL_SIGNING_PRIVATE_KEY_PEM\s*=\s*["']?-----BEGIN/i.test(text), `${rel} appears to contain a private signing key`);
}

for (const rel of walk('.')) {
  assert(!/node_modules\//.test(rel), `node_modules must not be included: ${rel}`);
  assert(!/\.dev-keys\//.test(rel), `.dev-keys must not be included: ${rel}`);
  assert(!/data\/.*\.sqlite/i.test(rel), `sqlite data must not be included: ${rel}`);
}

for (const rel of walk('src').filter(x => x.endsWith('.html'))) {
  const text = read(rel);
  assert(!/\son[a-z]+\s*=/i.test(text), `${rel} must not use inline event handlers`);
  assert(!/<script[^>]+src=["']https?:\/\//i.test(text), `${rel} must not load remote scripts`);
}

const allJs = walk('src').filter(x => x.endsWith('.js'));
for (const rel of allJs) {
  const text = read(rel);
  assert(!/\beval\s*\(/.test(text), `${rel} must not use eval()`);
  assert(!/\bnew\s+Function\b/.test(text), `${rel} must not use new Function()`);
  assert(!/import\s*\(\s*["']https?:\/\//.test(text), `${rel} must not import remote code`);
}

for (const rel of ['src/background.js', 'src/popup.js', 'src/options.js']) {
  const text = read(rel);
  assert(/crowdLearningEnabled:\s*false/.test(text), `${rel} must default crowd learning to false`);
}

const popup = read('src/popup.js');
assert(/action:\s*'rescan'/.test(popup), 'popup must send rescan');
const contentAgent = read('src/content-agent-orange.js');
const content = read('src/content.js');
assert(/request\.action === 'rescan'/.test(contentAgent) || /request\.action === 'rescan'/.test(content), 'content scripts must handle rescan');

console.log('release-gates: ok');

