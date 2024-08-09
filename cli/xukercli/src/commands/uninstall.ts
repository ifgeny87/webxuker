import { Flags } from '@oclif/core';
import chalk from 'chalk';
import {createInterface} from 'node:readline';
import { BaseCommand } from '../helpers/index.js';
import {
	ServiceManagementTool,
	IInstallApplicationTool,
	DryRunInstallApplicationTool,
	InstallApplicationTool,
	DryRunServiceManagementTool,
	IServiceManagementTool, ConfigurationTool,
} from '../tools/index.js';

interface IUninstallOptions
{
	yes: boolean;
	dryRun: boolean;
}

export default class UninstallCommand extends BaseCommand
{
	static override description = 'Uninstalls Webxuker application from your server';

	static override flags = {
		yes: Flags.boolean({
			char: 'y',
			description: 'execute command without confirmation',
			default: false,
		}),
		'dry-run': Flags.boolean({
			description: 'simulation of command execution without downloading and creating files',
			default: false,
		}),
	};

	public async run(): Promise<void> {
		const { flags } = await this.parse(UninstallCommand);
		await this.exec({
			yes: flags.yes,
			dryRun: flags['dry-run'],
		});
	}

	private async exec(options: IUninstallOptions): Promise<void> {
		if (options.dryRun) {
			this.warn(`The command is started in dry-run mode. Files will not be downloaded or saved on disk.`);
		}
		// check config
		const configTool = ConfigurationTool.getInstance();
		const applicationInfo = configTool.getApplicationInfo();
		if (!applicationInfo) {
			this.logwarn(`Application config does not exists in config.
You can install latest application version.
Check your config with "xukercli config" command.`);
			return;
		}
		// tools
		const installationTool: IInstallApplicationTool = options.dryRun
			? new DryRunInstallApplicationTool()
			: new InstallApplicationTool();
		const serviceTool: IServiceManagementTool = options.dryRun
			? new DryRunServiceManagementTool()
			: new ServiceManagementTool();
		// check application bin file
		const installationPath = await installationTool.getInstallationPathFromBin();
		if (!installationPath) {
			this.logwarn('The application does not exists');
			return;
		}
		// check installation and get information of services
		const services = await serviceTool.getServiceStatusesList();
		if (!services?.length) {
			this.log('No one service configurations found');
		} else {
			this.log(`Found next service configurations:
${services.map(info => `* ${info.name} at ${info.configurationPath}`)}`);
		}
		// confirmation
		if (!options.yes) {
			const rl = createInterface({ input: process.stdin, output: process.stdout			});
			let count = 0;
			let flag: boolean | undefined = undefined;
			while (count++ < 3 && flag === undefined) {
				flag = await new Promise<boolean | undefined>(resolve => {
					const question = (count === 1) ? 'Command will delete services and uninstall application. Are you sure? [y/n]: '
						: (count === 2) ? 'There was no such option 😌 Type y or n: '
						: 'No, wrong 🙁 Type y or n: ';
					rl.question(chalk.whiteBright(question), ans => {
						resolve(ans.toLowerCase() === 'y' ? true
							: ans.toLowerCase() === 'n' ? false : undefined);
					});
				});
			}
			rl.close();
			if (flag === false) {
				this.log(chalk.yellow('Operation canceled'));
				return;
			}
			if (flag !== true) {
				this.log(chalk.yellow(`It seems like you can't make a decision. Try next time 🥲`));
				return;
			}
		}
		// delete services
		if (services?.length) {
			for (let i = 0; i < services.length; i++) {
				const service = services[i];
				this.logrun(`(${i + 1}/${services.length}) Service "${service.name}" deleting...`);
				await serviceTool.deleteServiceByName(service.name);
				this.logok(`Service ${service.name} deleted`);
			}
			this.log(`All services deleted`);
		}
		// uninstall application
		this.logrun('Application uninstalling...');
		await installationTool.uninstall(applicationInfo);
		this.logok(`Application uninstalled`);
	}
}
