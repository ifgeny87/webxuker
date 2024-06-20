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

const projectDir = resolve(__dirname, '..');
const projectPackageFile = resolve(projectDir, 'package.json');

// create backup
fs.copyFileSync(projectPackageFile, projectPackageFile + '_BACKUP');

// read
const projectPackage = JSON.parse(fs.readFileSync(projectPackageFile).toString());

// update project package
delete projectPackage.dependencies;
delete projectPackage.scripts;

// write
fs.writeFileSync(projectPackageFile, JSON.stringify(projectPackage, null, '  '));
