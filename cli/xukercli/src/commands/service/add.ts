import fs from 'fs';
import { Command, Args, Flags } from '@oclif/core';
import { formatError, BaseCommand } from '../../helpers/index.js';
import {
	IServiceManagementTool,
	DryRunServiceManagementTool,
	ServiceManagementTool,
} from '../../tools/index.js';

interface IServiceAddOptions
{
	serviceName: string;
	configPath: string;
	dryRun: boolean;
}

export default class ServiceAddCommand extends BaseCommand
{
	static override description = 'Configure new Webxuker service';

	static override args = {
		name: Args.string({
			description: 'service name',
			required: true,
		}),
		path: Args.string({
			description: 'path to configuration file',
			required: true,
		}),
	};

	static override flags = {
		'dry-run': Flags.boolean({
			description: 'simulation of command execution without creating files',
			default: false,
		}),
	};

	static override examples = [
		'<%= config.bin %> <%= command.id %> test-service /opt/app/service/config.yaml'
	];

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(ServiceAddCommand);
		await this.exec({
			serviceName: args.name,
			configPath: args.path,
			dryRun: flags['dry-run'],
		});
	}

	private async exec(options: IServiceAddOptions): Promise<void> {
		if (options.dryRun) {
			this.warn(`The command is started in dry-run mode. Files will not be downloaded or saved on disk.`);
		}
		// tools
		const serviceTool: IServiceManagementTool = options.dryRun
			? new DryRunServiceManagementTool()
			: new ServiceManagementTool();
		this.logrun('New service configuring...');
		// create empty config if it does not exist
		if (!fs.existsSync(options.configPath)) {
			this.log(`Config file ${options.configPath} does not exists. Command will create template file.`);
			await serviceTool.createEmptyConfigFile(options.configPath);
			this.logok(`Empty config file created`);
		}
		await serviceTool.addNewService({
			name: options.serviceName,
			configurationPath: options.configPath,
		});
		this.logok(`Service "${options.serviceName}" installed`);
	}
}
