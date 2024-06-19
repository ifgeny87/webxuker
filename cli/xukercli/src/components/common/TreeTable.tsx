import React from 'react';
import { ITableProps, Table } from './Table.js';

type Scalars = Record<string, any>;
type ExtractorResult = { scalars?: Scalars, nested?: any[], push?: any }[];
type Extractor = (arr: any[], ...stack: any[]) => ExtractorResult;

function transform(data: any[], extractors: Extractor[], records: Scalars[] = [], stack: any[] = []): Scalars {
	const items = extractors[0](data, ...stack);
	for (const item of items) {
		let record: Scalars;
		if (records.length === 0) {
			record = {};
			records.push(record);
		} else {
			record = records[records.length - 1];
		}
		if (item.scalars) {
			for (let key in item.scalars) {
				record[key] = item.scalars[key];
			}
		}
		const basic = {};
		if (item.nested?.length) {
			transform(item.nested, extractors.slice(1), records, item.push !== undefined ? [item.push, ...stack] : stack);
		} else {
			records.push(basic);
		}
	}
	return records;
}

function treeTraverse(data: any[], extractors: Extractor[]): Scalars[] {
	const result = transform(data, extractors);
	return result.slice(0, -1);
}

export interface ITreeTableProps extends ITableProps
{
	data: any[];
	extractors: Extractor[];
}

export function TreeTable(props: ITreeTableProps): JSX.Element {
	return <Table data={treeTraverse(props.data, props.extractors)} />;
}
