"""Deterministic, ready-to-load release archive; no host paths or private files."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text())['version']
archive = root / 'dist' / f'monkeytype-local-analytics-{version}.zip'
with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as output:
    for file in sorted((root / 'dist/extension').rglob('*')):
        if not file.is_file():
            continue
        info = ZipInfo(file.relative_to(root / 'dist/extension').as_posix(), (2026, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        output.writestr(info, file.read_bytes())
(root / 'dist/SHA256SUMS').write_text(f'{hashlib.sha256(archive.read_bytes()).hexdigest()}  {archive.name}\n')
print(archive)
