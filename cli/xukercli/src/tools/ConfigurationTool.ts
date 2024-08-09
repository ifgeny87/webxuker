import * as fs from 'fs';
import {
	readConfig,
	writeConfig,
	AppConfiguration,
	ApplicationInfo,
	ServiceInfo,
} from '../models/index.js';
import { getCurrentMachine, MachineCodesEnum, CLIConfigurationError } from '../helpers/index.js';

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
	readonly BIN_NAME = 'xukercli';
	readonly WEB_BIN_NAME = 'webxuker';
	readonly WEB_BIN_PATH = `/usr/local/bin/${this.WEB_BIN_NAME}`; // путь для ссылки на скрипт запуска
	readonly CONFIG_DIR: string;
	readonly CONFIG_FILE: string;

	private readonly config!: AppConfiguration;
	private saveTimeout: NodeJS.Timeout | undefined;

	private constructor() {
		const machine = getCurrentMachine();
		if (machine === MachineCodesEnum.linux) {
			this.CONFIG_DIR = `/etc/${this.BIN_NAME}`;
		} else if (machine === MachineCodesEnum.darwin) {
			this.CONFIG_DIR = `${process.env.HOME}/Library/Preferences/${this.BIN_NAME}`;
		} else {
			throw new CLIConfigurationError(`Cannot detect machine`);
		}
		this.CONFIG_FILE = `${this.CONFIG_DIR}/config.json`;
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

	toDto(): object {
		return {
			REPO: this.REPO,
			BIN_NAME: this.BIN_NAME,
			WEB_BIN_NAME: this.WEB_BIN_NAME,
			WEB_BIN_PATH: this.WEB_BIN_PATH,
			CONFIG_DIR: this.CONFIG_DIR,
			CONFIG_FILE: this.CONFIG_FILE,
			config: this.config,
		};
	}

	// сохранение выполняется по таймеру, чтобы была возможность записать несколько параметров
	private save(): void {
		// check for config path
		if (!fs.existsSync(this.CONFIG_DIR)) {
			fs.mkdirSync(this.CONFIG_DIR);
		}
		clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(() => {
			writeConfig(this.CONFIG_FILE, this.config);
		}, 1000);
	}
}
