import { z } from 'zod';
import { Argument, Command } from 'commander';

export const BASIC_ARGS_SCHEMA = z.object({
  controller: z.string(),
  action: z.string().optional().default('default'),
});

export const MAIN_COMMAND = new Command()
  .allowUnknownOption()
  .allowExcessArguments()
  .addArgument(new Argument('<controller>', 'First argument must be name of controller').argRequired())
  .addArgument(new Argument('<action>', 'Second argument is hook name').argOptional());
