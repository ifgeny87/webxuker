import { z } from 'zod';
import * as fs from 'fs';
import { ServiceInfoSchema } from './ServiceInfo.js';
import { ApplicationInfoSchema } from './ApplicationInfo.js';

export const AppConfigurationSchema = z.object({
	application: ApplicationInfoSchema.optional(),
	services: z.array(ServiceInfoSchema).optional(),
}).strict();

export type AppConfiguration = z.infer<typeof AppConfigurationSchema>;

export function readConfig(filePath: string): AppConfiguration {
	const exists = fs.existsSync(filePath);
	if (!exists) return {};
	const content = JSON.parse(fs.readFileSync(filePath).toString());
	const x = AppConfigurationSchema.parse(content);
	return x;
}

export function writeConfig(filePath: string, config: AppConfiguration): void {
	fs.writeFileSync(filePath, JSON.stringify(config, null, '\t'));
}
