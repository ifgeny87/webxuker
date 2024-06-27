import React, { useState, useEffect, Fragment } from 'react';
import { Command, Args, Flags } from '@oclif/core';
import { render } from 'ink';
import { formatError } from '../../helpers/index.js';
import {
	ErrorFragment,
	SpinnerText,
	LogPrinter,
	ServiceStatusTable,
} from '../../components/index.js';
import {
	IServiceManagementTool,
	DryRunServiceManagementTool,
	ServiceManagementTool,
} from '../../tools/index.js';
import { ServiceStatusInfo } from '../../models/index.js';

function ServiceStatusComponent(): JSX.Element {
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();
	const [items, setItems] = useState<ServiceStatusInfo[]>();

	useEffect(() => {
		const serviceTool = new ServiceManagementTool();
		setSpinnerText('Fetching...');
		serviceTool.getServiceStatusesList()
			.then(statuses => {
				setItems(statuses);
				setSpinnerText(undefined);
			})
			.catch((error: Error | unknown) => {
				setError(formatError(error));
				process.exit(1);
			});
	}, []);

	return <Fragment>
		{items ? <ServiceStatusTable items={items} /> : null}
		{error ? <ErrorFragment error={error} />
			: spinnerText ? <SpinnerText text={spinnerText} /> : null}
	</Fragment>;
}

export default class ServiceStatusCommand extends Command
{
	static override description = 'Print Webxuker services list';

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(ServiceStatusCommand);
		render(<ServiceStatusComponent />);
	}
}
