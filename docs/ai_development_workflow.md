# AI Development Workflow

This document defines how an AI coding agent should work while implementing this project.

The goal is to ensure:

- consistent development
- predictable architecture
- safe iteration
- readable code
- stable long-running development sessions

---

# Core Development Principles

The AI agent must prioritize:

1. correctness
2. simplicity
3. readability
4. security
5. minimal dependencies

Avoid:

- overengineering
- unnecessary abstractions
- introducing new frameworks without strong justification

Prefer:

simple working code over complex designs.

---

# Development Loop

For every task the agent must follow this loop.

1. Understand the task
2. Implement minimal working solution
3. Verify TypeScript compiles
4. Verify logic works
5. Refactor if necessary
6. Document changes

Never attempt to solve multiple tasks at once.

# Coding Rules

The agent must follow:

`engineering_principles.md`

Key rules:

- TypeScript only
- immutable data structures
- functional programming style
- minimal dependencies

Never mutate objects.

The system must remain:

- simple
- understandable
- maintainable
- private
