# Engineering Principles

Engineering principles that the AI coding agent must follow when implementing this project.

The goals are:

- minimal dependencies
- high readability
- strong typing
- functional programming style
- immutable data structures
- predictable architecture
- security by default

Use **TypeScript**.

---

## General Language Rules

- Use **TypeScript everywhere** (no plain JavaScript files).
- Enable strict mode in tsconfig.

Required compiler settings:

```
strict: true
noImplicitAny: true
strictNullChecks: true
noUncheckedIndexedAccess: true
```

Avoid using `any`.

Prefer explicit types.

---

## Dependency Philosophy

Dependencies must be kept to a minimum.

Allowed types of dependencies:

- runtime essentials
- developer tooling
- small utility libraries when clearly justified

Avoid:

- large frameworks
- complex dependency trees
- libraries that hide logic

Preferred approach:

Write simple utilities instead of importing heavy packages.

Example

Prefer:

```
small helper function
```

instead of installing a library for a trivial task.

---

## Functional Programming Style

Code should follow functional programming principles where practical.

Guidelines:

- prefer **pure functions**
- avoid side effects
- avoid mutation
- pass data explicitly

Example (preferred):

```
const addAmount = (balance: number, delta: number): number =>
  balance + delta
```

Avoid patterns like:

```
balance += delta
```

Prefer:

- `map`
- `filter`
- `reduce`

instead of manual loops when appropriate.

---

## Immutability

Objects should not be mutated.

Preferred pattern:

```
return {
  ...transaction,
  category
}
```

Avoid:

```
transaction.category = category
```

Data transformations should return **new objects**.

---

## Frontend Architecture

Frontend should use **React with TypeScript**.

Principles:

- small composable components
- presentational vs logic separation
- minimal state

---

## React Guidelines

Prefer functional components.

Example

```
const NChart = ({ data }: Props) => {
  return <Chart data={data} />
}
```

Avoid class components.

Prefer hooks.

Custom hooks should encapsulate logic.

Example

```
useChart()
```

---

## State Management

Avoid heavy state libraries.

Preferred solutions:

- React state
- React context when necessary

Avoid Redux unless absolutely necessary.

---

## Testing

Critical logic should be covered by tests.

Tests should be:

- deterministic
- fast
- isolated

---

## Code Quality

Code must prioritize:

- readability
- explicitness
- simplicity

**Prefer clear code over clever code.**

Every module should have a clear responsibility.

---

## Documentation

Important modules should include brief comments explaining intent.

Prefer explaining **why** something exists rather than **what** the code does.
