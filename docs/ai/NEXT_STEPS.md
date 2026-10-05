# Next Steps — priority order

Do the tasks top-down within each section. **P0** blocks everything else. Across sections, do backend P0–P1, then frontend P0–P1, before any domain (Phase 3) work.

## Backend cleanup

| Priority | Task | Notes |
|---|---|---|
| ~~P0~~ | ~~Commit the Phase 1 rename~~ | **Done**: `eab1fc8` |
| P0 | Update deploy and runtime configs to the new paths | PM2, Docker or CI: `dist/apps/petoria-{api,batch}/main`, `nest start petoria-batch` |
| P1 | Formatting-only commit | `npx eslint "{src,apps,libs,test}/**/*.ts" --fix` → review that only whitespace/prettier changed → commit `style: apply prettier/eslint autofix`. Exclude semantic autofixes such as removed type assertions, or review them on their own. |
| P1 | Remove `--fix` from the `lint` script, add `lint:fix` | Stops future refactors from being polluted |
| P2 | Fix the remaining type-safety lint errors | `no-unsafe-*`, `no-unused-vars`, `require-await`, `no-floating-promises` (e.g. `socket.gateway.ts`, `main.ts`, `Notice.model.ts`, `batch.controller.ts`) |
| P2 | Rename `apps/petoria-api/src/shemas` → `schemas` | Update every import, including the batch imports |
| P2 | Extract shared code into `libs/` (D11) | `libs/shared` with tsconfig `paths`; remove the batch `../../petoria-api/src` imports and the unused `apps/petoria-batch/src/database/database.module.ts` |
| ~~P3~~ | ~~Get D9 and D10 decided~~ | **Done**: Product accepted, AGENT kept |
| ~~P3~~ | ~~Domain rename: Property → Product~~ | **Done** (AGENT kept); see `BACKEND_MIGRATION.md` §9. Not committed yet. |
| P0 | Review and run the dev cleanup script | `scripts/2026-10-petoria-products.mongosh.js` (set `DRY_RUN = true` first). It was written, not run. |
| P0 | Runtime smoke test of the product API | `createProduct` PET+gender / PET without gender (expect BadRequest) / FOOD without gender; `getProducts` with `speciesList`; like → `getFavorites`; view → `getVisited`; PRODUCT comment |
| P4 | New modules: Notice (FAQ/terms/inquiry), Notification, Order/Cart (D12) | |

## Frontend migration (`petoria-next`)

| Priority | Task | Notes |
|---|---|---|
| P0 | Restore `pages/`, `public/` and `scss/` deleted in `6a995bf` | `git checkout 7cda7c8 -- pages public scss` |
| P0 | Get `npm run dev` / `next build` working against `petoria-api` | Check the `.env.development` `REACT_APP_API_*` values |
| P1 | Identifier rename | `package.json` name, layouts, Footer, `_document` SEO, locales, `account/join`, `community/index` |
| P2 | UI terminology in all 4 locales plus the hard-coded FAQ | No GraphQL changes yet |
| P1 | Rename GraphQL documents, types, enums, routes and components | **The backend Phase 3 is done, so the frontend is now broken against it.** Use the operation names in `BACKEND_MIGRATION.md` §9. AGENT names stay. |
| P3 | Replace the real-estate filters and the AddNewProperty form | `property/Filter`, `HeaderFilter`, `AddNewProperty`, `libs/config.ts` |
| P4 | Assets, SEO, admin pages | |

## Testing

| Priority | Task | Notes |
|---|---|---|
| P1 | Create `apps/petoria-api/test/jest-e2e.json` and one e2e smoke test (`sayHello`) | The `test:e2e` script points at a missing file |
| P1 | Runtime smoke test of the renamed apps | `npm run start:dev` and `npm run start:dev:batch`; `signup`/`login`/`getProperties`; WS connection with `?token=` |
| P2 | Record a GraphQL contract snapshot | Save the generated schema (SDL) before Phase 3 and diff it afterwards |
| P2 | Unit tests for the batch rank formulas | `BATCH_TOP_PROPERTIES` and `BATCH_TOP_AGENTS` |
| P3 | Resolver e2e tests: auth guards, member, property/product, like/view toggles | Use an in-memory Mongo or a test DB |
| P3 | Dry-run the migration script on a DB copy | |

## Documentation

| Priority | Task |
|---|---|
| P1 | Commit `docs/` |
| P1 | Update `COMPLETED_TASKS.md` and `NEXT_STEPS.md` at the end of each session |
| P2 | Move D9–D12 in `DECISIONS.md` from Proposed to Accepted/Rejected once decided |
| P2 | Write `SKILLS.md` (currently a one-line stub) and expand `AGENTS.md` (structure, commands, guardrails) |
| P3 | Replace the stock Nest content in `README.md` (setup, env keys, scripts, architecture) |
| P3 | Generate a GraphQL API reference from the schema after Phase 3 |
