/*
 * Скрипт подготавливает папку build для semantic.
 * Удаляет лишнее, обогащает package.json, раскидывает файлы в свои папки.
 */
const fs = require('fs');
const { resolve } = require('path');

const rootPackageFile = resolve(__dirname, '..', 'package.json');
const buildDir = resolve(__dirname, '..', 'build');
const buildServiceDir = resolve(buildDir, 'services', 'webxuker');
const servicePackageFile = resolve(buildServiceDir, 'package.json');

// read
const buildPackage = JSON.parse(fs.readFileSync(rootPackageFile).toString());
const servicePackage = JSON.parse(fs.readFileSync(servicePackageFile).toString());

// update service package
delete servicePackage.type;
delete servicePackage.dependencies.commonlib;
['version', 'author', 'license', 'repository', 'bugs', 'homepage'].forEach(key => {
	servicePackage[key] = buildPackage[key];
});

// write
fs.writeFileSync(servicePackageFile, JSON.stringify(servicePackage, null, '\t'));

// move files
['webxuker.js', 'webxuker.js.map', 'package.json'].forEach(fileName => {
	fs.renameSync(
		resolve(buildServiceDir, fileName),
		resolve(buildDir, fileName));
});

// drop some build files
fs.rmSync(resolve(buildDir, 'services'), { recursive: true });
