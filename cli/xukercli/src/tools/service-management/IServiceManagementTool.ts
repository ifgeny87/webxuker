import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationTool } from '../ConfigurationTool.js';
import {
	ServiceInfo,
	ServiceStatusInfo,
	ServiceStatusCodesEnum,
	readServiceStatusCode,
	readServiceActiveCode,
} from '../../models/index.js';
import { getDaemonManager } from '../daemon-manager/index.js';
import { validateServiceName } from '../../helpers/index.js';
import { HumanError } from '../../errors/index.js';

export interface IAddServiceOptions
{
	name: string;
	configurationPath: string;
}

export abstract class IServiceManagementTool
{
	protected readonly configTool = ConfigurationTool.getInstance();
	protected readonly daemonManager = getDaemonManager();

	/**
	 * Возвращает список настроенных сервисов со статусами.
	 */
	async getServiceStatusesList(): Promise<ServiceStatusInfo[] | undefined> {
		const services = this.configTool.getServicesInfo();
		if (!services?.length) return;
		const result: ServiceStatusInfo[]  = [];
		const statuses = await this.daemonManager.list();
		statuses.forEach(status => {
			const service = services.find(s => s.unit === status.unit);
			if (service) {
				result.push({
					name: service.name,
					unit: service.unit,
					configurationPath: service.configurationPath,
					createdAt: service.createdAt,
					active: readServiceActiveCode(status.active),
					status: readServiceStatusCode(status.sub),
				});
			}
		});
		return result;
	}

	/**
	 * Возвращает статус сервиса по имени.
	 * Если сервис не настроен, то вернет undefined.
	 */
	async getStatusByName(name: string): Promise<ServiceStatusInfo | undefined> {
		const service = this.configTool.getServiceInfoByName(name);
		if (!service) return;
		const servicesList = await this.daemonManager.list();
		const serviceInfo = servicesList.find(i => i.unit === service.unit);
		if (!serviceInfo) {
			throw new Error(`Service "${name}" configured but not installed on system daemons`);
		}
		return {
			name: service.name,
			unit: service.unit,
			configurationPath: service.configurationPath,
			createdAt: service.createdAt,
			active: readServiceActiveCode(serviceInfo.active),
			status: readServiceStatusCode(serviceInfo.sub),
		};
	}

	/**
	 * Проверяет существование сервиса и настроит новый сервис.
	 * Бросит ошибку если сервис уже настроен.
	 */
	async addNewService(options: IAddServiceOptions): Promise<void> {
		validateServiceName(options.name);
		const service = this.configTool.getServiceInfoByName(options.name);
		if (service) {
			throw new Error(`Cannot add new service "${options.name}" because it already configured.
You can check it with command "xuker service status '${options.name}'".`);
		}
		await this.createNewService({
			name: options.name,
			unit: `${options.name}.service`,
			configurationPath: options.configurationPath,
			createdAt: new Date(),
		});
	}

	/**
	 * Удаляет указанный сервис.
	 * Бросит ошибку если указанный сервис не настроен.
	 */
	async deleteServiceByName(name: string): Promise<void> {
		const service = this.configTool.getServiceInfoByName(name);
		if (!service) {
			throw new HumanError(`Cannot delete service "${name}" because it does not configured yet.
You can configure it with command "xuker service add '${name}' --help".`);
		}
		const status = await this.getStatusByName(name);
		if (!status) {
			throw new HumanError(`Cannot delete service "${name}" because it does not installed as service.
It looks like someone deleted a service file from the service directory. You need check service file and delete service configuration from CLI configuration file.
You can print configuration file with command "xuker config".`);
		}
		if (status.status === ServiceStatusCodesEnum.running) {
			throw new HumanError(`Cannot delete service "${name}" because it already started.
You can check it with command "xuker service status '${name}'".
You can stop it with command "xuker service stop '${name}'".`);
		}
		await this.deleteExistService(status);
	}

	/**
	 * Стартует указанный сервис.
	 * Бросит ошибку если указанный сервис не настроен.
	 * Бросит ошибку если сервис уже запущен.
	 */
	async startByName(name: string): Promise<void> {
		const status = await this.getStatusByName(name);
		if (!status) {
			throw new Error(`Cannot start service "${name}" because it does not configured yet.
You can configure it with command "xuker service add '${name}' --help".`);
		}
		if (status.status === ServiceStatusCodesEnum.running) {
			throw new Error(`Cannot start service "${name}" because it already started.
You can check it with command "xuker service status '${name}'".`);
		}
		await this.startExistService(status);
	}

	/**
	 * Останавливает указанный сервис.
	 * Бросит ошибку если указанный сервис не настроен.
	 * Бросит ошибку если сервис уже остановлен.
	 */
	async stopByName(name: string): Promise<void> {
		const status = await this.getStatusByName(name);
		if (!status) {
			throw new Error(`Cannot stop service "${name}" because it does not configured yet.
You can configure it with command "xuker service add '${name}' --help".`);
		}
		if (status.status !== ServiceStatusCodesEnum.running) {
			throw new Error(`Cannot stop service "${name}" because it already stopped.
You can check it with command "xuker service status '${name}'".`);
		}
		await this.stopExistService(status);
	}

	/**
	 * Возвращает логи сервиса
	 */
	async getServiceLogs(name: string): Promise<string| undefined> {
		const service = this.configTool.getServiceInfoByName(name);
		if (!service) {
			throw new HumanError(`Cannot read logs for service "${name}" because it does not configured yet.
You can configure it with command "xuker service add '${name}' --help".`);
		}
		const logPath = path.resolve('/var/log/journal', `${service.unit}.log`);
		if (!fs.existsSync(logPath)) return;
		return fs.readFileSync(logPath).toString();
	}

	protected abstract createNewService(service: ServiceInfo): Promise<void>;

	protected abstract deleteExistService(service: ServiceStatusInfo): Promise<void>;

	protected abstract startExistService(service: ServiceStatusInfo): Promise<void>;

	protected abstract stopExistService(service: ServiceStatusInfo): Promise<void>;
}
