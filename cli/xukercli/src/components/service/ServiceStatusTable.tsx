import React from 'react';
import { ServiceStatusInfo } from '../../models/index.js';
import { TreeTable } from '../common/index.js';
import { formatDateTime } from '../../helpers/index.js';

export function ServiceStatusTable(props: { items: ServiceStatusInfo[] }): JSX.Element {
	return (<TreeTable
		data={props.items}
		extractors={[
			(items: ServiceStatusInfo[]) => {
				return items.map(item => {
					return {
						scalars: {
							Unit: item.unit,
							Active: item.active,
							Status: item.status,
							Config: item.configurationPath,
							'Created At': formatDateTime(item.createdAt),
						},
					};
				});
			},
		]}
	/>);
}
