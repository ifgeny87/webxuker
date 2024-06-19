import { readConfig, writeConfig } from '../models/index.js';

const CONFIG_PATH = '~/.xukercli';

export class ConfigurationTool
{
	private readonly config = readConfig(CONFIG_PATH);

	setInstallationPath(value: string): void {
		this.config.installationPath = value;
		this.save();
	}

	private save(): void {
		writeConfig(CONFIG_PATH, this.config);
	}
}
