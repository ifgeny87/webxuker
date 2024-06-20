import moment from 'moment';

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export function formatDateTime(value: string | Date): string {
	return moment(value)
		.format(`${moment.HTML5_FMT.DATE} ${moment.HTML5_FMT.TIME_SECONDS}`);
}

export function formatTime(value: string | Date): string {
	return moment(value)
		.format(`${moment.HTML5_FMT.TIME_SECONDS}`);
}
