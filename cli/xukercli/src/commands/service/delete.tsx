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

interface IServiceDeleteComponentProps
{
	serviceName: string;
	dryRun: boolean;
}

function ServiceDeleteComponent(props: IServiceDeleteComponentProps): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const serviceTool: IServiceManagementTool = props.dryRun
			? new DryRunServiceManagementTool()
			: new ServiceManagementTool();
		setSpinnerText('Service deleting...');
		serviceTool.deleteServiceByName(props.serviceName)
			.then(() => {
				logs.add(`Service "${props.serviceName}" deleted`);
				setSpinnerText(undefined);
			})
			.catch((error: Error | unknown) => {
				setError(formatError(error));
				process.exit(1);
			});
	}, []);

	return <Fragment>
		{props.dryRun
			? <ErrorFragment
				warning="The command is started in dry-run mode. Files will not be saved on disk." />
			: null}
		{logs.render()}
		{error ? <ErrorFragment error={error} />
			: spinnerText ? <SpinnerText text={spinnerText} /> : null}
	</Fragment>;
}

export default class ServiceDeleteCommand extends Command
{
	static override description = 'Delete Webxuker service configuration';

	static override args = {
		name: Args.string({
			description: 'service name',
			required: true,
		}),
	};

	static override flags = {
		'dry-run': Flags.boolean({
			description: 'simulation of command execution without deleting files',
			default: false,
		}),
	};

	static override examples = [
		'<%= config.bin %> <%= command.id %> test-service',
		'<%= config.bin %> <%= command.id %> test-service --dry-run',
	];

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(ServiceDeleteCommand);
		render(<ServiceDeleteComponent
			serviceName={args.name}
			dryRun={flags['dry-run']}
		/>);
	}
}
