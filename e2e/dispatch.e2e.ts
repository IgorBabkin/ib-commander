import { beforeEach, describe, it } from 'vitest';
import { Container, IContainer, Provider, Registration } from 'ts-ioc-container';
import { Application, IErrorHandler, IErrorHandlerKey, ILogger, ILoggerKey, SetupModule } from '../src';
import { ChangelogController } from './ChangelogController';
import { It, Mock, Times } from 'moq.ts';

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
      Application.bootstrap(scope).run('ib', 'changelog', 'generate', '--greeting', 'hello');

      loggerMock.verify((l) => l.info(It.Is<string>((v) => v.includes('hello'))));
    });
  });

  describe('User story: developer invokes an unregistered controller', () => {
    it('calls the error handler when the controller is not found', () => {
      Application.bootstrap(scope).run('ib', 'unknown', 'generate');

      errorHandlerMock.verify((h) => h.handleError(It.IsAny()));
    });
  });

  describe('User story: developer maps both default and named action to the same method', () => {
    it('routes "changelog" with no action to generate (default)', () => {
      Application.bootstrap(scope).run('ib', 'changelog', '--greeting', 'hello');

      loggerMock.verify((l) => l.info(It.Is<string>((v) => v.includes('hello'))), Times.Once());
    });

    it('routes "changelog generate" to the same generate method', () => {
      Application.bootstrap(scope).run('ib', 'changelog', 'generate', '--greeting', 'hello');

      loggerMock.verify((l) => l.info(It.Is<string>((v) => v.includes('hello'))), Times.Once());
    });
  });

  describe('User story: lifecycle hooks surround every action', () => {
    it('fires the before hook when dispatching "generate"', () => {
      Application.bootstrap(scope).run('ib', 'changelog', 'generate', '--greeting', 'hi');

      loggerMock.verify((l) => l.info('before'));
    });

    it('fires the after hook when dispatching "generate"', () => {
      Application.bootstrap(scope).run('ib', 'changelog', 'generate', '--greeting', 'hi');

      loggerMock.verify((l) => l.info('after'));
    });
  });

  describe('User story: developer omits a required option', () => {
    it('calls the error handler when --greeting is missing from "changelog generate"', () => {
      Application.bootstrap(scope).run('ib', 'changelog', 'generate');

      errorHandlerMock.verify((h) => h.handleError(It.IsAny()));
    });
  });

  describe('User story: developer invokes an unknown action on a known controller', () => {
    it('still fires lifecycle hooks even when the action name is unregistered', () => {
      Application.bootstrap(scope).run('ib', 'changelog', 'unknown');

      loggerMock.verify((l) => l.info('before'));
      loggerMock.verify((l) => l.info('after'));
    });
  });
});
