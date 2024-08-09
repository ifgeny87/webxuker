export interface ICreateNewServiceOptions {
	unitName: string;
	group?: string;
	title: string;
	description: string;
	cmd: string;
	args?: string[];
	env?: string[];
}

export interface IDaemonStatus
{
	unit: string;
	load: string;
	active: string;
	sub: string;
}

export interface ICreateDaemonOptions
{

}

/**
 * Менеджер выполняет платформозависимое обслуживание демонов.
 * Singleton.
 */
export abstract class IDaemonManager
{
	abstract createNewServiceElement(options: ICreateNewServiceOptions): Promise<string>;

	abstract list(): Promise<IDaemonStatus[]>;

	abstract refresh(): Promise<void>;

	abstract enable(unit: string): Promise<void>;

	abstract disable(unit: string): Promise<void>;

	abstract start(unit: string): Promise<void>;

	abstract restart(unit: string): Promise<void>;

	abstract stop(unit: string): Promise<void>;
}
