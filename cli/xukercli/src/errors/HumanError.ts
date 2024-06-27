export class HumanError extends Error {
	get name(): string {
		return HumanError.name;
	}
}
