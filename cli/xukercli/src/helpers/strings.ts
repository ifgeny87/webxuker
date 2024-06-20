/**
 * Проверяет имя сервиса.
 * Имя может содержать маленькие английские буквы, цифры, дефис и знак подчеркивания.
 * Имя должно иметь длину не менее 2 символов.
 * Имя должно начинаться на букву.
 * Имя не должно заканчиваться на дефис.
 * Бросает ошибку если имя не соответствует regexp.
 */
export function validateServiceName(name: string): void {
	if (!/^[a-z][a-z\d-_]*[a-z\d]$/.test(name)) {
		throw new Error(`Service name "${name}" must match regular expression "/^[a-z][a-z\\d-_]*[a-z\\d]$/".
Good: svc, svc1, svc-a1, svc_1.
Bad: Svc, svc-, svc_, 1svc.`);
	}
}
