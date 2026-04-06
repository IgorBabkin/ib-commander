import { HookContext, HooksRunner, IContainer, inject, select } from 'ts-ioc-container';
import { IErrorHandler, IErrorHandlerKey } from './error/IErrorHandler.js';
import { BASIC_OPTION_SCHEMA } from './controller/options.js';
import { IInputService, IInputServiceKey } from './services/input/IInputService.js';
import { createOnAfterHookRunner, createOnBeforeHookRunner, createOnErrorHookRunner } from './controller/decorators.js';

export class Application {
  static bootstrap(container: IContainer) {
    return container.resolve(Application);
  }

  private readonly onBeforeHooksRunner = createOnBeforeHookRunner();
  private readonly onAfterHooksRunner = createOnAfterHookRunner();
  private readonly onErrorHooksRunner = createOnErrorHookRunner();

  constructor(
    @inject(select.scope.current) private scope: IContainer,
    @inject(IInputServiceKey) private inputService: IInputService,
    @inject(IErrorHandlerKey) private errorHandler: IErrorHandler,
  ) {}

  run(): void {
    let controller: object;

    try {
      const options = this.inputService.readOptionsOrFail((cmd) => cmd, BASIC_OPTION_SCHEMA);
      controller = this.scope.resolve(options.controller) as object;

      this.onBeforeHooksRunner.execute(controller, { scope: this.scope });

      const hooksRunner = new HooksRunner(options.action);
      hooksRunner.execute(controller, { scope: this.scope });

      this.onAfterHooksRunner.execute(controller, { scope: this.scope });
    } catch (e) {
      if (controller!)
        this.onErrorHooksRunner.execute(controller, {
          scope: this.scope,
          createContext: (Target, scope, methodName) => {
            return new HookContext(Target, scope, methodName).setInitialArgs(e);
          },
        });
      this.errorHandler.handleError(e);
    } finally {
      this.scope.dispose();
    }
  }
}
