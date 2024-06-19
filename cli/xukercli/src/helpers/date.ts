import moment from 'moment';

export function formatDateTime(value: string | Date): string {
	return moment(value)
		.format(`${moment.HTML5_FMT.DATE} ${moment.HTML5_FMT.TIME}`);
}
