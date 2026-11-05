const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'extension');
const destination = path.join(root, 'dist', 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
if (manifest.manifest_version !== 3) throw new Error('Expected Manifest V3.');
fs.mkdirSync(path.dirname(destination), {recursive: true});
fs.rmSync(destination, {recursive: true, force: true});
fs.cpSync(source, destination, {recursive: true});
console.log(`Built ${manifest.name} ${manifest.version}: ${destination}`);

// One canonical markup/style source for both the in-site page and recovery dashboard.
const html = fs.readFileSync(path.join(source, 'dashboard.html'), 'utf8');
const assets = {
  html: html.match(/<main\b[^>]*>[\s\S]*<\/main>/)[0],
  css: fs.readFileSync(path.join(source, 'dashboard.css'), 'utf8'),
  integratedCss: fs.readFileSync(path.join(source, 'integrated.css'), 'utf8')
};
const controller = fs.readFileSync(path.join(source, 'dashboard.js'), 'utf8');
fs.writeFileSync(path.join(destination, 'dashboard.js'), `${fs.readFileSync(path.join(source, "core.js"), "utf8")}\nglobalThis.MLAViewAssets = ${JSON.stringify(assets)};\n${controller}`);
