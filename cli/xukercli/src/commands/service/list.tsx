import React, { useState, useEffect, Fragment } from 'react';
import { Command } from '@oclif/core';
import { render } from 'ink';
import { ErrorFragment, SpinnerText, LogPrinter } from '../../components/index.js';
import { ServiceManagementTool } from '../../tools/index.js';
import { ServiceStatusInfo } from '../../models/index.js';

function PrintServicesListComponent(): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const serviceTool = new ServiceManagementTool();
		setSpinnerText('Calculating...');
		serviceTool.getServiceStatusesList()
			.then((statuses: ServiceStatusInfo[] | undefined) => {

			});
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

export default class ServiceListCommand extends Command
{
	static override description = 'Print services list';

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
	];

	public async run(): Promise<void> {
		render(<PrintServicesListComponent />);
	}
}
