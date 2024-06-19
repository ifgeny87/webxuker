import { Args, Command, Flags } from '@oclif/core'

export default class TestHello extends Command
{
	static override description = 'Check is CLI works';

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
	];

	public async run(): Promise<void> {
		this.log(`Hello Kitty`);
	}
}
