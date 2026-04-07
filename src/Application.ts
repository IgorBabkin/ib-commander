import { createHookContextFactory, HooksRunner, IContainer, inject, select } from 'ts-ioc-container';
import { IErrorHandler, IErrorHandlerKey } from './error/IErrorHandler.js';
import { BASIC_ARGS_SCHEMA, isOption } from './controller/options.js';
import { createOnAfterHookRunner, createOnBeforeHookRunner, createOnErrorHookRunner } from './controller/decorators.js';
import { Argument, Command } from 'commander';

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
    const program = new Command()
      .allowUnknownOption()
      .allowExcessArguments()
      .addArgument(new Argument('<controller>', 'First argument must be name of controller').argRequired())
      .addArgument(new Argument('<action>', 'Second argument is hook name').argOptional());

    program.parse(args, { from: 'electron' });

    let controllerObj: object | null = null;
    try {
      const [controller, action = 'default'] = program.args;
      const options = BASIC_ARGS_SCHEMA.parse({ controller, action: isOption(action) ? 'default' : action });
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
  }
}
