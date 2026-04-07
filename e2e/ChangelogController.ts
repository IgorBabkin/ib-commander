import { bindTo, hook, inject, register } from 'ts-ioc-container';
import { command, execute, ILogger, ILoggerKey, onAfter, onBefore, onDefault, schema } from '../src';
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

  @command(() => new Command().requiredOption('--greeting <value>', 'Greeting'))
  @schema(() => GENERATE_CHANGELOG_SCHEMA)
  @onDefault(execute())
  @hook('generate', execute())
  generate(options: z.infer<typeof GENERATE_CHANGELOG_SCHEMA>): void {
    this.logger.info(options.greeting);
  }

  @onAfter(execute())
  logAfter() {
    this.logger.info('after');
  }
}
