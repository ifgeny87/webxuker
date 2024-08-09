import { spawn } from 'node:child_process';

export interface ISpawnResult {
	cmd: string;
	args?: string[];
	fullCmd: string;
	exitCode: number;
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
		ps.on('close', (exitCode: number) => {
			const fullCmd = [cmd, ...(args || [])].join(' ');
			resolve({
				cmd,
				args,
				fullCmd,
				exitCode,
				stdout: stdout.length ? Buffer.concat(stdout).toString('utf-8') : undefined,
				stderr: stderr.length ? Buffer.concat(stderr).toString('utf-8') : undefined,
			});
		});
		ps.on('error', (error: Error) => {
			reject(error);
		});
	});
}
