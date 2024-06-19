import React from 'react';
import { Box, Text, TextProps } from 'ink';

export type Scalar = string | number | boolean | null | undefined;

export interface ScalarDict
{
	[key: string]: Scalar;
}

export type TableDataType<T extends ScalarDict = ScalarDict> = T[];

export interface ICellStylingProps extends TextProps
{
	align?: 'left' | 'right';
}

function getValueWidth(string: string): number {
	return Math.max(...string.split('\n').map(s => s.length));
}

function stringify(value: Scalar): string {
	switch (typeof value) {
		case 'undefined':
			return '';
		case 'number':
			return value.toString();
		case 'string':
			return value;
		case 'object':
			return value === null ? 'null' : '[Object]';
		case 'boolean':
			return value ? 'true' : 'false';
	}
}

/* Cell */

export interface ICellProps extends ICellStylingProps
{
	value: string;
	width: number;
}

export function Cell(props: ICellProps): JSX.Element {
	return <Box
		width={props.width}
		justifyContent={props.align === 'right' ? 'flex-end' : 'flex-start'}
	>
		<Text {...props}>{props.value}</Text>
	</Box>;
}

/* Table */

export interface ITableProps<T extends ScalarDict = ScalarDict>
{
	data: TableDataType<T>;
	styles?: Record<string, ICellStylingProps>;
}

type CellsData = Record<string, { value: string, style?: ICellStylingProps }>;

export function Table<T extends ScalarDict>(props: ITableProps): JSX.Element | null {
	const { data } = props;
	if (!data.length) {
		return null;
	}
	const columns: Record<string, { name: string, width: number }> = {};
	const cells: CellsData[] = [];
	const columnStyles = props.styles || {};
	// calc column widths
	for (const row of data) {
		for (const key in row) {
			if (columns[key]) continue;
			columns[key] = {
				name: key,
				width: getValueWidth(key),
			};
		}
	}
	for (const [rowIndex, row] of data.entries()) {
		const rowValues: CellsData = {};
		cells.push(rowValues);
		for (const columnName in columns) {
			const dataValue = row[columnName];
			const cell = {
				value: stringify(dataValue),
				style: columnStyles[columnName],
			};
			columns[columnName].width = Math.max(columns[columnName].width, getValueWidth(cell.value));
			rowValues[columnName] = cell;
		}
	}
	return <Box flexDirection="column">
		<Box flexDirection="row" columnGap={2}>
			{Object.keys(columns).map(key => {
				const column = columns[key];
				return <Cell
					key={`header ${key}`}
					value={column.name}
					width={column.width}
					align={columnStyles[key]?.align}
					bold
				/>;
			})}
		</Box>
		{cells.map((row, rowIndex) => {
			return <Box columnGap={2} key={`row ${rowIndex}`} flexDirection="row">
				{Object.keys(row).map(columnName => {
					const cell = row[columnName];
					return <Cell
						key={`cell ${columnName} ${rowIndex}`}
						value={cell.value}
						width={columns[columnName].width}
						align={cell.style?.align}
						{...cell.style}
					/>;
				})}
			</Box>;
		})}
	</Box>;
}
