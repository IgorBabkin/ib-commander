# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # Compile TypeScript to dist/
```

No test runner or linter is configured yet.

## Architecture

This is a TypeScript Node.js project (CommonJS, ES2016 target). Source lives in `src/`, compiled output goes to `dist/`. The entry point is `src/index.ts` → `dist/index.js`.