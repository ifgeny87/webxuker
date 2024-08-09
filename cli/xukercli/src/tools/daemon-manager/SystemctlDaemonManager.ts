import fs from 'fs';
import path from 'path';
import { IDaemonManager, IDaemonStatus, ICreateNewServiceOptions } from './IDaemonManager.js';
import { spawnChild, SpawnError } from '../../helpers/index.js';

/**
 * Менеджер выполняет платформозависимое обслуживание демонов под управлением systemctl.
 * OS: linux-подобные - Debian, Ubuntu.
 */
export class SystemctlDaemonManager extends IDaemonManager
{
	private readonly toolcmd = 'systemctl';

	/**
	 * Создает новый конфиг демона для запуска сервиса.
	 * Вернет путь к файлу конфигурации демона.
	 */
	override async createNewServiceElement(options: ICreateNewServiceOptions): Promise<string> {
		const svcFileName = `${options.unitName}.service`;
		const targetPath = path.resolve('/lib/systemd/system', svcFileName);
		if (fs.existsSync(targetPath)) {
			throw new Error(`Target file "${targetPath}" already exists`);
		}
		const content = `# Webxuker Application Service
#
# Author: ifgeny87
# Service create date: ${new Date().toISOString()}
# Homepage: https://github.com/ifgeny87/webxuker/tree/master/cli/xukercli#readme
#
# This file generate automatically with xuker CLI tool
#
# Doc of this file: https://gist.github.com/maliarslan/a50c5f335a18ebb31068663cabec98af
# After=network.target means our service will start after the network is up and running
# Type=simple specify that how our app launch itself. Simple means it won't drop user priviliges
# User=username tells that our app will run as the unprivileged user unless you want to run it by root
# ExecStart=/usr/bin/node /home/username/mygreatestapp/mygreatestapp.js tells systemd the location of our app and what command it should run
# Restart=on-failure clearly says under what condition system restart our service. But if you stop the service it won't restart itself.
# WantedBy=multi-user.target specify how our service should be enabled
#
# Steps:
# 1) Place it file to /lib/systemd/system/ with root
# 2) Update services: systemctl daemon-reload
# 3) Run: systemctl start|status|stop ${svcFileName}
#
# Setup autorun on startup:
# systemctl enable|disable ${svcFileName}

[Unit]
Description=${options.description}
After=network.target

[Service]
Type=simple
User=${process.env.USER}
ExecStart=${[options.cmd, ...(options.args || [])].join(' ')}
Restart=on-failure

[Install]
WantedBy=multi-user.target`;
		try {
			fs.writeFileSync(targetPath, content);
		} catch (error) {
			throw new Error(`Cannot save target file "${targetPath}": ${error}`)
		}
		return targetPath;
	}

	override async list(): Promise<IDaemonStatus[]> {
		const spawnResult = await spawnChild(this.toolcmd);
		if (spawnResult.exitCode) {
			throw new SpawnError(`Cannot get list of services`, spawnResult);
		}
		// нужны только строки из stdout до пустой строки
		const lines = (spawnResult.stdout || '').split('\n');
		const k = lines.indexOf('');
		return lines.slice(0, k)
			.map(s => {
				const parts = s.match(/^(?<unit>[\w-.@]+)\s+(?<load>\w+)\s+(?<active>\w+)\s+(?<sub>\w+)\s+/);
				if (!parts?.groups) {
					throw new Error(`Cannot parse service line "${s}"`);
				}
				return {
					unit: parts.groups.unit,
					load: parts.groups.load,
					active: parts.groups.active,
					sub: parts.groups.sub,
				};
			});
	}

	override async refresh(): Promise<void> {
		const res = await spawnChild('systemctl', ['daemon-reload']);
		if (res.exitCode) {
			throw new Error([
				`Cannot reload service list`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async enable(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['enable', unit]);
		if (res.exitCode) {
			throw new Error([
				`Cannot enable service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async disable(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['disable', unit]);
		if (res.exitCode) {
			throw new Error([
				`Cannot disable service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async start(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['start', unit]);
		if (res.exitCode) {
			throw new Error([
				`Cannot start service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async restart(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['restart', unit]);
		if (res.exitCode) {
			throw new Error([
				`Cannot restart service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async stop(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['stop', unit]);
		if (res.exitCode) {
			throw new Error([
				`Cannot stop service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}
}
