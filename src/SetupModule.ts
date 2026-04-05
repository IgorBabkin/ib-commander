import { IContainer, IContainerModule, Registration } from 'ts-ioc-container';
import { ShellInputService } from './services/input/ShellInputService.js';
import { ConsoleErrorHandler } from './error/ConsoleErrorHandler.js';
import { ConsoleLogger } from './services/logger/ConsoleLogger.js';

export class SetupModule implements IContainerModule {
  applyTo(container: IContainer): void {
    container.addRegistration(Registration.fromClass(ConsoleErrorHandler));
    container.addRegistration(Registration.fromClass(ShellInputService));
    container.addRegistration(Registration.fromClass(ConsoleLogger));
  }
}
