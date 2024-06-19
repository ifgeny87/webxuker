/*
 * Скрипт подготовит файл package.json для упаковки перед выполнением `npm pack`:
 * 1. Выполнит копию файла package.json в package.json_BACKUP.
 * 2. Выполнит чистку текущего package.json.
 * 3. Сохранит изменения.
 * Скрипт следует запускать перед командой `npm pack` и восстановить орнигинальный файл
 * package.json после выполнения. Например так:
 * ```json
 * "scripts": {
 *   "prepack": "node ./scripts/prepack.cjs",
 *   "postpack": "mv package.json_BACKUP package.json"
 * }
 * ```
 */
const fs = require('fs');
const { resolve } = require('path');

const workDir = resolve(__dirname, '..');
const packageJson = resolve(workDir, 'package.json');

// create backup
fs.copyFileSync(packageJson, packageJson + '_BACKUP');

// read
const package = JSON.parse(fs.readFileSync(packageJson).toString());

// clear
delete package.scripts;

// write
fs.writeFileSync(packageJson, JSON.stringify(package, null, '\t'));
