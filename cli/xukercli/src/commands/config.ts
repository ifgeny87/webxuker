import * as fs from 'fs';
import { Command } from '@oclif/core';
import { ConfigurationTool } from '../tools/index.js';

const configTool = ConfigurationTool.getInstance();

export default class ConfigCommand extends Command
{
	static override description = 'Prints saved configuration';

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
	];

	public async run(): Promise<void> {
		this.log(`Configuration location: ${configTool.CONFIG_FILE}`);
		try {
			const exists = fs.existsSync(configTool.CONFIG_FILE);
			if (!exists) {
				this.log('Configuration file does not exists');
			} else {
				const content = fs.readFileSync(configTool.CONFIG_FILE).toString();
				this.log(content);
			}
		} catch (err: Error | unknown) {
			const text = (err instanceof Error) ? err.message : String(err);
			this.error(`Cannot check configuration file.\n${text}`);
		}
	}
}
