import { IServiceManagementTool } from './IServiceManagementTool.js';
import { sleep } from '../../helpers/index.js';

export class DryRunServiceManagementTool extends IServiceManagementTool
{
	override async createEmptyConfigFile(filePath: string): Promise<void> {
		await sleep(1000);
	}

	protected override async createNewService(): Promise<void> {
		await sleep(1000);
	}

	override async deleteExistService(): Promise<void> {
		await sleep(1000);
	}

	override async startExistService(): Promise<void> {
		await sleep(1000);
	}

	override async stopExistService(): Promise<void> {
		await sleep(1000);
	}

}
