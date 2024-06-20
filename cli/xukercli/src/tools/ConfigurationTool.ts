import * as fs from 'fs';
import { readConfig, writeConfig, AppConfiguration } from '../models/index.js';

export class ConfigurationTool
{
	readonly CONFIG_DIR = '/etc/xukercli';
	readonly CONFIG_FILE = this.CONFIG_DIR + '/config.json';

	private static instance: ConfigurationTool;

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

	get installationPath(): string | undefined {
		return this.config.installationPath;
	}

	set installationPath(value: string | undefined) {
		if (!value) {
			throw new Error('Value "installationPath" must be not empty');
		}
		this.config.installationPath = value;
		this.save();
	}

	set installationDate(value: Date) {
		this.config.installationDate = value.toISOString();
		this.save();
	}

	static getInstance(): ConfigurationTool {
		if (!ConfigurationTool.instance) {
			ConfigurationTool.instance = new ConfigurationTool();
		}
		return ConfigurationTool.instance;
	}

	// сохранение выполняется по таймеру, чтобы была возможность записать несколько параметров
	private save(): void {
		clearTimeout(this.saveTimeout);
		this.saveTimeout = setTimeout(() => {
			writeConfig(this.CONFIG_FILE, this.config);
		}, 1000);
	}
}
