export enum ServiceStatusCodesEnum {
	running = 'running',
	exited = 'exited',
	dead = 'dead',
	failed = 'failed',
}

export function readServiceStatusCode(code: string | ServiceStatusCodesEnum): ServiceStatusCodesEnum {
	switch (code) {
		case ServiceStatusCodesEnum.running:
		case ServiceStatusCodesEnum.exited:
		case ServiceStatusCodesEnum.dead:
		case ServiceStatusCodesEnum.failed:
			return code;
		default:
			throw new Error(`Unknown service status code "${code}"`);
	}
}
