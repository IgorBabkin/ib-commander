import { bindTo, hook, inject, register } from 'ts-ioc-container';
import { readInput } from '../src/services/input/IInputService';
import { execute } from '../src/controller/hook';
import { z } from 'zod';
import { ILogger, ILoggerKey } from '../src/services/logger/ILogger';
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

  @hook('before-action')
  log() {
    this.logger.info('before-action');
  }

  @hook('generate', execute())
  generate(@inject(readInput(generateChangelogOptions, GENERATE_CHANGELOG_SCHEMA)) _options: GenerateChangelogPayload): void {
    this.logger.info(JSON.stringify(_options));
  }
}
