import { IServiceManagementTool, IExistService, INewService } from './IServiceManagementTool.js';

export class ServiceManagementTool extends IServiceManagementTool
{
	/**
	 * Создает новый сервис.
	 * В этом методе мы точно знаем, что сервис не существует.
	 */
	protected override async createNewService(service: INewService): Promise<void> {
		throw new Error('TODO 1');
	}

	/**
	 * Удаляет уже сущесвтующий сервис.
	 */
	override async deleteExistService(service: IExistService): Promise<void> {
		throw new Error('TODO 2');
	}

	/**
	 * Стартует указанный сервис.
	 */
	override async startExistService(service: IExistService): Promise<void> {
		throw new Error('TODO 3');
	}

	/**
	 * Останавливает указанный сервис.
	 */
	override async stopExistService(service: IExistService): Promise<void> {
		throw new Error('TODO 4');
	}

}
