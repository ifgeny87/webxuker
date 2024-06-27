import { z } from 'zod';

export const ServiceInfoSchema = z.object({
	name: z.string(),
	unit: z.string(),
	configurationPath: z.string(),
	createdAt: z.string().transform(s => new Date(s)),
});

export type ServiceInfo = z.infer<typeof ServiceInfoSchema>;
