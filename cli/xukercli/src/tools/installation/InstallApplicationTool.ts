import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import * as tar from 'tar';
import { ISpawnResult, spawnChild } from '../../helpers/index.js';
import { IInstallApplicationTool, IReleaseInfo } from './IInstallApplicationTool.js';

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
			fs.mkdirSync(downloadPath);
		}
		return await axios({
			url: releaseInfo.assetURL,
			responseType: 'stream',
		})
			.then(async ({ status, data }: AxiosResponse) => {
				if (status > 200) {
					throw new Error(`Cannot download release asset. Server returned code ${status}`);
				}
				const destFile = path.resolve(downloadPath, releaseInfo.assetName);
				const stream = fs.createWriteStream(destFile);
				return new Promise<string>(resolve => {
					stream.once('close', () => {
						resolve(destFile);
					});
					data.pipe(stream);
				});
			});
	}

	/**
	 * Выполняет распаковку пакета релиза.
	 */
	override async unpackAsset(packageFilePath: string, installationPath: string): Promise<void> {
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
		let res: ISpawnResult = await spawnChild('npm', ['i', '--omit=dev'], packagePath);
		if (res.code) {
			throw new Error([
				'Cannot install node modules',
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
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
		res = await spawnChild('chmod', ['+x', scriptPath]);
		if (res.code) {
			throw new Error([
				`Cannot set executable flag to ${scriptPath}`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
		// create link
		res = await spawnChild('ln', ['-s', scriptPath, this.configTool.BIN_PATH]);
		if (res.code) {
			throw new Error([
				`Cannot create application link ${this.configTool.BIN_PATH} from ${scriptPath}`,
				res.stderr,
				res.stdout,
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
	override async uninstall(): Promise<void> {
		throw new Error('TODO 5');
	}
}
