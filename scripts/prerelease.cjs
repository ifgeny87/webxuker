/*
 * Скрипт подготавливает папку build для semantic.
 * Удаляет лишнее, обогащает package.json, раскидывает файлы в свои папки.
 */
const fs = require('fs');
const { resolve } = require('path');

const rootPackageFile = resolve(__dirname, '..', 'package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackageFile).toString());

const builtServiceDir = resolve(__dirname, '..', 'build', 'services', 'webxuker');
const builtServicePackageFile = resolve(builtServiceDir, 'package.json');
const servicePackage = JSON.parse(fs.readFileSync(builtServicePackageFile).toString());

// update service package
delete servicePackage.type;
delete servicePackage.dependencies.commonlib;
['version', 'author', 'license', 'repository', 'bugs', 'homepage'].forEach(key => {
	servicePackage[key] = rootPackage[key];
});

// write
fs.writeFileSync(builtServicePackageFile, JSON.stringify(servicePackage, null, '  '));

// move files
['webxuker.js', 'webxuker.js.map', 'package.json'].forEach(fileName => {
	fs.renameSync(
		resolve(builtServiceDir, fileName),
		resolve(builtServiceDir, fileName));
});

// drop some build files
fs.rmSync(resolve(builtServiceDir, 'services'), { recursive: true });
