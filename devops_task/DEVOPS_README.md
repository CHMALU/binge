# CI/CD Pipeline

This project uses GitLab CI/CD to keep branch feedback fast while still enforcing a stronger gate on `main`.

## Stages

1. `build` - installs dependencies, generates the Prisma client, checks that `NEXT_PUBLIC_TMDB_API_KEY` is available, and runs `npm run build`.
2. `analysis` - runs lint and TypeScript checks. Both jobs are required and fail the pipeline on errors.
3. `dependency_scan` - runs `npm audit --audit-level=high` and fails on high or critical vulnerabilities.
4. `test` - runs either the fast/basic test suite or the full test suite, depending on the branch.
5. `deploy` - mock deploy, only on `main`.

## Branches

### Feature and normal branches

Feature branches run the fast feedback path:

- `build`
- `lint`
- `typecheck`
- `npm_audit`
- `fast_tests`

`fast_tests` runs component and library tests with coverage enabled:

`npm run test:fast`

Coverage is printed in the job log. There is no minimum coverage gate on feature branches, because the goal is quick feedback while work is still in progress.

### Main branch

`main` runs the full release gate:

- `build`
- `lint`
- `typecheck`
- `npm_audit`
- `full_tests`
- `mock_deploy`

`full_tests` runs the complete Jest suite with coverage enabled and enforces the global coverage minimum:

- branches: 70%
- functions: 70%
- lines: 80%
- statements: 80%

If lint, typecheck, npm audit, tests, or coverage thresholds fail on `main`, the pipeline fails.

## Coverage

Both fast and full test jobs publish:

- text coverage in the job log

## Local Equivalents

Run the same checks locally with:

```bash
npm run build
npm run lint
npm run typecheck
npm audit --audit-level=high
npm run test:fast
npm run test:full -- --coverageThreshold='{"global":{"branches":70,"functions":70,"lines":80,"statements":80}}'
```

## Pictures

`main-branch.png` -> This is a pipeline run on the main branch. Unfortunatly, the pipeline fails on the full test stage, due to unsatisfied coverage percentages.
`normal-branch.png` -> In this pipeline the every job finished successfully.
