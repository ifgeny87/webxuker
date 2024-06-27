import { z } from 'zod';

export const ApplicationInfoSchema = z.object({
	installationPath: z.string(),
	installDate: z.string().transform(s => new Date(s)),
	uninstallDate: z.string().transform(s => new Date(s)).optional(),
});

export type ApplicationInfo = z.infer<typeof ApplicationInfoSchema>;
