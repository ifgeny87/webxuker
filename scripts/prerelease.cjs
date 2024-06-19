/*
 * Скрипт подготавливает папку build для semantic.
 * Удаляет лишнее, обогащает package.json, раскидывает файлы в свои папки.
 */
const fs = require('fs');
const { resolve } = require('path');

const buildDir = resolve(__dirname, '..', 'build');
const buildPackageFile = resolve(buildDir, 'package.json');
const servicePackageFile = resolve(buildDir, 'services', 'webxuker', 'package.json');

// read
const buildPackage = JSON.parse(fs.readFileSync(buildPackageFile).toString());
const servicePackage = JSON.parse(fs.readFileSync(servicePackageFile).toString());

// update service package
['type', 'dependencies'].forEach(key => {
	delete servicePackage[key];
});
['version', 'author', 'license', 'repository', 'bugs', 'homepage'].forEach(key => {
	servicePackage[key] = buildPackage[key];
});

// write
fs.writeFileSync(servicePackageFile, JSON.stringify(servicePackage, null, '\t'));

// move files
['webxuker.js', 'webxuker.js.map', 'package.json'].forEach(fileName => {
	fs.renameSync(
		resolve(buildDir, 'services', 'webxuker', fileName),
		resolve(buildDir, fileName));
});

// drop some build files
fs.rmdirSync(resolve(buildDir, 'services'), { recursive: true });
