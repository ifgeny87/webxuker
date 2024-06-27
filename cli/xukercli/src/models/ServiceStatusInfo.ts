import { z } from 'zod';
import { ServiceInfoSchema } from './ServiceInfo.js';
import { ServiceActiveCodesEnum } from './ServiceActiveCodesEnum.js';
import { ServiceStatusCodesEnum } from './ServiceStatusCodesEnum.js';

export const ServiceStatusInfoSchema = ServiceInfoSchema.merge(z.object({
	active: z.nativeEnum(ServiceActiveCodesEnum),
	status: z.nativeEnum(ServiceStatusCodesEnum),
}));

export type ServiceStatusInfo = z.infer<typeof ServiceStatusInfoSchema>;
