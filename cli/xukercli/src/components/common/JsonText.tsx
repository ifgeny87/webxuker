import React from 'react';
import { Text } from 'ink';

interface IJsonTextProps
{
	data: any;
	pretify?: boolean;
}

export function JsonText(props: IJsonTextProps): JSX.Element {
	return <Text>
		{JSON.stringify(props.data, null, props.pretify ? '  ' : undefined)}
	</Text>;
}
