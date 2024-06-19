/*
 * Скрипт подготавливает папку build для semantic.
 * Удаляет лишнее, раскидывает файлы в свои папки.
 */
const fs = require('fs');
const { resolve } = require('path');

const buildDir = resolve(__dirname, '..', 'build');
const packageJson = resolve(buildDir, 'package.json');

// read
const package = JSON.parse(fs.readFileSync(packageJson).toString());

// clear
delete package.dependencies;
delete package.devDependencies;
delete package.scripts;
delete package.workspaces;

// write
fs.writeFileSync(packageJson, JSON.stringify(package, null, '\t'));

// move files
['webxuker.js', 'webxuker.js.map'].forEach(fileName => {
	fs.renameSync(
		resolve(buildDir, 'services', 'webxuker', fileName),
		resolve(buildDir, fileName));
});

// drop some build files
fs.rmdirSync(resolve(buildDir, 'services'), { recursive: true });
