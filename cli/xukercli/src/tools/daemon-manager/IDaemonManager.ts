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
	abstract list(): Promise<IDaemonStatus[]>;

	abstract refresh(): Promise<void>;

	abstract enable(unit: string): Promise<void>;

	abstract disable(unit: string): Promise<void>;

	abstract start(unit: string): Promise<void>;

	abstract restart(unit: string): Promise<void>;

	abstract stop(unit: string): Promise<void>;
}
