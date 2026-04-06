import { beforeEach, describe, expect, it } from 'vitest';
import { bindTo, Container, hook, IContainer, inject, Provider, register, Registration } from 'ts-ioc-container';
import {
  Application,
  execute,
  IErrorHandler,
  IErrorHandlerKey,
  IInputService,
  IInputServiceKey,
  onAfter,
  onBefore,
  onDefault,
  onError,
  SetupModule,
} from './index.js';
import { It, Mock } from 'moq.ts';

const CALLS_KEY = 'calls';

@register(bindTo('test'))
class TestController {
  constructor(@inject(CALLS_KEY) private readonly calls: string[]) {}

  @onBefore(execute())
  beforeHook() {
    this.calls.push('before');
  }

  @onDefault(execute())
  defaultAction() {
    this.calls.push('default');
  }

  @onAfter(execute())
  afterHook() {
    this.calls.push('after');
  }

  @onError(execute())
  errorHook() {
    this.calls.push('error');
  }
}

@register(bindTo('dual'))
class DualRoleController {
  constructor(@inject(CALLS_KEY) private readonly calls: string[]) {}

  @onDefault(execute())
  @hook('generate', execute())
  sharedAction() {
    this.calls.push('shared');
  }
}

@register(bindTo('throwing'))
class ThrowingController {
  constructor(@inject(CALLS_KEY) private readonly calls: string[]) {}

  @onDefault(execute())
  defaultAction(): void {
    throw new Error('boom');
  }

  @onError(execute())
  errorHook() {
    this.calls.push('error');
  }
}

describe('Application', () => {
  let inputServiceMock: Mock<IInputService>;
  let errorHandlerMock: Mock<IErrorHandler>;
  let calls: string[];
  let scope: IContainer;

  beforeEach(() => {
    calls = [];
    inputServiceMock = new Mock<IInputService>();
    errorHandlerMock = new Mock<IErrorHandler>();
    errorHandlerMock.setup((h) => h.handleError(It.IsAny())).returns(undefined);

    scope = new Container().useModule(new SetupModule());
    scope.register(IInputServiceKey.token, Provider.fromValue(inputServiceMock.object()));
    scope.register(IErrorHandlerKey.token, Provider.fromValue(errorHandlerMock.object()));
    scope.register(CALLS_KEY, Provider.fromValue(calls));
    Registration.fromClass(TestController).applyTo(scope);
    Registration.fromClass(DualRoleController).applyTo(scope);
    Registration.fromClass(ThrowingController).applyTo(scope);
  });

  function makeApp() {
    return new Application(scope, inputServiceMock.object(), errorHandlerMock.object());
  }

  function setupAction(controller: string, action = 'default') {
    inputServiceMock.setup((s) => s.readOptionsOrFail(It.IsAny(), It.IsAny())).returns({ controller, action });
  }

  describe('successful dispatch', () => {
    it('executes the resolved action on the controller', () => {
      setupAction('test');
      makeApp().run();
      expect(calls).toContain('default');
    });

    it('fires before hooks before the action', () => {
      setupAction('test');
      makeApp().run();
      expect(calls.indexOf('before')).toBeLessThan(calls.indexOf('default'));
    });

    it('fires after hooks after the action', () => {
      setupAction('test');
      makeApp().run();
      expect(calls.indexOf('after')).toBeGreaterThan(calls.indexOf('default'));
    });
  });

  describe('dual-role method (onDefault + named hook)', () => {
    it('calls the shared method when no action is provided (default)', () => {
      setupAction('dual', 'default');
      makeApp().run();
      expect(calls).toContain('shared');
    });

    it('calls the same shared method when the named action is provided', () => {
      setupAction('dual', 'generate');
      makeApp().run();
      expect(calls).toContain('shared');
    });
  });

  describe('error handling', () => {
    it('fires error hooks when the action throws', () => {
      setupAction('throwing');
      makeApp().run();
      expect(calls).toContain('error');
    });

    it('calls errorHandler when the action throws', () => {
      setupAction('throwing');
      makeApp().run();
      errorHandlerMock.verify((h) => h.handleError(It.IsAny()));
    });

    it('calls errorHandler when the controller is not registered', () => {
      setupAction('unknown');
      makeApp().run();
      errorHandlerMock.verify((h) => h.handleError(It.IsAny()));
    });
  });
});
