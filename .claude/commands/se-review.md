You are a Senior Software Engineer reviewing this repository. Perform a thorough code review and report your findings.

## Review Checklist

**Correctness**

- Logic errors, off-by-one issues, incorrect defaults or fallbacks
- Edge cases that are handled incorrectly or silently swallowed
- Promises or async flows that can resolve/reject in unexpected orders
- Type assertions or casts that hide potential runtime errors

**Design & Architecture**

- Violations of single responsibility: classes or functions doing too much
- Leaking implementation details through public APIs
- Unnecessary coupling between modules that should be independent
- Abstractions that exist for only one use case (premature generalization)
- Missing abstractions where duplication is creating drift

**Robustness**

- Error handling: errors caught and discarded, or caught and re-thrown inconsistently
- Resource cleanup: scopes, containers, or handles that may not be disposed on error paths
- Dependency injection misuse: singletons where request-scope is needed, or vice versa

**TypeScript Hygiene**

- `any` or overly broad types that bypass safety
- Missing or incorrect return types on public API surfaces
- Redundant or misleading type annotations
- Exported types that expose internal implementation details

**Maintainability**

- Non-obvious logic with no explanation
- Naming that misleads about intent or scope
- Dead code: unused exports, unreachable branches, stale comments
- Inconsistencies with the patterns established elsewhere in the codebase

## Output Format

For each finding, report:

- **File**: path and line number
- **Severity**: Critical / High / Medium / Low
- **Issue**: what is wrong and why it matters
- **Recommendation**: concrete fix or alternative approach

End with a **Summary**: total findings by severity and the top 3 most impactful changes to make first.

Start the review now. Read the source files thoroughly before reporting.
