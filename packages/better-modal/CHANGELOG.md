# Changelog

## [1.0.0](https://github.com/buiducnhat/better-modal/compare/v0.0.8...v1.0.0) (2026-10-27)


### ⚠ BREAKING CHANGES

* awaiting show() now throws ModalCancelledError when the modal is dismissed via hide() instead of never settling; callers should catch it to ignore dismissal. The ModalStore type no longer exposes the unused register action.

### Features

* cancel pending promise when a modal is hidden ([754d599](https://github.com/buiducnhat/better-modal/commit/754d59933957a77523d8cff1d5ae1a42708711fd))


### Bug Fixes

* make NODE_ENV checks browser-safe ([2f27c74](https://github.com/buiducnhat/better-modal/commit/2f27c744413bbb1558a4be10629439dec55649d0))

## 0.0.8 (2026-10-27)

No consumer-facing API changes.

### Build & tooling

- Migrated the toolchain to Vite+ 1.4.0: builds via `vp pack` (tsdown 0.23), lint/format via Oxlint/Oxfmt, type check via `vp check`
- Declaration files are now emitted with TypeScript 7
- Added a Vitest test suite covering the modal promise lifecycle
- Added CI, release automation (release-please) and Dependabot workflows
- Publish tarball contents unchanged (removed a redundant `.npmignore`)

Note: 0.0.7 was tagged in git but never published to npm (the tag was cut
without a version bump). This release supersedes it.

## 0.0.6 and earlier

See the git history.
