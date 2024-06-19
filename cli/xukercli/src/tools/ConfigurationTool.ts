import * as fs from 'fs';
import { readConfig, writeConfig, AppConfiguration } from '../models/index.js';

const CONFIG_DIR = '/etc/xukercli';
const CONFIG_FILE = CONFIG_DIR + '/config.json';

export class ConfigurationTool
{
	private readonly config: AppConfiguration;

	constructor() {
		// check for config path
		if (!fs.existsSync(CONFIG_DIR)) {
			fs.mkdirSync(CONFIG_DIR);
		}
		// read config
		this.config = readConfig(CONFIG_FILE);
	}

	setInstallationPath(value: string): void {
		this.config.installationPath = value;
		this.save();
	}

	private save(): void {
		writeConfig(CONFIG_FILE, this.config);
	}
}
