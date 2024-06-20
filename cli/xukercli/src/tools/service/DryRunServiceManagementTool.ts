import { IServiceManagementTool, INewService, IExistService } from './IServiceManagementTool.js';
import { sleep } from '../../helpers/index.js';

export class DryRunServiceManagementTool extends IServiceManagementTool
{
	protected override async createNewService(service: INewService): Promise<void> {
		await sleep(3000);
	}

	override async deleteExistService(service: IExistService): Promise<void> {
		await sleep(3000);
	}

	override async startExistService(service: IExistService): Promise<void> {
		await sleep(3000);
	}

	override async stopExistService(service: IExistService): Promise<void> {
		await sleep(3000);
	}

}
