import * as util from 'util'

export class NodeErrorItem
{
	constructor(
		public readonly name: string,
		public readonly value: unknown,
		protected readonly depth: number = 2,
	) {}

	getInspectValue(): string {
		try {
			return util.inspect(this.value, true, this.depth);
		} catch (err: Error | unknown) {
			const text = (err instanceof Error) ? err.message : String(err);
			return `-- unable to inspect value --\n${text}`;
		}
	}
}
