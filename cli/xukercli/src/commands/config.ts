import { ConfigurationTool } from '../tools/index.js';
import { BaseCommand } from '../helpers/index.js';

export default class ConfigCommand extends BaseCommand
{
	static override description = 'Prints saved configuration';

	public async run(): Promise<void> {
		const configTool = ConfigurationTool.getInstance();
		this.printAsJSON(configTool.toDto());
	}
}
