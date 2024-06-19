import * as util from 'util'
import { NodeErrorItem } from './NodeErrorItem';

function addTailSpaces(str: string, maxLength: number): string {
	return str + ' '.repeat(maxLength - str.length);
}

function toUpperCase(str: string): string {
	return str.replace(/([A-Z][a-z]+)/g, (x, y) => {
		return '_' + y
	})
		.replace(/([A-Z]{2,})/g, (x, y) => {
			return '_' + y
		})
		.replace(/^_/g, '')
		.toUpperCase();
}

export class NodeError extends Error
{
	public nestedError: Error | undefined;
	public items: NodeErrorItem[] = [];
	public others: unknown[] = [];
	protected namePrefix = '';

	constructor(
		protected context: (() => unknown) | object | string,
		protected errorMessage: string,
		...args: unknown[]
	) {
		super();
		Error.captureStackTrace(this, this.constructor);

		this.name = this.getNamePrefix() + toUpperCase(this.constructor.name);

		if (args && args.length) {
			for (const arg of args) {
				if (arg instanceof Error) this.setError(arg);
				else if (arg instanceof NodeErrorItem) this.items.push(arg);
				else this.others.push(arg);
			}
		}

		this.getMessage();
	}

	addItem(name: string, value: unknown, depth = 2): this {
		this.items.push(new NodeErrorItem(name, value, depth));
		this.getMessage();
		return this;
	}

	setError(error: Error): this {
		this.nestedError = error;
		return this;
	}

	public getMessage(): string {
		let result = this.name + ' thrown at ' + this.getContextName() + ': \n       ' + this.errorMessage;

		let maxLabelLength = 0;
		for (const item of this.items) {
			if (item.name.length > maxLabelLength) maxLabelLength = item.name.length;
		}

		for (const item of this.items)
			result += '\n       - ' + addTailSpaces(item.name + ': ', maxLabelLength + 2) + item.getInspectValue();
		for (const value of this.others)
			result += '\n       - ' + util.inspect(value, true, 1, true);

		if (this.nestedError) {
			result += '\n-------------------------------\n';
			if (this.nestedError instanceof NodeError) {
				result += this.nestedError.message;
			} else if (this.nestedError instanceof Error) {
				result += this.nestedError.stack;
			} else {
				result += util.inspect(this.nestedError, true, 2, true);
			}
		} else {
			result += '\n' + this.stack;
		}
		this.message = result;

		return result;
	}

	[util.inspect.custom](): string {
		return this.message;
	}

	protected getContextName(): string {
		if (typeof this.context === 'string') return this.context;
		else if (typeof this.context === 'function') return this.context.name;
		else if (typeof this.context === 'object') return this.context.constructor.name;
		else return '--unknown ' + (typeof this.context) + ' context--'
	}

	/**
	 * may be overridden
	 */
	protected getNamePrefix(): string {
		return this.namePrefix;
	}
}
