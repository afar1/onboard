# Contributing

We welcome PRs and issues.

## Issues

Found a bug or have an idea? [Open an issue](https://github.com/afar1/onboard/issues).

Include:
- What you expected vs. what happened
- Steps to reproduce (if it's a bug)
- Your macOS version and app version

## Pull Requests

1. Fork the repo
2. Create a branch (`git checkout -b my-fix`)
3. Make your changes
4. Test locally (`cd electron && npm run dev`)
5. Push and open a PR

We'll review and merge if it looks good. No formal process — just explain what you changed and why.

### Code style

- No frameworks, no build step — keep it vanilla
- Match the existing style in the file you're editing
- Don't add comments explaining obvious code
- Don't add defensive checks that aren't needed

### What we're likely to merge

- Bug fixes with clear reproductions
- Performance improvements
- New features that fit the scope (developer onboarding)
- Better error messages
- Config format improvements

### What we probably won't merge

- Adding frameworks or build tooling
- Major architectural rewrites without prior discussion
- Features outside the core use case

## Questions?

Open an issue or reach out.
