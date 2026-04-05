import { IContainer, IContainerModule, Registration } from 'ts-ioc-container';
import { ShellInputService } from './services/ShellInputService';
import { ConsoleErrorHandler } from './error/ConsoleErrorHandler';
import { ConsoleLogger } from './services/ConsoleLogger';

export class SetupModule implements IContainerModule {
  applyTo(container: IContainer): void {
    container.addRegistration(Registration.fromClass(ConsoleErrorHandler));
    container.addRegistration(Registration.fromClass(ShellInputService));
    container.addRegistration(Registration.fromClass(ConsoleLogger));
  }
}
