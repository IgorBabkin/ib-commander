# ib-commander — Product Spec

A TypeScript framework for building structured CLI applications.
Dispatch model: `ib <controller> <action> [--option value ...]`

---

## Feature 1 — Core Dispatch Engine

The runtime that maps a CLI invocation to a controller method.

### Epic 1.1 — Application bootstrap

**Story 1.1.1 — `Application.run()` dispatches a command**

- Case: given `ib changelog generate`, resolves controller token `"changelog"`, executes hook `"generate"`
- Case: `action` defaults to `"default"` when omitted (`ib changelog`)
- Case: unknown controller token throws a typed `ControllerNotFoundError`
- Case: unknown action on a known controller throws a typed `ActionNotFoundError`

**Story 1.1.2 — Error handling**

- Case: any error thrown inside a hook is caught and forwarded to `IErrorHandler`
- Case: `IErrorHandler` receives the raw error, not a wrapped one
- Case: process exits with code 1 after `handleError` returns

### Epic 1.2 — Input parsing

**Story 1.2.1 — `IInputService` parses `process.argv`**

- Case: positional args `[controller, action]` are extracted before flag parsing
- Case: `--flag value` is parsed into `{ flag: "value" }`
- Case: `--flag` without a value is parsed as `{ flag: true }`
- Case: repeated `--flag v1 --flag v2` is collected into `{ flag: ["v1", "v2"] }`

**Story 1.2.2 — `readOptionsOrFail` validates against a Zod schema**

- Case: valid input returns a typed, parsed object
- Case: schema validation failure throws a `ValidationError` with field-level messages
- Case: `readOptionsOrFail` can be called multiple times with different schemas on the same input

**Story 1.2.3 — `setData` accepts external input (non-argv)**

- Case: passing a plain object overrides argv as the data source
- Case: useful for programmatic / test invocation of `Application.run()`

---

## Feature 2 — Controller & Hook Authoring API

Decorators and conventions that developers use to declare controllers.

### Epic 2.1 — Controller registration

**Story 2.1.1 — `@register(bindTo(token))` registers a controller class**

- Case: class decorated with `@register(bindTo('changelog'))` is resolvable as `scope.resolve('changelog')`
- Case: two classes with the same token produce a clear registration conflict error at boot
- Case: controller is resolved as a new instance per `run()` call (request-scoped)

### Epic 2.2 — Hook declaration

**Story 2.2.1 — `@hook(action)` marks a method as an action handler**

- Case: `@hook('generate')` is invoked when action is `"generate"`
- Case: a method without `@hook` is never invoked by the runner
- Case: multiple `@hook` decorators on different methods in the same class work independently

**Story 2.2.2 — `@onDefault` marks a method as the fallback action handler**

- Case: `@onDefault` method is invoked when no action is specified (`ib changelog`)
- Case: `@onDefault` method is invoked when an unregistered action name is used (`ib changelog unknown`)
- Case: only one method per controller should carry `@onDefault`

**Story 2.2.3 — A method can serve as both the default and a named action**

- Case: a method decorated with both `@onDefault` and `@hook('generate')` is called when action is `"default"` (`ib changelog`)
- Case: the same method is called when action is `"generate"` (`ib changelog generate`)
- Case: this is the only meaningful multi-decoration combo — mixing lifecycle hooks (`@onBefore`, `@onAfter`, `@onError`) with action decorators (`@onDefault`, `@hook`) on the same method is not a supported use case

**Story 2.2.4 — Lifecycle hooks surround every action dispatch**

- Case: `@onBefore` method runs before the resolved action on every dispatch
- Case: `@onAfter` method runs after the resolved action on every dispatch
- Case: `@onError` method runs when the action throws, before `IErrorHandler` is called
- Case: lifecycle hooks fire even when the action name is unregistered (no matching `@hook`)

**Story 2.2.5 — `@inject(readInput(schema))` injects validated options**

- Case: method parameter decorated with `@inject(readInput(schema))` receives the parsed, validated payload
- Case: injection fails with `ValidationError` if the input does not match the schema
- Case: multiple parameters can each inject from different schemas

**Story 2.2.6 — `@command` and `@schema` declarative argument parsing**

`@command(fn)` and `@schema(fn)` are method-level decorators that let `execute()` own the full parse-validate-invoke cycle. This is an alternative to `@inject(readInput(...))` — place the parsing declaration on the method instead of the parameter.

- Case: a method with `@command(fn)` has its raw CLI args parsed by the `Command` instance returned by `fn`; the method receives the parsed `command.opts()` object as its first argument
- Case: when `@schema(fn)` is also present, `execute()` validates `command.opts()` through the Zod schema before passing the result to the method
- Case: `@schema` validation failure throws before the method is invoked; the error propagates to `IErrorHandler`
- Case: without `@command`, `execute()` invokes the method with no injected args (existing behaviour for pure lifecycle hooks)
- Case: the `@command` factory receives the IoC scope (`IContainer`), allowing container-resolved values to influence Command construction
- Case: `@command` and `@schema` compose cleanly with `@onDefault` and `@hook` on the same method

---

## Feature 3 — IoC Container Integration

Wiring the framework into `ts-ioc-container`.

### Epic 3.1 — Container setup

**Story 3.1.1 — Root container holds singletons; child scope is created per run**

- Case: services registered on the root container (e.g. `IInputService`) are shared across runs
- Case: controllers are resolved from the child scope so they are request-scoped
- Case: child scope is disposed after each `run()` completes

**Story 3.1.2 — `index.ts` wires the full composition root**

- Case: `Application`, `IInputService`, `IErrorHandler`, and all controllers are registered
- Case: `Application.run(process.argv)` is called as the entry point
- Case: unhandled promise rejections are caught and routed through `IErrorHandler`

---

## Feature 4 — Developer Experience

### Epic 4.1 — Typed schema helpers

**Story 4.1.1 — `validateBySchema` utility**

- Case: `validateBySchema(schema)(data)` returns a typed result or throws `ValidationError`
- Case: usable as a standalone function outside of hook injection

**Story 4.1.2 — `BasicOptionSchema` is extendable**

- Case: a controller can define its own schema via `BASIC_OPTION_SCHEMA.extend({...})` and receive the merged type
- Case: extra unknown keys are stripped, not rejected

### Epic 4.2 — CLI entry point packaging

**Story 4.2.1 — Binary entry point**

- Case: `package.json` `bin` field points to a compiled `dist/index.js`
- Case: running `ib` without arguments prints usage help
- Case: running `ib --help` lists registered controllers and their actions

---

## Feature 5 — Observability & Error UX

### Epic 5.1 — Human-readable error output

**Story 5.1.1 — `ValidationError` prints field-level messages**

- Case: missing required field prints `"Missing required option: --controller"`
- Case: wrong type prints `"Option --action must be a string"`

**Story 5.1.2 — `ControllerNotFoundError` suggests similar tokens**

- Case: `ib chanelog generate` (typo) prints `"Unknown controller 'chanelog'. Did you mean 'changelog'?"`

---

## Glossary

| Term              | Meaning                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| **controller**    | A class that groups related CLI actions, registered under a string token      |
| **action**        | A named method on a controller, exposed as a CLI sub-command                  |
| **hook**          | `ts-ioc-container` hook — the mechanism that binds an action name to a method |
| **scope**         | An IoC container instance; a child scope is created per `run()` call          |
| **input service** | Parses raw CLI args and exposes them for schema-validated injection           |
