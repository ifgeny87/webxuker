import { ISpawnResult } from './spawn.js';

export class HumanError extends Error
{
	name = HumanError.name;
}

export class CLIConfigurationError extends HumanError
{
	name = CLIConfigurationError.name;
}

export class EntityNotFoundBySearchParamsError extends HumanError
{
	name = EntityNotFoundBySearchParamsError.name

	constructor(entityName: string, search: object) {
		super();
		this.message = `Entity ${entityName} with params ${JSON.stringify(search)} not found`;
	}
}

export class SpawnError extends HumanError
{
	name = SpawnError.name;

	constructor(message: string, spawnResult: ISpawnResult) {
		super();
		const lines: string[] = [];
		lines.push(message);
		lines.push(`CMD: ${spawnResult.fullCmd}`);
		lines.push(`EXIT CODE: ${spawnResult.exitCode}`);
		if (spawnResult.stderr) {
			lines.push(`STDERR: ${spawnResult.stderr}`);
		}
		if (spawnResult.stdout) {
			lines.push(`STDOUT: ${spawnResult.stdout}`);
		}
		this.message = lines.join('\n');
	}
}
