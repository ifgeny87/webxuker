import React, { useState, useEffect, Fragment } from 'react';
import { Command, Args } from '@oclif/core';
import { render, Text } from 'ink';
import { ErrorFragment, SpinnerText, LogPrinter } from '../../components/index.js';
import { ServiceManagementTool } from '../../tools/index.js';
import { ServiceStatusInfo } from '../../models/index.js';
import { formatError } from '../../helpers/index.js';

export default class ServiceLogCommand extends Command
{
	static override description = 'Print log of service';

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
		const { args } = await this.parse(ServiceLogCommand);
		const serviceTool = new ServiceManagementTool();
		await serviceTool.getServiceLogs(args.name)
			.then(lines => {
				this.log(lines);
			})
			.catch((error: Error | unknown) => {
				render(<ErrorFragment error={formatError(error)} />);
				process.exit(1);
			});
	}
}
