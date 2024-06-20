import * as fs from 'fs';
import axios from 'axios';
import { ConfigurationTool } from './ConfigurationTool.js';

export interface IReleaseInfo
{
	tagName: string;
	assetName: string;
	assetSize: number;
	assetURL: string;
}

const REPO = 'ifgeny87/webxuker';

const configTool = ConfigurationTool.getInstance();

export abstract class IInstallServiceTool
{
	protected readonly BIN_PATH = '/usr/local/bin/webxuker';

	constructor(protected readonly installationPath: string) {}

	async checkInstallationPath(): Promise<void> {
		// check if application is already installed
		let linkLookAt = '';
		try {
			linkLookAt = fs.readlinkSync(this.BIN_PATH);
		} catch(_) {}
		if (linkLookAt) {
			throw new Error(`Application already installed in ${linkLookAt}.
You can check it with "ls -la ${this.BIN_PATH}".
You can uninstall or update previous version.`);
		}
		// check saved config
		if (configTool.installationPath) {
			const exists = fs.existsSync(configTool.installationPath);
			if (exists) {
				throw new Error(`Application already installed in ${configTool.installationPath}.
This path to this directory is read from configuration file.
You can check configuration at ${configTool.CONFIG_FILE}.`);
			}
		}
		// check installation directory
		const exists = fs.existsSync(this.installationPath);
		if (!exists) return; // path does not exist, OK
		const stat = fs.statSync(this.installationPath);
		if (!stat.isDirectory()) {
			throw new Error(`${this.installationPath} does not directory. You can delete it before install application. Or you can choose another installation path with --path flag.`);
		}
		// if directory exists then it must be empty
		const items = fs.readdirSync(this.installationPath);
		if (items.length) {
			throw new Error(`Directory ${this.installationPath} does not empty.
You must clear that directory before install application.`);
		}
	}

	async getLastReleaseURL(): Promise<IReleaseInfo> {
		const { status, data } = await axios({
			url: `https://api.github.com/repos/${REPO}/releases/latest`,
			responseType: 'json',
		});
		if (status >= 400) {
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

	abstract downloadAsset(releaseInfo: IReleaseInfo): Promise<string>;

	abstract unpackAsset(destFile: string): Promise<void>;

	abstract install(): Promise<void>;
}
