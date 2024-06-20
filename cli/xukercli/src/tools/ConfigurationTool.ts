import * as fs from 'fs';
import { readConfig, writeConfig, AppConfiguration } from '../models/index.js';

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

	getInstallationPath(): string | undefined {
		return this.config.installationPath;
	}

	setInstallationPath(value: string): this {
		if (!value) {
			throw new Error('Value "installationPath" must be not empty');
		}
		this.config.installationPath = value;
		this.save();
		return this;
	}

	setInstallationDate(value: Date): this {
		this.config.installationDate = value.toISOString();
		this.save();
		return this;
	}

	setUninstallationDate(value: Date): this {
		this.config.uninstallationDate = value.toISOString();
		this.save();
		return this;
	}

	// сохранение выполняется по таймеру, чтобы была возможность записать несколько параметров
	private save(): void {
		clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(() => {
			writeConfig(this.CONFIG_FILE, this.config);
		}, 1000);
	}
}
