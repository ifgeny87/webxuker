import React, { useState, useEffect, Fragment } from 'react';
import { Command, Flags } from '@oclif/core';
import { render } from 'ink';
import { formatError } from '../helpers/index.js';
import { ErrorFragment, SpinnerText, LogPrinter } from '../components/index.js';
import {
	InstallApplicationTool,
	DryRunInstallApplicationTool,
	IReleaseInfo,
	IInstallApplicationTool,
} from '../tools/index.js';

interface IInstallProps
{
	path: string;
	dryRun: boolean;
}

function InstallComponent(props: IInstallProps): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const installationTool: IInstallApplicationTool = props.dryRun
			? new DryRunInstallApplicationTool()
			: new InstallApplicationTool();
		logs.add(`Application Webxuker will be installed to ${props.path}`);
		installationTool.checkPreviousVersionInstalled()
			.then(() => {
				logs.add('Previous version of installed application was not found. Its OK.');
				return installationTool.checkInstallationPath(props.path);
			})
			.then(() => {
				logs.add('Checking of installation path was successful');
				return installationTool.getLastReleaseURL();
			})
			.then((releaseInfo: IReleaseInfo) => {
				logs.add(`Found remote release ${releaseInfo.tagName}`);
				setSpinnerText(`Downloading release asset ${releaseInfo.assetName} (${releaseInfo.assetSize} bytes)...`);
				return installationTool.downloadAsset(releaseInfo, props.path);
			})
			.then((destFile: string) => {
				logs.add(`Asset downloaded to ${destFile}`);
				setSpinnerText(`Unpacking ${destFile}...`);
				return installationTool.unpackAsset(destFile, props.path);
			})
			.then(() => {
				logs.add(`Unpacked to ${props.path}`);
				setSpinnerText('Modules installation...');
				return installationTool.install(props.path);
			})
			.then(() => {
				logs.add(`Package installed to ${props.path}`);
				setSpinnerText(undefined);
			})
			.catch((error: Error | unknown) => {
				setError(formatError(error));
				process.exit(1);
			});
	}, []);

	return <Fragment>
		{props.dryRun
			? <ErrorFragment warning="The command is started in dry-run mode. Files will not be downloaded or saved on disk." />
			: null}
		{logs.render()}
		{error ? <ErrorFragment error={error} />
			: spinnerText ? <SpinnerText text={spinnerText} /> : null}
	</Fragment>;
}

export default class InstallCommand extends Command
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

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
		'<%= config.bin %> <%= command.id %> --dry-run',
		'<%= config.bin %> <%= command.id %> --path /opt/webxuker',
	];

	public async run(): Promise<void> {
		const { flags } = await this.parse(InstallCommand);
		render(<InstallComponent
			path={flags.path}
			dryRun={flags['dry-run']}
		/>);
	}
}
