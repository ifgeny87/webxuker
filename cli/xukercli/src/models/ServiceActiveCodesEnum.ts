export enum ServiceActiveCodesEnum {
	active = 'active',
	inactive = 'inactive',
	failed = 'failed',
}

export function readServiceActiveCode(code: string | ServiceActiveCodesEnum): ServiceActiveCodesEnum {
	switch (code) {
		case ServiceActiveCodesEnum.active:
		case ServiceActiveCodesEnum.inactive:
		case ServiceActiveCodesEnum.failed:
			return code;
		default:
			throw new Error(`Unknown service active code "${code}"`);
	}
}
