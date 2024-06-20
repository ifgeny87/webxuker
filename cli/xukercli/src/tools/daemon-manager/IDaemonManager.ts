import { SystemctlDaemonManager } from './SystemctlDaemonManager.js';

export enum DaemonStatusCodesEnum
{
	started = 'started',
	stopped = 'stopped',
}

export interface IDaemonStatus
{
	name: string;
	status: DaemonStatusCodesEnum;
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
	abstract getStatus(name: string): Promise<IDaemonStatus>;

	abstract create(options: ICreateDaemonOptions): Promise<void>;

	abstract deleteByName(name: string): Promise<void>;

	abstract startByName(name: string): Promise<void>;

	abstract stopByName(name: string): Promise<void>;
}
