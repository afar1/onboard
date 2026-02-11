# Session Handoff

Create a compact handoff document for continuing this conversation in a new session.

## Output Format

Write a markdown file to `.handoff/[timestamp]-handoff.md` with:

```markdown
# Session Handoff - [Project Name]

## Current State
[2-3 sentences: what we're working on, where we left off]

## Recent Changes
[Bullet list of files modified/created this session]

## Key Decisions Made
[Bullet list of important decisions/choices made]

## Next Steps
[Numbered list of what to do next, in order]

## Context Files
[List the most important files to read to understand the current work]

## Commands to Run
[Any pending commands or builds that need to happen]
```

## Instructions

1. Create `.handoff/` directory if it doesn't exist
2. Use timestamp format: `YYYY-MM-DD-HHMMSS`
3. Be concise - this is for context efficiency
4. Focus on actionable state, not history
5. After writing, output the file path so user can reference it

## Usage in New Session

Start a new session with:
```
Read /path/to/.handoff/[timestamp]-handoff.md and continue from where we left off.
```
