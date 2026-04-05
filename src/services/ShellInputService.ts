import { Command } from 'commander';
import { z } from 'zod';
import { bindTo, inject, register, singleton } from 'ts-ioc-container';
import { IInputService, IInputServiceKey } from './IInputService';

@register(bindTo(IInputServiceKey), singleton())
export class ShellInputService implements IInputService {
  private readonly operands: string[];

  constructor(@inject('args') private readonly args: string[]) {
    const { operands } = new Command().parseOptions(args);
    this.operands = operands;
  }

  readOptionsOrFail<T extends z.ZodTypeAny>(mapCommand: (cmd: Command) => Command, schema: T): z.infer<T> {
    const cmd = mapCommand(new Command()).allowUnknownOption(true).allowExcessArguments(true).exitOverride();
    cmd.parse(this.args, { from: 'user' });
    const [, controller = '', action = ''] = this.operands;
    return schema.parse({ controller, action, ...cmd.opts() });
  }
}
