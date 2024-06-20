import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import * as tar from 'tar';
import { ISpawnResult, spawnChild } from '../helpers/index.js';
import { IInstallServiceTool, IReleaseInfo } from './IInstallServiceTool.js';

export class InstallServiceTool extends IInstallServiceTool
{
	override async downloadAsset(releaseInfo: IReleaseInfo): Promise<string> {
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

	override async unpackAsset(destFile: string): Promise<void> {
		await tar.extract({
			file: destFile,
			cwd: this.installationPath,
		});
	}

	override async install(): Promise<void> {
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
		res = await spawnChild('ln', ['-s', scriptPath, this.BIN_PATH]);
		if (res.code) {
			throw new Error([
				`Cannot create application link ${this.BIN_PATH} from ${scriptPath}`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}
}
