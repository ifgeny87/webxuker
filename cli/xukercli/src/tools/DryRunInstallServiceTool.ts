import { sleep } from '../helpers/index.js';
import { IInstallServiceTool, IReleaseInfo } from './IInstallServiceTool.js';

export class DryRunInstallServiceTool extends IInstallServiceTool
{
	override async downloadAsset(releaseInfo: IReleaseInfo): Promise<string> {
		await sleep(3000);
		return '/directory/file';
	}

	override async unpackAsset(destFile: string): Promise<void> {
		await sleep(3000);
	}

	override async install(): Promise<void> {
		await sleep(3000);
	}
}
