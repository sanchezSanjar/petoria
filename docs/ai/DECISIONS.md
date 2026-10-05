# Architectural Decisions — Nestar → Petoria

Each entry gives the decision, why it was made, the risks, and the alternatives. Status is one of **Accepted**, **Deferred** or **Proposed** (not yet decided by the project owner).

## Summary

| # | Decision | Status |
|---|---|---|
| D1 | Rename identifiers first, separate from any domain change | Accepted |
| D2 | Canonical name is `petoria` / `Petoria` | Accepted |
| D3 | Rename folders with `git mv` | Accepted |
| D4 | Keep the GraphQL API, MongoDB data and `.env` keys unchanged in Phase 1 | Accepted |
| D5 | Keep the `shemas` typo, the `AGENT` role and Property code for now | Deferred |
| D6 | Revert the `eslint --fix` output and lint in report-only mode | Accepted |
| D7 | Add an `npm run typecheck` script | Accepted |
| D8 | Delete the stale `dist/` | Accepted |
| D9 | Core entity: Property → Product (and/or Pet) | Proposed |
| D10 | Role: AGENT → SELLER | Proposed |
| D11 | Extract shared code into Nest `libs/` | Proposed |
| D12 | Add Order/Cart; wire up Notice and Notification | Proposed |

---

### D1 — Rename identifiers before changing the domain
- **Decision:** Phase 1 only renames project and app identifiers (folders, Nest project names, npm name, scripts, build paths, banner strings). No business logic changes.
- **Why:** It keeps a large, mechanical, zero-risk diff (82 file renames, 11 changed lines in `apps/`) apart from the domain refactor that will break things. Reviewing and reverting each one is easier on its own.
- **Risks:** "Petoria" sits on top of real-estate code for a while, which may confuse contributors.
- **Alternatives:** Rename and change the domain in one pass. Rejected because the diff would be impossible to review.

### D2 — Canonical name `petoria`
- **Decision:** Use `petoria` (lowercase, in package and project names) and `Petoria` (in display text).
- **Why:** It matches the repo folder, the git remote and the frontend repo (`petoria-next`). The request said "Peteroia" and `AGENTS.md` said "Peteria"; both were treated as typos.
- **Risks:** If another spelling was intended, everything has to be renamed again. That's cheap with a grep.
- **Alternatives:** none.

### D3 — `git mv` for the folder renames
- **Decision:** `apps/nestar-api` → `apps/petoria-api` and `apps/nestar-batch` → `apps/petoria-batch` were renamed with `git mv`.
- **Why:** Git records the changes as renames (status `R`), so `git log --follow` and blame still work.
- **Risks:** Open IDE tabs and buffers may still show the old paths or stale content. This came up during the session with `package.json`.
- **Alternatives:** Copy and delete, which loses the history signal.

### D4 — Keep the API contract, database and env keys
- **Decision:** No GraphQL operation, type, enum, collection, index, `.env` key or DB name was changed.
- **Why:** The frontend and production data keep working, and Phase 1 can ship on its own.
- **Risks:** None at runtime. The only external break is the changed `dist/apps/*` paths and `nest start` project names, which affect deploy scripts.
- **Alternatives:** Rename the DB as well. Rejected because it would point the app at an empty database.

### D5 — Defer the `shemas` typo, the `AGENT` role and Property code
- **Decision:** Leave `apps/petoria-api/src/shemas/`, `MemberType.AGENT` and the whole `property` module as they are.
- **Why:** Each touches many imports (`shemas`) or the API and data (`AGENT`, Property). They belong in their own commits.
- **Risks:** Technical debt stays visible. The batch app's relative imports into `shemas` must be updated when it is renamed.
- **Alternatives:** Fix `shemas` in Phase 1. Postponed to keep Phase 1 limited to identifiers.

### D6 — Revert the lint autofix and lint in report-only mode
- **Decision:** `npm run lint` includes `--fix`, and running it rewrote about 60 files (+1,381/−1,505 lines). It also made small semantic edits, such as removing `as Member` casts (`no-unnecessary-type-assertion`). Those changes were reverted with `git checkout -- apps`, the rename edits were re-applied, and lint was run with `npx eslint` without `--fix`.
- **Why:** A "safe rename" commit must not carry reformatting or type-assertion changes.
- **Risks:** The lint baseline stays red: 1,436 problems (1,415 errors, 21 warnings).
- **Alternatives:** Commit the autofix together with the rename. Rejected. Plan it as a separate formatting-only commit instead.

### D7 — Add `npm run typecheck`
- **Decision:** `tsc --noEmit -p apps/petoria-api/tsconfig.app.json && tsc --noEmit -p apps/petoria-batch/tsconfig.app.json`.
- **Why:** The repo had no typecheck command. `nest build` uses webpack and doesn't make a clear typecheck gate.
- **Risks:** None. It's an additive script.
- **Alternatives:** Rely on `nest build` only.

### D8 — Delete the stale `dist/`
- **Decision:** `dist/` is gitignored (`/dist`) and still held `nestar-*` output, so it was removed and rebuilt by `nest build`.
- **Why:** Stale output under the old names could be started by mistake (`node dist/apps/nestar-api/main`).
- **Risks:** None.
- **Alternatives:** Leave it.

### D9 — Core entity: Property → Product (and/or Pet) — **Proposed**
- **Options:**
  - (a) **Product.** Pet supplies: category, pet type, brand, price, stock. Recommended as the main entity.
  - (b) **Pet.** Animal listings: species, breed, age, gender, vaccinated.
  - (c) Both.
- **Why it matters:** It decides the schema, GraphQL names, frontend routes and data migration.
- **Risks:** Breaking API change; `properties` data must be migrated or archived; the unique index on (type, location, title, price) must be redesigned.
- **Alternatives:** Add a new `product` module alongside `property` and retire `property` later. That's safer for a gradual frontend switch.

### D10 — Role: AGENT → SELLER — **Proposed**
- **Options:** `SELLER` (recommended), `SHOP`, or keep `AGENT`.
- **Risks:**
  - Enum values are stored in `members.memberType`, so this needs an `updateMany` migration.
  - `@Roles(MemberType.AGENT)` guards, the batch `BATCH_TOP_AGENTS` job, the frontend `MemberType` enum and the JWT payload `memberType` all change.
  - Existing tokens that carry `AGENT` must expire or be reissued.
- **Alternatives:** Keep `AGENT` internally and change only the UI labels. Cheapest, but confusing.

### D11 — Extract shared code into Nest `libs/` — **Proposed**
- **Problem:** `apps/petoria-batch` imports `../../petoria-api/src/{database,shemas,libs}`. This couples the apps and breaks whenever the API folder moves, as it did in this session.
- **Proposal:** Move it into `libs/shared` (or split it into `libs/schemas`, `libs/dto` and `libs/enums`) with tsconfig `paths` aliases (`@app/shared`).
- **Risks:** Every import changes, and webpack and tsconfig `paths` must be configured. Note that `tsconfig.json` has `"paths": {}` today.
- **Alternatives:** Keep the relative imports.

### D12 — Add Order/Cart; wire up Notice and Notification — **Proposed**
- **Context:** A pet shop needs purchase flows. The `Notice.model.ts` and `Notification.model.ts` schemas and enums exist but have no module, resolver or DTOs. The frontend has CS pages (`/cs`, `/_admin/cs/*`) that expect notice and FAQ data.
- **Risks:** New scope. Order consistency (stock decrement) needs Mongo transactions or atomic `$inc` with guards.
- **Alternatives:** Start with domain parity (Phase 3) and add commerce later.
