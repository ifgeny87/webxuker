import * as fs from 'fs';
import { resolve } from 'path';
import axios from 'axios';
import { ConfigurationTool } from '../ConfigurationTool.js';
import { ApplicationInfo } from '../../models/index.js';

export interface IReleaseInfo
{
	tagName: string;
	assetName: string;
	assetSize: number;
	assetURL: string;
}

export abstract class IInstallApplicationTool
{
	protected readonly configTool = ConfigurationTool.getInstance();

	/**
	 * Проверяет, установлена ли предыдущая версия.
	 * Вернет false если приложение не установлено.
	 * Вернет сообщение если приложение уже установлено в /usr/local/bin.
	 * Вернет сообщение если в конфиге заполнено значение installationPath и папка существует.
	 */
	async checkPreviousVersionInstalled(): Promise<false | string> {
		// check if application is already installed
		let linkLookAt = '';
		try {
			linkLookAt = fs.readlinkSync(this.configTool.WEB_BIN_PATH);
		} catch (_) {}
		if (linkLookAt) {
			return `Application already installed in "${linkLookAt}".
You can check it with "ls -la ${this.configTool.WEB_BIN_PATH}".
You can run command "uninstall" or "update" for installed version.`;
		}
		// check location from saved config
		const applicationInfo = this.configTool.getApplicationInfo();
		if (applicationInfo) {
			const exists = fs.existsSync(applicationInfo.installationPath);
			if (exists) {
				return `Application already installed in ${applicationInfo.installationPath}.
The path to this directory is read from configuration file and exists.
You can check configuration with command "xuker config".`;
			}
		}
		return false;
	}

	/**
	 * Вернет путь к папке установки приложения по ссылке на запускаемый файл.
	 * Вернет false если запускаемый файл не обнаружен.
	 */
	async getInstallationPathFromBin(): Promise<false | string> {
		let linkLookAt = '';
		try {
			linkLookAt = fs.readlinkSync(this.configTool.WEB_BIN_PATH);
		} catch(_) {}
		if (!linkLookAt) {
			return false;
		}
		return resolve(linkLookAt, '..');
	}

	/**
	 * Проверяет наличие будущей папки для установки.
	 * Бросит ошибку если папка назначения существует и не является папкой.
	 */
	async checkInstallationPath(path: string): Promise<void> {
		const exists = fs.existsSync(path);
		if (!exists) return; // path does not exist, OK
		const stat = fs.statSync(path);
		if (!stat.isDirectory()) {
			throw new Error(`Installation location "${path}" does not directory.
You must delete it before install application.
Or you can choose another installation path with "--path" flag.`);
		}
	}

	/**
	 * Скачает и вернет информацию о последнем релизе с Github API.
	 * Бросит ошибку если релиз не найден.
	 * Бросит ошибку если релиз содержит более одного файла.
	 */
	async getLastReleaseURL(): Promise<IReleaseInfo> {
		const { status, data } = await axios({
			url: `https://api.github.com/repos/${this.configTool.REPO}/releases/latest`,
			responseType: 'json',
		});
		if (status > 200) {
			throw new Error(`Latest release not found. Server returned code ${status}`);
		}
		if (!data.assets) {
			throw new Error('Latest release not found, assets are empty');
		}
		if (data.assets.length !== 1) {
			throw new Error('Latest release contains more than one asset');
		}
		return {
			tagName: data.tag_name,
			assetName: data.assets[0].name,
			assetSize: data.assets[0].size,
			assetURL: data.assets[0].browser_download_url,
		};
	}

	abstract downloadAsset(releaseInfo: IReleaseInfo, downloadPath: string): Promise<string>;

	abstract unpackAsset(packageFilePath: string, installationPath: string): Promise<void>;

	abstract install(installationPath: string): Promise<void>;

	abstract uninstall(applicationInfo: ApplicationInfo): Promise<void>;
}
