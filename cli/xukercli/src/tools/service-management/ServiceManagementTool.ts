import { IServiceManagementTool, IExistService, INewService } from './IServiceManagementTool.js';
import { getDaemonManager } from '../daemon-manager/index.js';

export class ServiceManagementTool extends IServiceManagementTool
{
	private readonly daemonManager = getDaemonManager();

	/**
	 * Удаляет существующий сервис.
	 * В этом методе мы уверены, что сервис существует и остановлен.
	 */
	override async deleteExistService(service: IExistService): Promise<void> {
		await this.daemonManager.deleteByName(service.name);
	}

	/**
	 * Стартует существующий сервис.
	 * В этом методе мы уверены, что сервис существует и остановлен.
	 */
	override async startExistService(service: IExistService): Promise<void> {
		await this.daemonManager.startByName(service.name);
	}

	/**
	 * Останавливает существующий сервис.
	 * В этом методе мы уверены, что сервис существует и запущен.
	 */
	override async stopExistService(service: IExistService): Promise<void> {
		await this.daemonManager.stopByName(service.name);
	}

	/**
	 * Создает новый сервис.
	 * В этом методе мы уверены, что сервис еще не существует.
	 */
	protected override async createNewService(service: INewService): Promise<void> {
		throw new Error('TODO createNewService');
	}

}
