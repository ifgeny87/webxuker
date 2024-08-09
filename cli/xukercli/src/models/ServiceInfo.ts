import { z } from 'zod';

export const ServiceInfoSchema = z.object({
	name: z.string(),
	unitName: z.string(),
	configurationPath: z.string(),
	createdAt: z.string().transform(s => new Date(s)),
}).strict();

export type ServiceInfo = z.infer<typeof ServiceInfoSchema>;
