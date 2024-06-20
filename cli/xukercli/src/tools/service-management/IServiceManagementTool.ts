export interface INewService
{
	name: string;
	configurationPath: string;
}

export enum ServiceStatusCodesEnum {
	stopped = 'stopped',
	started = 'started',
}

export interface IExistService extends INewService {
	status: ServiceStatusCodesEnum;
}

export abstract class IServiceManagementTool
{
	/**
	 * Возвращает список настроенных сервисов.
	 */
	async getServiceList(): Promise<INewService[]> {
		return Promise.resolve([
			{
				name: 'climat-check',
				configurationPath: '/user/bin/config/casandra.json',
			},
		]);
	}

	/**
	 * Возвращает статус сервиса по имени.
	 * Если сервис не настроен, то вернет undefined.
	 */
	async getServiceStatusByName(serviceName: string): Promise<IExistService | undefined> {
		return {
			name: serviceName,
			configurationPath: '/lala',
			status: ServiceStatusCodesEnum.stopped,
		}
	}

	/**
	 * Проверяет существование сервиса и настроит новый сервис.
	 * Бросит ошибку если сервис уже настроен.
	 */
	async addService(service: INewService): Promise<void> {
		const serviceStatus = await this.getServiceStatusByName(service.name);
		if (serviceStatus) {
			throw new Error(`Cannot add new service "${service.name}" because it already configured.
You can check it with command "xuker service status '${service.name}'".`);
		}
		// TODO проверить имя сервиса
		await this.createNewService(service);
	}

	/**
	 * Удаляет указанный сервис.
	 * Бросит ошибку если указанный сервис не настроен.
	 */
	async deleteServiceByName(serviceName: string): Promise<void> {
		const serviceStatus = await this.getServiceStatusByName(serviceName);
		if (!serviceStatus) {
			throw new Error(`Cannot delete service "${serviceName}" because it does not configured yet.
You can configure it with command "xuker service add '${serviceName}' --help".`);
		}
		if (serviceStatus.status !== ServiceStatusCodesEnum.stopped) {
			throw new Error(`Cannot delete service "${serviceName}" because it already started.
You can check it with command "xuker service status '${serviceName}'".
You can stop it with command "xuker service stop '${serviceName}'".`);
		}
		await this.deleteExistService(serviceStatus);
	}

	/**
	 * Стартует указанный сервис.
	 * Бросит ошибку если указанный сервис не настроен.
	 * Бросит ошибку если сервис уже запущен.
	 */
	async startServiceByName(serviceName: string): Promise<void> {
		const serviceStatus = await this.getServiceStatusByName(serviceName);
		if (!serviceStatus) {
			throw new Error(`Cannot start service "${serviceName}" because it does not configured yet.
You can configure it with command "xuker service add '${serviceName}' --help".`);
		}
		if (serviceStatus.status === ServiceStatusCodesEnum.started) {
			throw new Error(`Cannot start service "${serviceName}" because it already started.
You can check it with command "xuker service status '${serviceName}'".`);
		}
		await this.startExistService(serviceStatus);
	}

	/**
	 * Останавливает указанный сервис.
	 * Бросит ошибку если указанный сервис не настроен.
	 * Бросит ошибку если сервис уже остановлен.
	 */
	async stopServiceByName(serviceName: string): Promise<void> {
		const serviceStatus = await this.getServiceStatusByName(serviceName);
		if (!serviceStatus) {
			throw new Error(`Cannot stop service "${serviceName}" because it does not configured yet.
You can configure it with command "xuker service add '${serviceName}' --help".`);
		}
		if (serviceStatus.status === ServiceStatusCodesEnum.started) {
			throw new Error(`Cannot stop service "${serviceName}" because it already stopped.
You can check it with command "xuker service status '${serviceName}'".`);
		}
		await this.stopExistService(serviceStatus);
	}

	protected abstract createNewService(service: INewService): Promise<void>;

	abstract deleteExistService(service: IExistService): Promise<void>;

	abstract startExistService(service: IExistService): Promise<void>;

	abstract stopExistService(service: IExistService): Promise<void>;
}
