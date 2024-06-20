import React from 'react';
import { Text } from 'ink';
import { formatTime } from '../../helpers/index.js';

export class LogPrinter
{
	private readonly logs: JSX.Element[] = [];

	add(message: string | JSX.Element): void {
		const node = <Text key={Math.random()}>
			[<Text color="green">{formatTime(new Date())}</Text>] {message}
		</Text>;
		this.logs.push(node);
	}

	render(): JSX.Element | null {
		if (!this.logs.length) return null;
		return <>{this.logs.map(i => i)}</>;
	}
}
