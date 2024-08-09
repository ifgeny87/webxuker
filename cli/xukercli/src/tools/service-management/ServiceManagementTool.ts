import * as fs from 'fs';
import * as path from 'path';
import { IServiceManagementTool } from './IServiceManagementTool.js';
import { ServiceInfo, ServiceStatusInfo } from '../../models/index.js';
import { HumanError, spawnChild, SpawnError } from '../../helpers/index.js';

export class ServiceManagementTool extends IServiceManagementTool
{
	/**
	 * Создает пустой файл конфигурации сервиса.
	 * Если папка под файл не существует, то она будет создана.
	 */
	override async createEmptyConfigFile(filePath: string): Promise<void> {
		const folderPath = path.dirname(path.resolve(filePath));
		if (!fs.existsSync(folderPath)) {
			const spawnResult = await spawnChild('mkdir', ['-p', folderPath]);
			if (spawnResult.exitCode) {
				throw new SpawnError(`Cannot create folder "${folderPath}"`, spawnResult);
			}
		}
		fs.writeFileSync(filePath, JSON.stringify({}));
	}

	/**
	 * Создает новый сервис.
	 * Метод уверен, что сервис еще не существует.
	 */
	protected override async createNewService(service: ServiceStatusInfo): Promise<void> {
		const applicationInfo = this.configTool.getApplicationInfo();
		if (!applicationInfo) {
			throw new HumanError(`Webxuker Application does not installed.
You can install it with command "xuker install".`);
		}
		const services: ServiceInfo[] = this.configTool.getServicesInfo() || [];
		services.push(service);
		const launchTargetPath = await this.daemonManager.createNewServiceElement({
			unitName: service.unit,
			// group: '',
			title: `Webxuker instance ${service.unit}`,
			description: `Webxuker application (${service.configurationPath})`,
			cmd: this.configTool.WEB_BIN_NAME,
			args: [`--cfg=${service.configurationPath}`],
			// env: [],
		});
		this.configTool.setServicesInfo(services); // обновляем конфиг
		await this.daemonManager.refresh();
	}

	/**
	 * Удаляет существующий сервис.
	 * В этом методе мы уверены, что сервис существует и остановлен.
	 */
	protected override async deleteExistService(service: ServiceStatusInfo): Promise<void> {
		const targetPath = path.resolve('/lib/systemd/system', service.unit);
		await this.daemonManager.disable(service.unit);
		fs.unlinkSync(targetPath);
		await this.daemonManager.refresh();
		// удаляем запись из конфигурации
		const services = (this.configTool.getServicesInfo() || [])
			.filter(s => s.unit !== service.unit);
		this.configTool.setServicesInfo(services.length ? services : undefined); // save config
	}

	/**
	 * Стартует существующий сервис.
	 * В этом методе мы уверены, что сервис существует и остановлен.
	 */
	protected override async startExistService(service: ServiceStatusInfo): Promise<void> {
		await this.daemonManager.start(service.name);
	}

	/**
	 * Останавливает существующий сервис.
	 * В этом методе мы уверены, что сервис существует и запущен.
	 */
	protected override async stopExistService(service: ServiceStatusInfo): Promise<void> {
		await this.daemonManager.stop(service.name);
	}
}
