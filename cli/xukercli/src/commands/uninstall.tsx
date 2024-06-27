import React, { useState, useEffect, Fragment } from 'react';
import { Command, Flags } from '@oclif/core';
import { render, Text, Newline, useInput } from 'ink';
import { formatError } from '../helpers/index.js';
import { ErrorFragment, SpinnerText, LogPrinter } from '../components/index.js';
import {
	ServiceManagementTool,
	IInstallApplicationTool,
	DryRunInstallApplicationTool,
	InstallApplicationTool,
	DryRunServiceManagementTool,
	IServiceManagementTool,
} from '../tools/index.js';
import { ServiceInfo, ServiceStatusInfo } from '../models/index.js';

interface IUninstallProps
{
	yes: boolean;
	dryRun: boolean;
}

function UninstallComponent(props: IUninstallProps): JSX.Element {
	const [logs] = useState(new LogPrinter());
	const [spinnerText, setSpinnerText] = useState<string>();
	const [warning, setWarning] = useState<string>();
	const [error, setError] = useState<string>();
	const [step, setStep] = useState(1);
	const [services, setServices] = useState<ServiceInfo[]>();

	useEffect(() => {
		const installationTool: IInstallApplicationTool = props.dryRun
			? new DryRunInstallApplicationTool()
			: new InstallApplicationTool();
		const serviceTool: IServiceManagementTool = props.dryRun
			? new DryRunServiceManagementTool()
			: new ServiceManagementTool();

		if (step === 1) {
			// checking installation and get information of services
			installationTool.getInstallationPathFromBin()
				.then(path => {
					logs.add(`Found installation path "${path}"`);
					setSpinnerText('Uninstalling package...');
					return serviceTool.getServiceStatusesList();
				})
				.then((statuses: ServiceStatusInfo[] | undefined) => {
					if (!statuses?.length) {
						logs.add('No one service configurations found');
					} else {
						logs.add(<Text>
							Found next service configurations:
							{statuses.map(info => <Fragment key={info.name}>
								<Newline />
								* <Text
								color="green">{info.name}</Text> at {info.configurationPath}
							</Fragment>)}
						</Text>);
						setServices(statuses);
					}
					setStep(props.yes ? 3 : 2);
					setSpinnerText(undefined);
				})
				.catch((error: Error | unknown) => {
					setError(formatError(error));
					process.exit(1);
				});
		}

		if (step === 3) {
			// delete services
			new Promise(async resolve => {
				if (services?.length) {
					for (let i = 0; i < services.length; i++) {
						const service = services[i];
						setSpinnerText(`(${i + 1}/${services.length}) Deleting service "${service.name}"`);
						await serviceTool.deleteServiceByName(service.name)
							.then(() => {
								logs.add(<Text>
									Service <Text color="green">{service.name}</Text> deleted
								</Text>);
							})
							.catch((error: unknown) => {
								logs.add(<Text>
									Thrown an error while service <Text color="green">
									{service.name}
								</Text> deleting
								</Text>);
								throw error;
							});
					}
				}
				resolve(undefined);
			})
				.then(() => {
					logs.add(`All services deleted`);
					setSpinnerText('Uninstalling application...');
					return installationTool.uninstall();
				})
				.then(() => {
					logs.add(`Package uninstalled`);
					setSpinnerText(undefined);
				})
				.catch((error: Error | unknown) => {
					setError(formatError(error));
					process.exit(1);
				});
		}
	}, [step]);

	// копонент запросит у пользователя подтверждение
	const ConfirmInput = (): JSX.Element => {
		useInput((input, key) => {
			const yes = input.toUpperCase() === 'Y' || key.return;
			if (yes) {
				setStep(3);
			} else {
				setWarning('Uninstalling canceled by user');
			}
		});
		return <Text>
			Will continue to uninstall? <Text color="yellow">[Y/n]</Text>
		</Text>;
	}

	const renderResult = (): JSX.Element => {
		return <>
			{props.dryRun
				? <ErrorFragment
					warning="The command is started in dry-run mode. Files will not be deleted or saved on disk." />
				: null}
			{logs.render()}
			{error || warning ? <ErrorFragment error={error} warning={warning} />
				: step === 2 ? <ConfirmInput />
					: spinnerText ? <SpinnerText text={spinnerText} /> : null}
		</>;
	}

	return renderResult();
}

export default class UninstallCommand extends Command
{
	static override description = 'Uninstalls Webxuker application from your server';

	static override flags = {
		yes: Flags.boolean({
			char: 'y',
			description: 'execute command without confirmation',
			default: false,
		}),
		'dry-run': Flags.boolean({
			description: 'simulation of command execution without downloading and creating files',
			default: false,
		}),
	};

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
		'<%= config.bin %> <%= command.id %> --dry-run',
		'<%= config.bin %> <%= command.id %> --yes',
	];

	public async run(): Promise<void> {
		const { flags } = await this.parse(UninstallCommand);
		render(<UninstallComponent
			yes={flags.yes}
			dryRun={flags['dry-run']}
		/>);
	}
}
