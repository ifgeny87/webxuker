import React, { useState, useEffect, Fragment } from 'react';
import { Command, Args, Flags } from '@oclif/core';
import { render } from 'ink';
import { formatError } from '../../helpers/index.js';
import { ErrorFragment, SpinnerText, LogPrinter } from '../../components/index.js';
import {
	IServiceManagementTool,
	DryRunServiceManagementTool,
	ServiceManagementTool,
} from '../../tools/index.js';

interface IServiceStartComponentProps
{
	serviceName: string;
}

function ServiceStartComponent(props: IServiceStartComponentProps): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const serviceTool = new ServiceManagementTool();
		setSpinnerText('Starting...');
		serviceTool.startByName(props.serviceName)
			.then(() => {
				logs.add(`Service "${props.serviceName}" started`);
				setSpinnerText(undefined);
			})
			.catch((error: Error | unknown) => {
				setError(formatError(error));
				process.exit(1);
			});
	}, []);

	return <Fragment>
		{logs.render()}
		{error ? <ErrorFragment error={error} />
			: spinnerText ? <SpinnerText text={spinnerText} /> : null}
	</Fragment>;
}

export default class ServiceStartCommand extends Command
{
	static override description = 'Start Webxuker service';

	static override args = {
		name: Args.string({
			description: 'service name',
			required: true,
		}),
	};

	static override examples = [
		'<%= config.bin %> <%= command.id %> test-service',
	];

	public async run(): Promise<void> {
		const { args } = await this.parse(ServiceStartCommand);
		render(<ServiceStartComponent
			serviceName={args.name}
		/>);
	}
}
