import React, { useState, useEffect, Fragment } from 'react';
import { Command, Flags } from '@oclif/core';
import { render, Text, Newline, useInput } from 'ink';
import { formatError, formatTime } from '../helpers/index.js';
import { ErrorFragment, SpinnerText } from '../components/index.js';
import {
	ServiceManagementTool,
	IInstallApplicationTool,
	DryRunInstallApplicationTool,
	InstallApplicationTool,
	INewService,
	DryRunServiceManagementTool,
	IServiceManagementTool,
} from '../tools/index.js';

interface IUninstallProps
{
	yes: boolean;
	dryRun: boolean;
}

function UninstallComponent(props: IUninstallProps): JSX.Element {
	const [logs] = useState<JSX.Element[]>([]);
	const [done, setDone] = useState(false);
	const [spinnerText, setSpinnerText] = useState<string>();
	const [warning, setWarning] = useState<string>();
	const [error, setError] = useState<string>();
	const [step, setStep] = useState(1);
	const [services, setServices] = useState<INewService[]>();

	function pushLog(message: string | JSX.Element): void {
		const node = <Text key={Math.random()}>
			[<Text color="green">{formatTime(new Date())}</Text>] {message}
		</Text>;
		logs.push(node);
	}

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
					pushLog(`Found installation path "${path}"`);
					setSpinnerText('Uninstalling package...');
					return serviceTool.getServiceList();
				})
				.then((services: INewService[]) => {
					if (!services.length) {
						pushLog('No one service configurations found');
					} else {
						pushLog(<Text>
							Found next service configurations:
							{services.map(info => <Fragment key={info.name}>
								<Newline />
								* <Text
								color="green">{info.name}</Text> at {info.configurationPath}
							</Fragment>)}
						</Text>);
						setServices(services);
					}
					setStep(props.yes ? 3 : 2);
					setSpinnerText(undefined);
				})
				.catch((error: Error | unknown) => {
					setError(formatError(error));
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
								pushLog(<Text>
									Service <Text color="green">{service.name}</Text> deleted
								</Text>);
							})
							.catch((error: unknown) => {
								pushLog(<Text>
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
					pushLog(`All services deleted`);
					setSpinnerText('Uninstalling application...');
					return installationTool.uninstall();
				})
				.then(() => {
					pushLog(`Package uninstalled`);
					setDone(true);
				})
				.catch((error: Error | unknown) => {
					setError(formatError(error));
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
			{logs.map(i => i)}
			{error || warning ? <ErrorFragment error={error} warning={warning} />
				: step === 2 ? <ConfirmInput />
					: done ? <Text>Done</Text>
						: spinnerText ? <SpinnerText text={spinnerText} /> : null}
		</>;
	}

	return renderResult();
}

export default class UninstallCommand extends Command
{
	static override description = 'Uninstall Webxuker application from your server';

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
