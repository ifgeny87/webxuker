import * as fs from 'fs';
import { Axios } from 'axios';

const REPO = 'ifgeny87/webxuker';

export class InstallServiceTool
{
	constructor(private readonly installationPath: string) {}

	async checkInstallationPath(): Promise<void> {
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

	async getLastReleaseURL(): Promise<string> {
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
		return 'ok';
	}
}
