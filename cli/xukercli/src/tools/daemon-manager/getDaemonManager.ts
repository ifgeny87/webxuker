import { IDaemonManager } from './IDaemonManager.js';
import { SystemctlDaemonManager } from './SystemctlDaemonManager.js';

export function getDaemonManager(): IDaemonManager {
	// TODO check OS
	return new SystemctlDaemonManager();
}
