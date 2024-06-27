import { AxiosError } from 'axios';
import { HumanError } from '../errors/index.js';

export function formatError(error: Error | unknown): string {
	let lines: string[] = [];
	if (error instanceof Error) {
		if (error instanceof HumanError) {
			// для человеческих ошибок выводим только сообщение, без стека
			lines.push(error.message);
		} else {
			lines.push(error.stack || error.message);
		}
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
