export function objectToSearchParams(obj: object): string {
	const params = new URLSearchParams();
	Object.entries(obj).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach(val => params.append(key, val));
		} else if (['string', 'number', 'boolean'].includes(typeof value)) {
			params.append(key, String(value));
		}
	});
	return params.toString();
}
