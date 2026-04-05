import { beforeEach, describe, it } from 'vitest';
import { Container, IContainer, Provider, Registration } from 'ts-ioc-container';
import { Application, ILogger, ILoggerKey, SetupModule } from '../src';
import { ChangelogController } from './ChangelogController';
import { It, Mock } from 'moq.ts';

function createContainer() {
  return new Container().useModule(new SetupModule());
}

describe('CLI dispatch', () => {
  let loggerMock: Mock<ILogger>;
  let scope: IContainer;

  describe('User story: developer invokes a controller action from the CLI', () => {
    beforeEach(() => {
      loggerMock = new Mock<ILogger>();
      loggerMock.setup((l) => l.info(It.IsAny())).returns(undefined);

      scope = createContainer();
      scope.register(ILoggerKey.token, Provider.fromValue(loggerMock.object()));
      Registration.fromClass(ChangelogController).applyTo(scope);
    });

    it('routes "changelog generate" to ChangelogController.generate and logs options', () => {
      scope.register('args', Provider.fromValue(['ib', 'changelog', 'generate', '--greeting', 'hello']));
      const application = Application.bootstrap(scope);
      application.run();

      loggerMock.verify((l) => l.info(It.Is<string>((v) => v.includes('hello'))));
    });
  });
});
