import { spawn } from 'node:child_process';

export interface ISpawnResult {
	code: number;
	stdout?: string;
	stderr?: string;
}

export async function spawnChild(cmd: string, args?: string[], cwd?: string): Promise<ISpawnResult> {
	return new Promise((resolve, reject) => {
		const ps = spawn(cmd, args, { cwd });
		const stdout: Buffer[] = [];
		const stderr: Buffer[] = [];
		ps.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
		ps.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
		ps.on('close', (code: number) => {
			resolve({
				code,
				stdout: stdout.length ? Buffer.concat(stdout).toString('utf-8') : undefined,
				stderr: stderr.length ? Buffer.concat(stderr).toString('utf-8') : undefined,
			});
		});
		ps.on('error', (error: Error) => {
			reject(error);
		});
	});
}
