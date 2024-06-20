import { sleep } from '../../helpers/index.js';
import { IInstallApplicationTool } from './IInstallApplicationTool.js';

export class DryRunInstallApplicationTool extends IInstallApplicationTool
{
	override async downloadAsset(): Promise<string> {
		await sleep(3000);
		return '/some-directory/some-file';
	}

	override async unpackAsset(destFile: string): Promise<void> {
		await sleep(3000);
	}

	override async install(): Promise<void> {
		await sleep(3000);
	}

	override async uninstall(): Promise<void> {
		await sleep(3000);
	}
}
