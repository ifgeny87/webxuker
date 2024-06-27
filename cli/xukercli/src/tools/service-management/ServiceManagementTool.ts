import * as fs from 'fs';
import * as path from 'path';
import { IServiceManagementTool } from './IServiceManagementTool.js';
import { ServiceInfo, ServiceStatusInfo } from '../../models/index.js';
import { HumanError } from '../../errors/index.js';

export class ServiceManagementTool extends IServiceManagementTool
{
	/**
	 * Создает новый сервис.
	 * В этом методе мы уверены, что сервис еще не существует.
	 */
	protected override async createNewService(service: ServiceStatusInfo): Promise<void> {
		const applicationInfo = this.configTool.getApplicationInfo();
		if (!applicationInfo) {
			throw new HumanError(`Webxuker Application does not installed.
You can install it with command "xuker install".`);
		}
		const execStart = `/usr/bin/sh -c 'node ${applicationInfo.installationPath}/package/webxuker.js --cfg=${service.configurationPath}'`;
		const services: ServiceInfo[] = this.configTool.getServicesInfo() || [];
		services.push(service);
		await createNewServiceElement(
			service.unit,
			{
				unit: {
					description: `Webxuker application (${service.configurationPath})`,
					after: 'network.target',
				},
				service: {
					type: 'simple',
					user: 'root',
					execStart,
					restart: 'on-failure',
				},
				install: {
					wantedBy: 'multi-user.target',
				},
			},
		);
		this.configTool.setServicesInfo(services); // обновляем конфиг
		await this.daemonManager.refresh();
		await this.daemonManager.enable(service.unit);
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

interface ICreateNewServiceElementOptions
{
	unit: {
		description: string;
		after: string;
	},
	service: {
		type: string;
		user: string;
		execStart: string;
		restart: string;
	},
	install: {
		wantedBy: string;
	},
}

async function createNewServiceElement(unit: string, options: ICreateNewServiceElementOptions): Promise<void> {
	const targetPath = path.resolve('/lib/systemd/system', unit);
	if (fs.existsSync(targetPath)) {
		throw new Error(`Target file "${targetPath}" already exists`);
	}
	const content = `# Webxuker Application Service
#
# Author: ifgeny87
# Service create date: ${new Date().toISOString()}
# Homepage: https://github.com/ifgeny87/webxuker/tree/master/cli/xukercli#readme
#
# This file generate automatically with xuker CLI tool
#
# Doc of this file: https://gist.github.com/maliarslan/a50c5f335a18ebb31068663cabec98af
# After=network.target means our service will start after the network is up and running
# Type=simple specify that how our app launch itself. Simple means it won't drop user priviliges
# User=username tells that our app will run as the unprivileged user unless you want to run it by root
# ExecStart=/usr/bin/node /home/username/mygreatestapp/mygreatestapp.js tells systemd the location of our app and what command it should run
# Restart=on-failure clearly says under what condition system restart our service. But if you stop the service it won't restart itself.
# WantedBy=multi-user.target specify how our service should be enabled
#
# Steps:
# 1) Place it file to /lib/systemd/system/ with root
# 2) Update services: systemctl daemon-reload
# 3) Run: systemctl start|status|stop ${unit}
#
# Setup autorun on startup:
# systemctl enable|disable ${unit}

[Unit]
Description=${options.unit.description}
After=${options.unit.after}

[Service]
Type=${options.service.type}
User=${options.service.user}
ExecStart=${options.service.execStart}
Restart=${options.service.restart}

[Install]
WantedBy=${options.install.wantedBy}`;
	try {
		fs.writeFileSync(targetPath, content);
	} catch (error) {
		throw new Error(`Cannot save target file "${targetPath}": ${error}`)
	}
}
