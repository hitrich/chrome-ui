# Contributing to Chrome UI

Thanks for helping improve Chrome UI.

## Local setup

1. Install Node.js 22 or newer and enable Corepack.
2. Run `pnpm install`.
3. Run `pnpm dev` for the documentation app.

## Before opening a pull request

- Keep visual work within the Reactive Chrome material rules described in the root README.
- Preserve keyboard behavior, visible focus, reduced motion, and mobile touch targets.
- Add or update tests when component behavior or public types change.
- Run `pnpm validate` and `pnpm test:e2e`.
- Keep changes focused and explain visible or API-level changes in the pull request.

## Component changes

Public components must forward refs, merge `className`, accept their documented native props, and remain usable in both ink and arctic themes. Complex controls may use Radix for behavior, but their presentation must remain original to Chrome UI.
