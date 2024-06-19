import * as z from 'zod';

export const RepoStageVarsSchema = z.record(
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
	])
);

export type RepoStageVars = z.infer<typeof RepoStageVarsSchema>;

export const RepoStageConfigSchema = z.object({
	workDir: z.string(),
	variables: RepoStageVarsSchema.optional(),
	copyBeforeStart: z.array(z.object({
		from: z.string().min(1),
		to: z.string().min(1),
	})).optional(),
});

export type RepoStageConfig = z.infer<typeof RepoStageConfigSchema>;

export const RepoConfigSchema = z.object({
	template: z.string().min(1),
	stages: z.record(RepoStageConfigSchema),
});

export type RepoConfig = z.infer<typeof RepoConfigSchema>;

export const ConfigurationSchema = z.object({
	incoming: z.object({
		host: z.string(),
		port: z.number().int().min(1024).max(65535),
	}),
	dockerRegistry: z.object({
		host: z.string().regex(/[\w.:]+/),
		username: z.string().min(1),
		password: z.string().min(1),
	}),
	repositories: z.record(RepoConfigSchema),
}).strict();

export type Configuration = z.infer<typeof ConfigurationSchema>;
