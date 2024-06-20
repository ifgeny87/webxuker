import { IDaemonManager, IDaemonStatus, ICreateDaemonOptions } from './IDaemonManager.js';

/**
 * Менеджер выполняет платформозависимое обслуживание демонов под управлением systemctl.
 * OS: Ubuntu.
 */
export class SystemctlDaemonManager extends IDaemonManager
{
	override getStatus(name: string): Promise<IDaemonStatus> {
		throw new Error('TODO getStatus');
	}

	override create(options: ICreateDaemonOptions): Promise<void> {
		throw new Error('TODO create');
	}

	override deleteByName(name: string): Promise<void> {
		throw new Error('TODO deleteByName');
	}

	override startByName(name: string): Promise<void> {
		throw new Error('TODO startByName');
	}

	override stopByName(name: string): Promise<void> {
		throw new Error('TODO stopByName');
	}
}
