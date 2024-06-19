import * as fs from 'fs';
import * as path from 'path';
import axios, { Axios, AxiosResponse } from 'axios';
import * as tar from 'tar';
import { ISpawnResult, spawnChild } from '../helpers/index.js';

const REPO = 'ifgeny87/webxuker';
const BIN_PATH = '/usr/local/bin/webxuker';

export interface IReleaseInfo
{
	tagName: string;
	assetName: string;
	assetSize: number;
	assetURL: string;
}

export class InstallServiceTool
{
	constructor(private readonly installationPath: string) {}

	async checkInstallationPath(): Promise<void> {
		// check is application is already installed
		const lnExists = fs.existsSync(BIN_PATH);
		if (lnExists) {
			const binPath = fs.readlinkSync(BIN_PATH);
			throw new Error(`Application already installed in ${binPath}. You can check it with "ls -la $(which webxuker)".\nNow you can uninstall or update previous version.`);
		}
		// check installation directory
		const exists = fs.existsSync(this.installationPath);
		if (!exists) return; // path does not exist
		const stat = fs.statSync(this.installationPath);
		if (!stat.isDirectory()) {
			throw new Error(`${this.installationPath} does not directory`);
		}
		// if directory exists then it must be empty
		const items = fs.readdirSync(this.installationPath);
		if (items.length) {
			throw new Error(`Directory ${this.installationPath} does not empty`);
		}
	}

	async getLastReleaseURL(): Promise<IReleaseInfo> {
		const client = new Axios({
			baseURL: `https://api.github.com/repos/${REPO}`,
		});
		const response = await client.get('releases/latest');
		if (response.status >= 400) {
			throw new Error('Latest release not found');
		}
		const releaseInfo = JSON.parse(response.data);
		if (!releaseInfo.assets) {
			throw new Error('Latest release not found');
		}
		if (releaseInfo.assets.length !== 1) {
			throw new Error('Latest release contains more than one asset');
		}
		return {
			tagName: releaseInfo.tag_name,
			assetName: releaseInfo.assets[0].name,
			assetSize: releaseInfo.assets[0].size,
			assetURL: releaseInfo.assets[0].browser_download_url,
		};
	}

	async downloadAsset(releaseInfo: IReleaseInfo): Promise<string> {
		// check and create directory
		const exists = fs.existsSync(this.installationPath);
		if (!exists) {
			fs.mkdirSync(this.installationPath);
		}
		return await axios({
			url: releaseInfo.assetURL,
			responseType: 'stream',
		})
			.then(async (response: AxiosResponse) => {
				const destFile = path.resolve(this.installationPath, releaseInfo.assetName);
				const stream = fs.createWriteStream(destFile);
				return new Promise<string>(resolve => {
					stream.once('close', () => {
						resolve(destFile);
					});
					response.data.pipe(stream);
				});
			});
	}

	async unpackAsset(destFile: string): Promise<void> {
		await tar.extract({
			file: destFile,
			cwd: this.installationPath,
		});
	}

	async install(): Promise<void> {
		// install node modules
		const packageCwd = path.resolve(this.installationPath, 'package');
		let res: ISpawnResult = await spawnChild('npm', ['i', '--omit=dev'], packageCwd);
		if (res.code) {
			throw new Error([
				'Cannot install node modules',
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
		// create script
		const script = `cd ${packageCwd} && node webxuker.js`;
		const scriptPath = path.resolve(packageCwd, 'webxuker');
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
		res = await spawnChild('ln', ['-s', scriptPath, BIN_PATH]);
		if (res.code) {
			throw new Error([
				`Cannot create application link ${BIN_PATH} from ${scriptPath}`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}
}
