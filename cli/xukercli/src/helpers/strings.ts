const serviceNameRegExp = /^[a-z][a-z\d-_]*[a-z\d]$/;

/**
 * Проверяет имя сервиса.
 * Имя может содержать маленькие английские буквы, цифры, дефис и знак подчеркивания.
 * Имя должно иметь длину не менее 2 символов.
 * Имя должно начинаться на букву.
 * Имя не должно заканчиваться на дефис.
 * Бросает ошибку если имя не соответствует regexp.
 */
export function validateServiceName(name: string): void {
	if (!serviceNameRegExp.test(name)) {
		throw new Error(`Service name "${name}" must match regular expression "${serviceNameRegExp}".
Good names: svc, svc1, svc-a1, svc_1.
Bad names: Svc, svc-, svc_, 1svc.`);
	}
}
