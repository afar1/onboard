# Dependency Cascades and the Bootstrap Problem

There's a fundamental ordering problem in every computing system that tries to stand itself up from nothing. The Go programming language couldn't compile itself until Go 1.5 — before that, the compiler was written in C. To compile Go, you needed C. To compile C, you needed a C compiler. Turtles, all the way down.

This is the bootstrap problem, and it shows up everywhere. In our onboarding app, Homebrew is the bootstrap. You can't install Node without Homebrew. You can't install the Claude CLI without Node. The dependency graph is a strict partial order — a directed acyclic graph where edges represent "must exist before."

The interesting thing is that this mirrors how cellular biology works. A ribosome is a molecular machine that builds proteins from RNA instructions. But ribosomes are themselves made of proteins. So how did the first ribosome get built? The answer, molecular biologists think, is the RNA World hypothesis — RNA once served as both the instruction set and the execution engine, before the roles split into DNA (storage) and proteins (execution).

Homebrew is our RNA World. It's the single tool that can bootstrap all the other tools. Before `brew` exists on a fresh machine, you're in the primordial soup — you have `curl` and `/bin/bash` and not much else. The Homebrew install script is itself fetched via curl and executed by bash. One `curl | bash` invocation and suddenly the machine can install anything.

Every onboarding flow is, at its heart, a carefully ordered resolution of a dependency graph. Get the order wrong and you're asking someone to compile Go with a C compiler that doesn't exist yet.
