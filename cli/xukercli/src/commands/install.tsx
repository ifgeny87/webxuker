import React, { useState, useEffect, Fragment } from 'react';
import { Command, Flags } from '@oclif/core';
import { render, Text } from 'ink';
import { formatError } from '../helpers/index.js';
import { ErrorFragment, SpinnerText } from '../components/index.js';
import { InstallServiceTool, IReleaseInfo, ConfigurationTool } from '../tools/index.js';

interface IInstallProps
{
	path: string;
}

const configTool = new ConfigurationTool();

function InstallComponent(props: IInstallProps): JSX.Element {
	const [logs] = useState<string[]>([]);
	const [done, setDone] = useState(false);
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	function pushLog(message: string): void {
		logs.push(message);
	}

	useEffect(() => {
		const tool = new InstallServiceTool(props.path)
		tool.checkInstallationPath()
			.then(() => {
				pushLog('Installation path checking done');
				return tool.getLastReleaseURL();
			})
			.then((releaseInfo: IReleaseInfo) => {
				pushLog(`Found release ${releaseInfo.tagName}`);
				setSpinnerText(`Downloading asset ${releaseInfo.assetName} (${releaseInfo.assetSize} bytes)...`);
				return tool.downloadAsset(releaseInfo);
			})
			.then((destFile: string) => {
				pushLog(`Asset downloaded to ${destFile}`);
				setSpinnerText(`Unpacking ${destFile}...`);
				return tool.unpackAsset(destFile);
			})
			.then(() => {
				pushLog('Unpacked package');
				setSpinnerText('Installation package...');
				return tool.install();
			})
			.then(() => {
				pushLog(`Package installed to ${props.path}`);
				configTool.setInstallationPath(props.path);
				setDone(true);
			})
			.catch((error: Error | unknown) => {
				setError(formatError(error));
			});
	}, []);

	const renderResult = (): JSX.Element => {
		return <>
			{logs.map((s, i) => <Text key={i}>{s}</Text>)}
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
	};

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
		'<%= config.bin %> <%= command.id %> --path /opt/webxuker',
	];

	public async run(): Promise<void> {
		const { flags } = await this.parse(InstallCommand);
		render(<InstallComponent
			path={flags.path}
		/>);
	}
}
