import { bindTo, hook, inject, register } from 'ts-ioc-container';
import { execute, ILogger, ILoggerKey, onAfter, onBefore, onDefault, readInput } from '../src';
import { z } from 'zod';
import { Command } from 'commander';

const GENERATE_CHANGELOG_SCHEMA = z.object({
  greeting: z.string(),
});

const generateChangelogOptions = (cmd: Command): Command => {
  return cmd.option('--greeting <value>', 'Greeting...');
};

export type GenerateChangelogPayload = z.infer<typeof GENERATE_CHANGELOG_SCHEMA>;

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

  @hook('generate', execute())
  generate(@inject(readInput(GENERATE_CHANGELOG_SCHEMA, generateChangelogOptions)) _options: GenerateChangelogPayload): void {
    this.logger.info(JSON.stringify(_options));
  }

  @onDefault(execute())
  logDefault() {
    this.logger.info('default');
  }

  @onAfter(execute())
  logAfter() {
    this.logger.info('after');
  }
}
