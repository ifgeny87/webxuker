import React from 'react';
import { Text } from 'ink';

interface ISpinnerTextProps {
	text?: string;
}

export function SpinnerText(props: ISpinnerTextProps): JSX.Element {
	return <Text>{props.text || 'Loading...'}</Text>;
}
