import { BaseCommand } from '../helpers/index.js';
import { InstallApplicationTool, ServiceManagementTool } from '../tools/index.js';
import { ServiceStatusInfo } from '../models/index.js';

export default class StatusCommand extends BaseCommand
{
	static override description = 'Print application status';

	public async run(): Promise<void> {
		await this.exec();
	}

	async exec(): Promise<void> {
		const installationTool = new InstallApplicationTool();
		const serviceTool = new ServiceManagementTool();
		this.log('1 line');
		await serviceTool.getServiceStatusesList()
			.then((services: ServiceStatusInfo[] | undefined) => {
				this.log('2 line');
				throw new Error('11111111');
			});
	}
}
