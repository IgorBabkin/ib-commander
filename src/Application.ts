import { createHookContextFactory, HooksRunner, IContainer, inject, select } from 'ts-ioc-container';
import { IErrorHandler, IErrorHandlerKey } from './error/IErrorHandler.js';
import { BASIC_ARGS_SCHEMA, MAIN_COMMAND } from './controller/options.js';
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
    @inject(IErrorHandlerKey) private errorHandler: IErrorHandler,
  ) {}

  run(...args: string[]): void {
    MAIN_COMMAND.action((controller: string, action: string | undefined) => {
      let controllerObj: object | null = null;
      try {
        const options = BASIC_ARGS_SCHEMA.parse({ controller, action });
        controllerObj = this.scope.resolve(options.controller) as object;

        const createContext = createHookContextFactory({ args });
        this.onBeforeHooksRunner.execute(controllerObj, { scope: this.scope, createContext });

        const hooksRunner = new HooksRunner(options.action);
        hooksRunner.execute(controllerObj, {
          scope: this.scope,
          createContext,
        });

        this.onAfterHooksRunner.execute(controllerObj, { scope: this.scope, createContext });
      } catch (e) {
        if (controllerObj)
          this.onErrorHooksRunner.execute(controllerObj, {
            scope: this.scope,
            createContext: createHookContextFactory({ args: [e] }),
          });
        this.errorHandler.handleError(e);
      } finally {
        this.scope.dispose();
      }
    }).parse(args, { from: 'electron' });
  }
}
