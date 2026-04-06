# ib-commander

A TypeScript framework for building structured CLI applications with a clean dispatch model.

```
ib <controller> <action> [--option value ...]
```

## Requirements

- Node.js >= 20
- TypeScript with `experimentalDecorators` and `emitDecoratorMetadata`

## Installation

```bash
npm install ib-commander reflect-metadata ts-ioc-container commander type-fest zod
```

### TypeScript configuration

Enable decorator support in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Quick Start

```typescript
import 'reflect-metadata';
import { Application, SetupModule } from 'ib-commander';
import { bindTo, Container, inject, register, Registration } from 'ts-ioc-container';
import { z } from 'zod';
import { execute, onBefore, onDefault, onAfter, onError, readInput } from 'ib-commander';

const GreetOptionsSchema = z.object({
  name: z.string().default('World'),
});

@register(bindTo('greet'))
class GreetController {
  @onBefore(execute())
  setup() {
    // runs before every action
  }

  @onDefault(execute())
  hello(@inject(readInput(GreetOptionsSchema, (cmd) => cmd.option('--name <name>'))) opts: z.infer<typeof GreetOptionsSchema>) {
    console.log(`Hello, ${opts.name}!`);
  }

  @onAfter(execute())
  teardown() {
    // runs after every action
  }

  @onError(execute())
  onError() {
    // runs when an action throws
  }
}

const container = new Container().useModule(new SetupModule()).addRegistration(Registration.fromClass(GreetController));
Application.bootstrap(container).run();
```

Run it:

```bash
node dist/main.js greet --name Alice
# Hello, Alice!

node dist/main.js greet
# Hello, World!
```

## Dispatch Model

Each CLI invocation is routed as:

1. Parse `process.argv` to extract `controller`, `action` (defaults to `"default"`), and named options.
2. Resolve the controller class from the IoC container by token.
3. Run hooks in order: `onBefore` → action → `onAfter`. On error: `onError` → `IErrorHandler`.

## Decorators

| Decorator            | Description                                      |
| -------------------- | ------------------------------------------------ |
| `@onBefore(...fns)`  | Runs before every action on the controller       |
| `@onDefault(...fns)` | Marks the method as the `default` action handler |
| `@onAfter(...fns)`   | Runs after every action on the controller        |
| `@onError(...fns)`   | Runs when an action throws an error              |

Pass `execute()` as the hook function to invoke the decorated method:

```typescript
@onDefault(execute())
myAction() { ... }
```

## Input Parsing

Use `readInput(schema, mapCommand?)` with `@inject` to receive validated, typed options:

```typescript
const MySchema = z.object({
  output: z.string(),
  verbose: z.boolean().optional(),
});

@onDefault(execute())
generate(
  @inject(readInput(MySchema, (cmd) => cmd.option('--output <path>').option('--verbose')))
  opts: z.infer<typeof MySchema>
) {
  console.log(opts.output);
}
```

Options are parsed from `process.argv` and validated against the Zod schema. A `ValidationError` is thrown if validation fails.

You can also extend the base schema that includes `controller` and `action`:

```typescript
import { BASIC_OPTION_SCHEMA } from 'ib-commander';

const MySchema = BASIC_OPTION_SCHEMA.extend({ output: z.string() });
```

## Container Setup

`SetupModule` registers the default implementations of `IInputService`, `IErrorHandler`, and `ILogger`:

```typescript
const container = new Container().useModule(new SetupModule());
```

Register controllers using `ts-ioc-container`'s `@register` + `bindTo`, then apply the registration to the container:

```typescript
@register(bindTo('changelog'))
class ChangelogController { ... }

const container = new Container()
  .useModule(new SetupModule())
  .addRegistration(Registration.fromClass(ChangelogController));
```

The token (`'changelog'`) is the first positional argument in the CLI invocation.

## Customizing Services

Replace any built-in service by registering your own implementation:

```typescript
import { IErrorHandlerKey, ILoggerKey, IInputServiceKey, Provider } from 'ib-commander';

container.register(IErrorHandlerKey.token, Provider.fromValue(myErrorHandler));
container.register(ILoggerKey.token, Provider.fromValue(myLogger));
```

### IErrorHandler

```typescript
interface IErrorHandler {
  handleError(error: unknown): void;
}
```

Default: logs to `console.error` and exits with code 1.

### ILogger

```typescript
interface ILogger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
```

Default: delegates to `console.log` / `console.error`.

## Error Handling

Errors thrown inside action methods are:

1. Passed to any `@onError` hooks on the same controller.
2. Forwarded to `IErrorHandler.handleError()`.
3. Process exits with code 1 (default handler).

Unknown controller tokens produce a typed `ControllerNotFoundError`; unknown actions produce `ActionNotFoundError`. Both are forwarded to `IErrorHandler`.

## Validation Utility

`validateBySchema` can be used standalone outside of hook injection:

```typescript
import { validateBySchema } from 'ib-commander';
import { z } from 'zod';

const parse = validateBySchema(z.object({ name: z.string() }));
const result = parse({ name: 'Alice' }); // typed result or throws ValidationError
```

## License

MIT © Igor Babkin
