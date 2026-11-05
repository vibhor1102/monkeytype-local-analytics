const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const index = args.indexOf('--target');
if (index < 0 || !args[index + 1] || args[index + 1].startsWith('--')) {
  throw new Error('Usage: npm run install:local -- --target /absolute/install/folder [--dry-run]');
}
const target = path.resolve(args[index + 1]);
if (target === root || root.startsWith(target + path.sep) || target.startsWith(root + path.sep)) {
  throw new Error('Choose a separate install folder outside the checkout. Load dist/extension directly for development.');
}
cp.execFileSync(process.execPath, [path.join(__dirname, 'build.cjs')], {stdio: 'inherit'});
const source = path.join(root, 'dist', 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
if (fs.existsSync(target)) {
  if (fs.lstatSync(target).isSymbolicLink()) throw new Error('Install target must not be a symlink.');
  const entries = fs.readdirSync(target);
  if (entries.length) {
    const oldPath = path.join(target, 'manifest.json');
    if (!fs.existsSync(oldPath)) throw new Error('Nonempty target is not an extension installation.');
    const old = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
    if (old.name !== manifest.name || (old.key || null) !== (manifest.key || null)) {
      throw new Error('Extension identity differs. Plan and verify data migration before changing it.');
    }
  }
}
const names = fs.readdirSync(source);
if (args.includes('--dry-run')) {
  console.log(`Would install ${names.length} entries into ${target}; no installed files changed.`);
} else {
  fs.mkdirSync(target, {recursive: true});
  for (const name of names) fs.cpSync(path.join(source, name), path.join(target, name), {recursive: true});
  console.log(`Installed files into ${target}. Reload the extension in Chrome, then reload Monkeytype tabs when idle.`);
}
