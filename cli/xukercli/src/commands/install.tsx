import React, { useState, useEffect, Fragment } from 'react';
import { Command, Flags } from '@oclif/core';
import { render, Text } from 'ink';
import { formatError } from '../helpers/index.js';
import { ErrorFragment, SpinnerText } from '../components/index.js';
import { InstallServiceTool } from '../tools/index.js';

interface IInstallProps
{
	path: string;
}

function InstallComponent(props: IInstallProps): JSX.Element {
	const [logs] = useState<string[]>([]);
	const [tool] = useState(new InstallServiceTool(props.path));
	const [done, setDone] = useState(false);
	const [spinnerText, setSpinnerText] = useState<string>();
	const [step, setStep] = useState(0);
	const [error, setError] = useState<string>();

	function pushLog(message: string): void {
		logs.push(message);
	}

	useEffect(() => {
		switch (step) {
			case 0:
				tool.checkInstallationPath()
					.then(() => {
						pushLog('Installation path checking done');
						setStep(1);
					})
					.catch((error: Error | unknown) => {
						setError(formatError(error));
					});
				break;
			case 1:
				tool.getLastReleaseURL()
					.then((url: string) => {

					})
					.catch((error: Error | unknown) => {
						setError(formatError(error));
					});
		}
	}, [step]);

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
