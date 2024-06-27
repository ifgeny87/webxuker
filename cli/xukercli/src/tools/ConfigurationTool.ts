import * as fs from 'fs';
import {
	readConfig,
	writeConfig,
	AppConfiguration,
	ApplicationInfo,
	ServiceInfo,
} from '../models/index.js';

/**
 * Конфигуратор приложения.
 * Singleton.
 * Сохранение выполняется при изменении любого из параметров конфигурации.
 * Сохранение выполняется с задержкой, чтобы иметь возможность изменить несколько параметров.
 */
export class ConfigurationTool
{
	private static instance: ConfigurationTool;

	readonly REPO = 'ifgeny87/webxuker'; // репозиторий в github
	readonly CONFIG_DIR = '/etc/xukercli'; // папка с файлами конфигураций CLI
	readonly CONFIG_FILE = this.CONFIG_DIR + '/config.json'; // основоной файл конфигурации CLI
	readonly BIN_PATH = '/usr/local/bin/webxuker'; // путь для ссылки на скрипт запуска

	private saveTimeout: NodeJS.Timeout | undefined;
	private readonly config: AppConfiguration;

	private constructor() {
		// check for config path
		if (!fs.existsSync(this.CONFIG_DIR)) {
			fs.mkdirSync(this.CONFIG_DIR);
		}
		// read config
		this.config = readConfig(this.CONFIG_FILE);
	}

	static getInstance(): ConfigurationTool {
		if (!ConfigurationTool.instance) {
			ConfigurationTool.instance = new ConfigurationTool();
		}
		return ConfigurationTool.instance;
	}

	getApplicationInfo(): ApplicationInfo | undefined {
		return this.config.application;
	}

	setApplicationInfo(value: ApplicationInfo): this {
		this.config.application = value;
		this.save();
		return this;
	}

	getServicesInfo(): ServiceInfo[] | undefined {
		return this.config.services;
	}

	setServicesInfo(value: ServiceInfo[] | undefined): this {
		this.config.services = value;
		this.save();
		return this;
	}

	getServiceInfoByName(name: string): ServiceInfo | undefined {
		const services = this.getServicesInfo();
		if (!services?.length) return undefined;
		return services.find(s => s.name === name);
	}

	// сохранение выполняется по таймеру, чтобы была возможность записать несколько параметров
	private save(): void {
		clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(() => {
			writeConfig(this.CONFIG_FILE, this.config);
		}, 1000);
	}
}
