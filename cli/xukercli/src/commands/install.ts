import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../helpers/index.js';
import {
	InstallApplicationTool,
	DryRunInstallApplicationTool,
	IReleaseInfo,
	IInstallApplicationTool,
} from '../tools/index.js';

interface IInstallOptions
{
	path: string;
	dryRun: boolean;
}

export default class InstallCommand extends BaseCommand
{
	static override description = 'Installs Webxuker application on your server';

	static override flags = {
		path: Flags.string({
			description: 'path to install',
			default: '/usr/local/webxuker',
		}),
		'dry-run': Flags.boolean({
			description: 'simulation of command execution without downloading and creating files',
			default: false,
		}),
	};

	public async run(): Promise<void> {
		const { flags } = await this.parse(InstallCommand);
		await this.exec({
			path: flags.path,
			dryRun: flags['dry-run'],
		});
	}

	private async exec(options: IInstallOptions): Promise<void> {
		if (options.dryRun) {
			this.warn(`The command is started in dry-run mode. Files will not be downloaded or saved on disk.`);
		}
		// init tools
		const installationTool: IInstallApplicationTool = options.dryRun
			? new DryRunInstallApplicationTool()
			: new InstallApplicationTool();
		// checking
		const result = await installationTool.checkPreviousVersionInstalled();
		if (result !== false) {
			this.log(chalk.yellow(result));
			return;
		}
		this.log('Previous version of installed application was not found. Its OK.');
		await installationTool.checkInstallationPath(options.path);
		// download release asset
		const releaseInfo: IReleaseInfo = await installationTool.getLastReleaseURL();
		this.log(`Found remote release ${chalk.blue(releaseInfo.tagName)}`);
		this.log(`Downloading release asset ${chalk.blue(releaseInfo.assetName)} (${releaseInfo.assetSize} bytes)...`);
		const destFile = await installationTool.downloadAsset(releaseInfo, options.path);
		this.log(`Asset downloaded to ${destFile}`);
		// install application
		this.log(`Unpacking ${destFile}...`);
		await installationTool.unpackAsset(destFile, options.path);
		this.log(`Unpacked to ${options.path}`);
		this.log(`Application will be installed to ${chalk.blue(options.path)}`);
		await installationTool.install(options.path);
		this.logok(`Application installed`);
	}
}
