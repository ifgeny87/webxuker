import React from 'react';
import { Text } from 'ink';

interface IErrorComponentProps
{
	error?: string;
	warning?: string;
}

export function ErrorFragment(props: IErrorComponentProps): JSX.Element | null {
	if (!(props.error?.length || props.warning?.length)) {
		return null;
	}
	return <>
		{props.error?.length && <Text color="red">{props.error.toString()}</Text>}
		{props.warning?.length && <Text color="magenta">Warning: {props.warning.toString()}</Text>}
	</>;
}
