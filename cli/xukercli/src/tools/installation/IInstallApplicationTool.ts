import * as fs from 'fs';
import { resolve } from 'path';
import axios from 'axios';
import { ConfigurationTool } from '../ConfigurationTool.js';

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
	 * Бросит ошибку если приложение уже установлено в /usr/local/bin.
	 * Бросит ошибку если в конфиге заполнено значение installationPath и папка существует.
	 */
	async checkPreviousVersionInstalled(): Promise<void> {
		// check if application is already installed
		let linkLookAt = '';
		try {
			linkLookAt = fs.readlinkSync(this.configTool.BIN_PATH);
		} catch(_) {}
		if (linkLookAt) {
			throw new Error(`Application already installed in "${linkLookAt}".
You can check it with "ls -la ${this.configTool.BIN_PATH}".
You can run command "uninstall" or "update" for installed version.`);
		}
		// check location from saved config
		const applicationInfo = this.configTool.getApplicationInfo();
		if (applicationInfo) {
			const exists = fs.existsSync(applicationInfo.installationPath);
			if (exists) {
				throw new Error(`Application already installed in ${applicationInfo}.
The path to this directory is read from configuration file and exists.
You can check configuration with command "xuker config".`);
			}
		}
	}

	/**
	 * Вернет папку установки приложения по текущей ссылке в /usr/local/bin/webxuker.
	 * Бросит ошибку если приложение не усатновлено в /usr/local/bin.
	 */
	async getInstallationPathFromBin(): Promise<string> {
		let linkLookAt = '';
		try {
			linkLookAt = fs.readlinkSync(this.configTool.BIN_PATH);
		} catch(_) {}
		if (!linkLookAt) {
			throw new Error(`Application does not installed.
You can install latest application version.`);
		}
		return resolve(linkLookAt, '..');
	}

	/**
	 * Проверяет наличие будущей папки для установки.
	 * Бросит ошибку если папка назначения существует и не является папкой.
	 * Бросит ошибку если папка назначения не пустая.
	 */
	async checkInstallationPath(path: string): Promise<void> {
		// check installation directory
		const exists = fs.existsSync(path);
		if (!exists) return; // path does not exist, OK
		const stat = fs.statSync(path);
		if (!stat.isDirectory()) {
			throw new Error(`Installation location "${path}" does not directory.
You must delete it before install application.
Or you can choose another installation path with "--path" flag.`);
		}
		// if directory exists then it must be empty
		const items = fs.readdirSync(path);
		if (items.length) {
			throw new Error(`Directory "${path}" does not empty.
You must clear that directory before install application.`);
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

	abstract uninstall(): Promise<void>;
}
