import { bindTo, hook, inject, register } from 'ts-ioc-container';
import { execute, ILogger, ILoggerKey, onAfter, onBefore, onDefault } from '../src';
import { z } from 'zod';
import { Command } from 'commander';

const GENERATE_CHANGELOG_SCHEMA = z.object({
  greeting: z.string(),
});

/**
 * How to use
 * schema `ib {controller-token} {action} --some-options-1 smth --some-options-2 smth ..etc`
 * run in CLI - `ib changelog generate`
 */
@register(bindTo('changelog'))
export class ChangelogController {
  constructor(@inject(ILoggerKey) private readonly logger: ILogger) {}

  @onBefore(execute())
  logBefore() {
    this.logger.info('before');
  }

  @onDefault(execute())
  @hook('generate', execute())
  generate(...args: string[]): void {
    const program = new Command().requiredOption('--greeting <value>', 'Greeting');
    program.parse(args);
    const result = GENERATE_CHANGELOG_SCHEMA.parse(program.opts());
    this.logger.info(JSON.stringify(result));
  }

  @onAfter(execute())
  logAfter() {
    this.logger.info('after');
  }
}
