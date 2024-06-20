import React, { useState, useEffect, Fragment } from 'react';
import { Command } from '@oclif/core';
import { render } from 'ink';
import { ErrorFragment, SpinnerText, LogPrinter } from '../components/index.js';
import { InstallApplicationTool, ServiceManagementTool } from '../tools/index.js';

function StatusComponent(): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const installationTool = new InstallApplicationTool();
		const serviceTool = new ServiceManagementTool();
		setSpinnerText('Calculating...');
		// TODO
		setTimeout(() => setSpinnerText(undefined), 2000);
	}, []);

	const renderResult = (): JSX.Element => {
		return <>
			{logs.render()}
			{error ? <ErrorFragment error={error} />
				: spinnerText ? <SpinnerText text={spinnerText} /> : null}
		</>;
	}

	return <Fragment>{renderResult()}</Fragment>;
}

export default class StatusCommand extends Command
{
	static override description = 'Print application status';

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
	];

	public async run(): Promise<void> {
		render(<StatusComponent />);
	}
}
