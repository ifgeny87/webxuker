import { IDaemonManager } from './IDaemonManager.js';
import { SystemctlDaemonManager } from './SystemctlDaemonManager.js';
import {
	getCurrentMachine,
	MachineCodesEnum,
	CLIConfigurationError,
} from '../../helpers/index.js';
import { LaunchctlDaemonManager } from './LaunchctlDaemonManager.js';

export function getDaemonManager(): IDaemonManager {
	const machine = getCurrentMachine();
	if (machine === MachineCodesEnum.linux) {
		return new SystemctlDaemonManager();
	} else if (machine === MachineCodesEnum.darwin) {
		return new LaunchctlDaemonManager();
	} else {
		throw new CLIConfigurationError(`Cannot detect machine`);
	}
}
