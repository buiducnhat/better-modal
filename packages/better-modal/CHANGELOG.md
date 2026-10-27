# Changelog

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
