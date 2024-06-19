import 'source-map-support/register';
import Logger from 'bunyan';
import fs from 'fs';
import path from 'path';
import { NodeError } from 'commonlib';
import { spawn } from 'child_process';
import Express, { Express as ExpressApp, Request, Response } from 'express';
import * as http from 'http';
import { Configuration, RepoConfig, RepoStageConfig, RepoStageVars } from '../configuration/index.js';

export class WebhookerService
{
	private readonly app: ExpressApp;
	private httpServer: http.Server | undefined;

	constructor(private readonly config: Configuration, private readonly logger: Logger) {
		this.app = this.initApp();
	}

	async start(): Promise<this> {
		const { host, port } = this.config.incoming;
		return await new Promise(resolve => {
			this.httpServer = this.app.listen(port, host, () => {
				this.logger.info(`Web-server listening on http://${host}:${port}`);
				resolve(this);
			});
		});
	}

	async stop(): Promise<void> {
		return await new Promise((resolve, reject) => {
			this.httpServer?.close(error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	private initApp(): ExpressApp {
		const app = Express();
		app.addListener('error', (error: Error) => {
			throw new NodeError(this, 'Express thrown an error', error);
		});
		// обработка команды "POST /webhook/deploy?repo=XXX&stage=YYY"
		app.post('/webhook/deploy', this.onDeployHandle);
		return app;
	}

	private onDeployHandle = async (req: Request, res: Response): Promise<void> => {
		const { repo, stage } = req.query;
		if (typeof repo !== 'string' || typeof stage !== 'string') {
			res.status(400);
			res.send({ error: 'Указанный repo или stage не описан в конфиге' });
			return;
		}
		const repoConfig: RepoConfig = this.config.repositories[repo];
		if (!repoConfig) {
			res.status(400);
			res.send({ error: 'Указанный repo не описан в конфиге' });
			return;
		}
		const stageConfig: RepoStageConfig = repoConfig.stages[stage];
		if (!stageConfig) {
			res.status(400);
			res.send({ error: 'Указанный stage не описан в конфиге' });
			return;
		}
		if (!fs.existsSync(repoConfig.template)) {
			res.status(500);
			res.send({ error: 'Шаблон для указанной конфигурации не существует' });
			return;
		}
		const template = repoConfig.template && fs.readFileSync(repoConfig.template).toString('utf-8');
		if (!template) {
			res.status(400);
			res.send({ error: 'Указанный файл template не существует' });
			return;
		}
		this.logger.info(`Deploying repo="${repo}" и stage="${stage}"...`);
		const start = Date.now();
		await this.deploy(stageConfig, template)
			.then(() => {
				res.status(200);
				res.send({
					ok: true,
					time: new Date().toUTCString(),
					timeSpent: (Date.now() - start) / 1000,
				});
			})
			.catch(error => {
				this.logger.error(new NodeError(this, 'Deploying error', error));
				res.status(500);
				return res.send({
					error: 'Ошибка во время деплоя',
					time: new Date().toUTCString(),
					timeSpent: (Date.now() - start) / 1000,
				});
			});
	}

	// команда на деплой
	private async deploy(stageConfig: RepoStageConfig, template: string): Promise<void> {
		// составляем файл docker-compose.yml по шаблону
		// для каждой ветки своя папка
		if (!stageConfig.workDir) {
			throw new NodeError(this, `В конфиге не описан workDir`);
		}
		if (!fs.existsSync(stageConfig.workDir)) {
			fs.mkdirSync(stageConfig.workDir);
			if (!fs.existsSync(stageConfig.workDir)) {
				throw new NodeError(this, `Не удалось создать папку для проекта "${stageConfig.workDir}"`);
			}
		}
		const dockerFile = this.generateDockerComposeConfig(stageConfig.variables, template);
		const fn = path.join(stageConfig.workDir, 'docker-compose.yml');
		fs.writeFileSync(fn, dockerFile, { encoding: 'utf-8' });
		if (!fs.existsSync(fn)) {
			throw new NodeError(this, `Файл docker-compose.yml вроде создали, но его нет по пути "${fn}"`);
		}
		const projectPath = path.resolve(__dirname, stageConfig.workDir);
		// выполняем `docker login` для сервисов
		await runChild(
			'docker',
			[
				'login',
				`-u=${this.config.dockerRegistry.username}`,
				`-p=${this.config.dockerRegistry.password}`,
				this.config.dockerRegistry.host,
			],
			projectPath,
			this.logger,
		)
			.then(code => {
				if (code) {
					throw new NodeError(this, `Command "docker login" exited with code ${code}. See detailed logs above`);
				}
			});
		// выполняем `docker-compose pull`
		await runChild('docker-compose', ['pull', '--quiet'], projectPath, this.logger)
			.then(code => {
				if (code) {
					throw new NodeError(this, `Command "docker-compose pull" exited with code ${code}. See detailed logs above`);
				}
			});
		// чтобы пересоздать и запустить сервисы, для которых подъехали новые образы, достаточно
		// закпустить `docker-compose up --no-start`
		await runChild('docker-compose', ['up', '--no-start'], projectPath, this.logger)
			.then(code => {
				if (code) {
					throw new NodeError(this, `Command "docker-compose up" exited with code ${code}. See detailed logs above`);
				}
			});
		// если нужно скопировать файлы в контейнер, выполняем `docker cp`
		if (stageConfig.copyBeforeStart?.length) {
			for (const { from, to } of stageConfig.copyBeforeStart) {
				this.logger.info(`Copying from "${from}" to "${to}"...`);
				await runChild('docker', ['cp', from, to], projectPath, this.logger)
					.then(code => {
						if (code) {
							throw new NodeError(this, `Command "docker cp" exited with code ${code}. See detailed logs above`);
						}
					});
			}
		}
		// стартуем контейнеры с `docker-compose start`
		await runChild('docker-compose', ['start'], projectPath, this.logger)
			.then(code => {
				if (code) {
					throw new NodeError(this, `Command "docker-compose start" exited with code ${code}. See detailed logs above`);
				}
			});
		this.logger.info('Deploying finished');
	}

	// генерирует файлик docker-compose.yml
	private generateDockerComposeConfig(variables: RepoStageVars | undefined, template: string): string {
		const config = template.replace(/{{2}([^}]+)}{2}/gim, (_, rawKey: string): string => {
			const key = rawKey.trim();
			if (variables?.[key] === undefined)
				throw new NodeError(this, `В наборе variables не найден параметр '${key}'`);
			return variables[key].toString();
		});
		return [
			'# (( ВНИМАНИЕ )) ЭТОТ ФАЙЛ СГЕНЕРИРОВАН АВТОМАТИЧЕСКИ',
			`# ВРЕМЯ ГЕНЕРАЦИИ: ${new Date()}`,
			'# ИЗМЕНЕНИЯ, ВНЕСЕННЫЕ РУКАМИ, БУДУТ ПЕРЕЗАПИСАНЫ',
		].join('\n') + '\n\n' + config;
	}
}

async function runChild(cmd: string, args: string[], cwd: string, baseLogger: Logger): Promise<number> {
	return new Promise((resolve, reject) => {
		const ps = spawn(cmd, args, { cwd });
		const logger = baseLogger.child({ spawnPid: ps.pid });
		logger.info(`Spawn pid ${ps.pid} for "${cmd}"`);
		ps.stdout.on('data', (chunk: Buffer) => logger.info(chunk.toString()));
		ps.stderr.on('data', (chunk: Buffer) => logger.error(chunk.toString()));
		ps.on('close', (code: number) => {
			logger.info(`Process exited with code ${code}`);
			resolve(code);
		});
		ps.on('error', (error: Error) => {
			logger.error(new NodeError(runChild, `Process exited with error`, error));
			reject(error);
		});
	});
}
