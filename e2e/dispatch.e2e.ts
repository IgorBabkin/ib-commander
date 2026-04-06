import { beforeEach, describe, it } from 'vitest';
import { Container, IContainer, Provider, Registration } from 'ts-ioc-container';
import { Application, IErrorHandler, IErrorHandlerKey, ILogger, ILoggerKey, SetupModule } from '../src';
import { ChangelogController } from './ChangelogController';
import { It, Mock } from 'moq.ts';

function createContainer() {
  return new Container().useModule(new SetupModule());
}

describe('CLI dispatch', () => {
  let loggerMock: Mock<ILogger>;
  let errorHandlerMock: Mock<IErrorHandler>;
  let scope: IContainer;

  beforeEach(() => {
    loggerMock = new Mock<ILogger>();
    loggerMock.setup((l) => l.info(It.IsAny())).returns(undefined);

    errorHandlerMock = new Mock<IErrorHandler>();
    errorHandlerMock.setup((h) => h.handleError(It.IsAny())).returns(undefined);

    scope = createContainer();
    scope.register(ILoggerKey.token, Provider.fromValue(loggerMock.object()));
    scope.register(IErrorHandlerKey.token, Provider.fromValue(errorHandlerMock.object()));
    Registration.fromClass(ChangelogController).applyTo(scope);
  });

  describe('User story: developer invokes a controller action from the CLI', () => {
    it('routes "changelog generate" to ChangelogController.generate and logs options', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog', 'generate', '--greeting', 'hello']));
      Application.bootstrap(scope).run();

      loggerMock.verify((l) => l.info(It.Is<string>((v) => v.includes('hello'))));
    });
  });

  describe('User story: developer invokes an unregistered controller', () => {
    it('calls the error handler when the controller is not found', () => {
      scope.register('args', Provider.fromValue(['ib', 'unknown', 'generate']));
      Application.bootstrap(scope).run();

      errorHandlerMock.verify((h) => h.handleError(It.IsAny()));
    });
  });

  describe('User story: developer invokes the default action', () => {
    it('routes "changelog" with no action to logDefault', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog']));
      Application.bootstrap(scope).run();

      loggerMock.verify((l) => l.info('default'));
    });
  });

  describe('User story: lifecycle hooks surround every action', () => {
    it('fires the before hook when dispatching "generate"', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog', 'generate', '--greeting', 'hi']));
      Application.bootstrap(scope).run();

      loggerMock.verify((l) => l.info('before'));
    });

    it('fires the after hook when dispatching "generate"', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog', 'generate', '--greeting', 'hi']));
      Application.bootstrap(scope).run();

      loggerMock.verify((l) => l.info('after'));
    });
  });

  describe('User story: developer omits a required option', () => {
    it('calls the error handler when --greeting is missing from "changelog generate"', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog', 'generate']));
      Application.bootstrap(scope).run();

      errorHandlerMock.verify((h) => h.handleError(It.IsAny()));
    });
  });

  describe('User story: developer invokes an unknown action on a known controller', () => {
    it('still fires lifecycle hooks even when the action name is unregistered', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog', 'unknown']));
      Application.bootstrap(scope).run();

      loggerMock.verify((l) => l.info('before'));
      loggerMock.verify((l) => l.info('after'));
    });
  });
});
