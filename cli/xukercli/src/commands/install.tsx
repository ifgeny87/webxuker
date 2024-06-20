import React, { useState, useEffect, Fragment } from 'react';
import { Command, Flags } from '@oclif/core';
import { render, Text } from 'ink';
import { formatError, formatTime } from '../helpers/index.js';
import { ErrorFragment, SpinnerText } from '../components/index.js';
import {
	InstallApplicationTool,
	DryRunInstallApplicationTool,
	IReleaseInfo, IInstallApplicationTool,
} from '../tools/index.js';

interface IInstallProps
{
	path: string;
	dryRun: boolean;
}

function InstallComponent(props: IInstallProps): JSX.Element {
	const [logs] = useState<JSX.Element[]>([]);
	const [done, setDone] = useState(false);
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	function pushLog(message: string | JSX.Element): void {
		const node = <Text key={Math.random()}>
			[<Text color="green">{formatTime(new Date())}</Text>] {message}
		</Text>;
		logs.push(node);
	}

	useEffect(() => {
		const installationTool: IInstallApplicationTool = props.dryRun
			? new DryRunInstallApplicationTool()
			: new InstallApplicationTool();
		pushLog(`Application Webxuker will be installed to ${props.path}`);
		installationTool.checkPreviousVersionInstalled()
			.then(() => {
				pushLog('Previous version of installed application was not found. Its OK.');
				return installationTool.checkInstallationPath(props.path);
			})
			.then(() => {
				pushLog('Checking of installation path was successful');
				return installationTool.getLastReleaseURL();
			})
			.then((releaseInfo: IReleaseInfo) => {
				pushLog(`Found remote release ${releaseInfo.tagName}`);
				setSpinnerText(`Downloading release asset ${releaseInfo.assetName} (${releaseInfo.assetSize} bytes)...`);
				return installationTool.downloadAsset(releaseInfo, props.path);
			})
			.then((destFile: string) => {
				pushLog(`Asset downloaded to ${destFile}`);
				setSpinnerText(`Unpacking ${destFile}...`);
				return installationTool.unpackAsset(destFile, props.path);
			})
			.then(() => {
				pushLog('Unpacked package');
				setSpinnerText('Package installation...');
				return installationTool.install(props.path);
			})
			.then(() => {
				pushLog(`Package installed to ${props.path}`);
				setDone(true);
			})
			.catch((error: Error | unknown) => {
				setError(formatError(error));
			});
	}, []);

	const renderResult = (): JSX.Element => {
		return <>
			{props.dryRun
				? <ErrorFragment warning="The command is started in dry-run mode. Files will not be downloaded or saved on disk." />
				: null}
			{logs.map(i => i)}
			{error ? <ErrorFragment error={error} />
				: done ? <Text>Done</Text>
					: spinnerText ? <SpinnerText text={spinnerText} /> : null}
		</>;
	}

	return <Fragment>{renderResult()}</Fragment>;
}

export default class InstallCommand extends Command
{
	static override description = 'Install Webxuker application on your server';

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
