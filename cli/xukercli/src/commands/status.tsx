import React, { useState, useEffect, Fragment } from 'react';
import { Command } from '@oclif/core';
import { render } from 'ink';
import { SpinnerText, LogPrinter } from '../components/index.js';
import { InstallApplicationTool, ServiceManagementTool } from '../tools/index.js';
import { ServiceStatusInfo } from '../models/index.js';

function StatusComponent(): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();

	useEffect(() => {
		const installationTool = new InstallApplicationTool();
		const serviceTool = new ServiceManagementTool();
		setSpinnerText('Calculating...');
		logs.add('1 line');
		serviceTool.getServiceStatusesList()
			.then((services: ServiceStatusInfo[] | undefined) => {
				logs.add('2 line');
				// setSpinnerText(undefined);
				throw new Error('11111111');
			});
	}, []);

	const renderResult = (): JSX.Element => {
		return <>
			{logs.render()}
			{spinnerText ? <SpinnerText text={spinnerText} /> : null}
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
