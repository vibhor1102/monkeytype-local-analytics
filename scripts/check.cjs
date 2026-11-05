const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'extension');
for (const name of fs.readdirSync(source).filter(n => n.endsWith('.js'))) {
  cp.execFileSync(process.execPath, ['--check', path.join(source, name)], {stdio: 'inherit'});
}
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
for (const file of [...manifest.content_scripts.flatMap(s => s.js), manifest.background.service_worker, manifest.action.default_popup, manifest.options_page]) {
  if (!fs.existsSync(path.join(source, file))) throw new Error(`Missing ${file}`);
}
const project = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (manifest.version !== project.version) throw new Error('Package and manifest versions differ.');
console.log('JavaScript syntax, manifest references, and version consistency passed.');
