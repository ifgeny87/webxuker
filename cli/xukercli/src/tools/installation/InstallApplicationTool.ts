import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import * as tar from 'tar';
import { ISpawnResult, spawnChild, SpawnError } from '../../helpers/index.js';
import { IInstallApplicationTool, IReleaseInfo } from './IInstallApplicationTool.js';
import { ApplicationInfo } from '../../models/index.js';

export class InstallApplicationTool extends IInstallApplicationTool
{
	/**
	 * Скачивает последний релиз.
	 * Вернет путь к скаченному файлу.
	 */
	override async downloadAsset(releaseInfo: IReleaseInfo, downloadPath: string): Promise<string> {
		// check and create directory
		const exists = fs.existsSync(downloadPath);
		if (!exists) {
			const spawnResult = await spawnChild('mkdir', [downloadPath]);
			if (spawnResult.exitCode) {
				throw new SpawnError(`Cannot create new dir "${downloadPath}"`, spawnResult);
			}
		}
		const { status, data } = await axios({
			url: releaseInfo.assetURL,
			responseType: 'stream',
		});
		if (status > 200) {
			throw new Error(`Cannot download release asset. Server returned code ${status}`);
		}
		const destFile = path.resolve(downloadPath, releaseInfo.assetName);
		// файл может существовать, удаляем старый
		if (fs.existsSync(destFile)) {
			const spawnResult = await spawnChild('rm', [destFile]);
			if (spawnResult.exitCode) {
				throw new SpawnError(`Cannot delete old file ${destFile}`, spawnResult);
			}
		}
		const stream = fs.createWriteStream(destFile);
		return new Promise<string>(resolve => {
			stream.once('close', () => {
				resolve(destFile);
			});
			data.pipe(stream);
		});
	}

	/**
	 * Выполняет распаковку пакета релиза
	 */
	override async unpackAsset(packageFilePath: string, installationPath: string): Promise<void> {
		// если папка релиза уже существует, ее нужно удалить
		const packagePath = path.resolve(installationPath, 'package');
		if (fs.existsSync(packagePath)) {
			const spawnResult = await spawnChild('rm', ['-rf', packagePath]);
			if (spawnResult.exitCode) {
				throw new SpawnError(`Cannot delete previous folder "${packagePath}"`, spawnResult);
			}
		}
		await tar.extract({
			file: packageFilePath,
			cwd: installationPath,
		});
	}

	/**
	 * Выполняет установку распакованного релиза.
	 * Установит node modules.
	 * Создаст скрипт запуска приложения и назначит его запускаемым.
	 * Создаст ссылку на скрипт запуска в папке /usr/local/bin.
	 * Сохранит путь и время установки в конфиге.
	 * Бросит ошибку в случае ошибочного выполнения команд шелла.
	 */
	override async install(installationPath: string): Promise<void> {
		// install node modules
		const packagePath = path.resolve(installationPath, 'package');
		let spawnResult: ISpawnResult = await spawnChild('npm', ['i', '--omit=dev'], packagePath);
		if (spawnResult.exitCode) {
			throw new SpawnError('Cannot install node modules', spawnResult);
		}
		// check and create bin directory
		const binPath = path.resolve(installationPath, 'bin');
		const exists = fs.existsSync(binPath);
		if (!exists) {
			fs.mkdirSync(binPath);
		}
		// create script
		const script = `cd ${packagePath} && node webxuker.js $@`;
		const scriptPath = path.resolve(binPath, 'webxuker');
		fs.writeFileSync(scriptPath, script);
		// chmod
		spawnResult = await spawnChild('chmod', ['+x', scriptPath]);
		if (spawnResult.exitCode) {
			throw new Error([
				`Cannot set executable flag to ${scriptPath}`,
				spawnResult.stderr,
				spawnResult.stdout,
			].filter(Boolean).join('\n'));
		}
		// create link
		spawnResult = await spawnChild('ln', ['-s', scriptPath, this.configTool.WEB_BIN_PATH]);
		if (spawnResult.exitCode) {
			throw new Error([
				`Cannot create application link ${this.configTool.WEB_BIN_PATH} from ${scriptPath}`,
				spawnResult.stderr,
				spawnResult.stdout,
			].filter(Boolean).join('\n'));
		}
		this.configTool
			.setApplicationInfo({
				installationPath,
				installDate: new Date(),
			});
	}

	/**
	 * Выполняет удаление установленного приложения
	 */
	override async uninstall(applicationInfo: ApplicationInfo): Promise<void> {
		// delete files
		let spawnResult = await spawnChild('rm', ['-rf', applicationInfo.installationPath]);
		if (spawnResult.exitCode) {
			throw new SpawnError(`Cannot delete folder "${applicationInfo.installationPath}"`, spawnResult);
		}
		spawnResult = await spawnChild('rm', [this.configTool.WEB_BIN_PATH]);
		if (spawnResult.exitCode) {
			throw new SpawnError(`Cannot delete link to file "${this.configTool.WEB_BIN_PATH}"`, spawnResult);
		}
		// update config
		this.configTool.setApplicationInfo({
			...applicationInfo,
			uninstallDate: new Date(),
		});
	}
}
