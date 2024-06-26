import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

interface ISpinnerTextProps {
	text?: string;
}

export function SpinnerText(props: ISpinnerTextProps): JSX.Element {
	return <Text>
		<Text color="green">
			<Spinner type="dots" />
		</Text>
		{` ${props.text || 'Loading...'}`}
	</Text>;
}
