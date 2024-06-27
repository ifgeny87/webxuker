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

interface IServiceAddComponentProps
{
	serviceName: string;
	configPath: string;
	dryRun: boolean;
}

function ServiceAddComponent(props: IServiceAddComponentProps): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const serviceTool: IServiceManagementTool = props.dryRun
			? new DryRunServiceManagementTool()
			: new ServiceManagementTool();
		setSpinnerText('New service configuring...');
		serviceTool.addNewService({
			name: props.serviceName,
			configurationPath: props.configPath,
		})
			.then(() => {
				logs.add(`Service "${props.serviceName}" installed`);
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

export default class ServiceAddCommand extends Command
{
	static override description = 'Configure new Webxuker service';

	static override args = {
		name: Args.string({
			description: 'service name',
			required: true,
		}),
		path: Args.string({
			description: 'path to configuration file',
			required: true,
		}),
	};

	static override flags = {
		'dry-run': Flags.boolean({
			description: 'simulation of command execution without creating files',
			default: false,
		}),
	};

	static override examples = [
		'<%= config.bin %> <%= command.id %> test-service /opt/app/service/config.yaml',
		'<%= config.bin %> <%= command.id %> test-service /opt/app/service/config.yaml --dry-run',
	];

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(ServiceAddCommand);
		render(<ServiceAddComponent
			serviceName={args.name}
			configPath={args.path}
			dryRun={flags['dry-run']}
		/>);
	}
}
