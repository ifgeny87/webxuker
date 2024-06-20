import { z } from 'zod';
import * as fs from 'fs';

export const AppConfigurationSchema = z.object({
	installationPath: z.string().optional(),
	installationDate: z.string().optional(),
	uninstallationDate: z.string().optional(),
});

export type AppConfiguration = z.infer<typeof AppConfigurationSchema>;

export function readConfig(filePath: string): AppConfiguration {
	const exists = fs.existsSync(filePath);
	if (!exists) return {};
	const content = JSON.parse(fs.readFileSync(filePath).toString());
	return AppConfigurationSchema.parse(content);
}

export function writeConfig(filePath: string, config: AppConfiguration): void {
	fs.writeFileSync(filePath, JSON.stringify(config, null, '\t'));
}
