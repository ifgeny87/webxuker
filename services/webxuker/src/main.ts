import Logger from 'bunyan';
import minimist from 'minimist';
import * as fs from 'fs';
import { NodeError } from 'commonlib';
import { ConfigurationSchema } from './configuration/index.js';
import { WebhookerService } from './services/WebhookerService.js';

const logger = new Logger({
	name: 'Webxuker',
	streams: [{
		stream: process.stdout,
	}],
	level: 'trace',
});

let svc: WebhookerService;

async function start(): Promise<void> {
	const argv = minimist(process.argv.slice(2));
	const configFilePath = argv?.cfg;
	if (!configFilePath) {
		throw new NodeError(start, 'Command line option --cfg missing');
	}
	const configContent = fs.readFileSync(configFilePath, 'utf8');
	const configParseResult = ConfigurationSchema.safeParse(JSON.parse(configContent));
	if (!configParseResult.success) {
		throw new NodeError(start, 'Unable to read configuration file', configParseResult.error);
	}
	svc = await new WebhookerService(configParseResult.data, logger)
		.start();
}

start()
	.catch(error => {
		logger.fatal(error);
	});

let shuttingDown = false;

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
	if (shuttingDown || !svc) return;
	shuttingDown = true;
	logger.warn('Shutting down...');
	try {
		const timerId = setTimeout(() => {
			logger.error(new NodeError(shutdown, 'Timeout trying to properly stop service'));
			process.exit(2);
		}, 5000);
		await svc.stop();
		clearTimeout(timerId);
		process.exitCode = 0;
		logger.warn('Shut down');
	} catch (error) {
		logger.error(error, 'Unable to properly stop service');
		process.exit(1);
	}
}
