import { AxiosError } from 'axios';

export function formatError(error: Error | unknown): string {
	let lines: string[] = [];
	if (error instanceof Error) {
		lines.push(error.message);
		if (error instanceof AxiosError && error.response?.data) {
			const data = error.response.data;
			try {
				lines.push(JSON.stringify(data, null, '  '));
			} catch(_) {
				lines.push(String(data));
			}
		}
	} else {
		lines.push(String(error));
	}
	return lines.join('\n');
}
