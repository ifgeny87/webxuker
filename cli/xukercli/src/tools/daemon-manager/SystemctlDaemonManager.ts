import { IDaemonManager, IDaemonStatus } from './IDaemonManager.js';
import { spawnChild } from '../../helpers/index.js';

/**
 * Менеджер выполняет платформозависимое обслуживание демонов под управлением systemctl.
 * OS: Ubuntu.
 */
export class SystemctlDaemonManager extends IDaemonManager
{
	override async list(): Promise<IDaemonStatus[]> {
		const res = await spawnChild('systemctl');
		if (res.code || !res.stdout) {
			throw new Error([
				`Cannot get list of services`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
		// нужны только строки из stdout до пустой строки
		const lines = res.stdout.split('\n');
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
		if (res.code) {
			throw new Error([
				`Cannot reload service list`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async enable(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['enable', unit]);
		if (res.code) {
			throw new Error([
				`Cannot enable service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async disable(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['disable', unit]);
		if (res.code) {
			throw new Error([
				`Cannot disable service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async start(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['start', unit]);
		if (res.code) {
			throw new Error([
				`Cannot start service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async restart(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['restart', unit]);
		if (res.code) {
			throw new Error([
				`Cannot restart service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}

	override async stop(unit: string): Promise<void> {
		const res = await spawnChild('systemctl', ['stop', unit]);
		if (res.code) {
			throw new Error([
				`Cannot stop service "${unit}"`,
				res.stderr,
				res.stdout,
			].filter(Boolean).join('\n'));
		}
	}
}
