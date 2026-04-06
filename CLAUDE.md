# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # Compile TypeScript to dist/
```

No test runner or linter is configured yet.

## Development Approach

Follow spec-driven development: `SPEC.md` is the source of truth for all features, stories, and acceptance cases. Before implementing anything, locate the relevant story in `SPEC.md` and treat its cases as the definition of done.

Use TDD (Test-Driven Development): write a failing test first, then implement the minimum code to make it pass, then refactor.

Use [moq.ts](https://github.com/dvabuzyarov/moq.ts) for mocking in tests.

Use `.e2e.ts` for e2e tests, `.spec.ts` for integration tests, `.test.ts` for unit tests.

## Architecture

This is a TypeScript Node.js project (CommonJS, ES2016 target). Source lives in `src/`, compiled output goes to `dist/`. The entry point is `src/index.ts` → `dist/index.js`.
