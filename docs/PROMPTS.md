# Prompts

## 1. Useful prompts from this session (cleaned up)

### 1.1 Structure analysis
```
Analyze the current Nestar NestJS GraphQL monorepo structure so it can be transformed
into the Petoria pet shop platform. Report: nest-cli projects, apps, modules,
resolvers with every query/mutation, Mongoose schemas with fields, enums, DTOs,
batch jobs, and every place real-estate concepts (property, agent, rent, barter,
beds, rooms, square, location) appear, with file paths and counts.
Plan first; do not modify anything.
```

### 1.2 Safe rename layer (executed in this session)
```
Safe rename layer (no business logic change): rename all visible project/app
identifiers from Nestar to Petoria. Do not change domain logic. Keep the GraphQL API
and the database unchanged. Update package names, nest-cli projects, script paths,
build output paths, environment labels and constants. Run lint and typecheck
after refactoring. Make a plan first.
```

### 1.3 Migration docs (this file set)
```
Create docs/ with BACKEND_MIGRATION.md, DECISIONS.md, FRONTEND_MIGRATION.md,
COMPLETED_TASKS.md, NEXT_STEPS.md, PROMPTS.md summarizing the current
Nestar → Petoria migration state. Only create documentation files; do not change
application source code. Be precise and technical; use tables.
```

## 2. Reusable prompts for the next session

Every prompt starts with this shared guardrail block:

```
Context: read docs/BACKEND_MIGRATION.md, docs/DECISIONS.md, docs/NEXT_STEPS.md first.
Guardrails:
- Plan first, wait for approval.
- Do not change GraphQL operation names, enums, collections or .env keys unless this task says so.
- Never mix `eslint --fix` / prettier output into a refactor commit.
- Use `git mv` for renames.
- Validate with: npm run typecheck · npx nest build petoria-api · npx nest build petoria-batch ·
  npx eslint "{src,apps,libs,test}/**/*.ts" (report-only) · git grep for leftover names.
- Report the results honestly, including failures. Do not commit unless asked.
```

### 2.1 Apply formatting as a separate commit
```
In a separate commit, run eslint --fix, show me which changes are not just whitespace
(e.g. removed type assertions), and keep only formatting changes unless I approve the others.
Change the lint script so it no longer includes --fix (add lint:fix).
```

### 2.2 Fix the `shemas` typo
```
Rename apps/petoria-api/src/shemas → schemas with git mv and update every import
(API and batch). No other changes. Validate as usual.
```

### 2.3 Extract shared libs (D11)
```
Create a Nest library libs/shared and move database.module, schemas, enums, dto, types
and libs/config into it. Add tsconfig paths (@app/shared) and update nest-cli.json.
Repoint the API and batch imports and delete the unused apps/petoria-batch/src/database.
Behaviour and the API must stay the same; generate the GraphQL SDL before and after and diff it.
```

### 2.4 Domain rename (only after D9/D10 are decided)
```
Rename the domain Property → <Product|Pet> and MemberType.AGENT → <SELLER>, end to end:
schema (collection <products>), DTOs/inputs, enums (LikeGroup/ViewGroup/CommentGroup/
NotificationGroup PROPERTY→PRODUCT), resolver/service names (see the GraphQL table in
docs/BACKEND_MIGRATION.md §6), config.ts sorts/lookups/upload targets, role guards,
and the batch jobs. Remove real-estate-only fields (beds, rooms, square, barter, rent,
constructedAt) and add: <fields>. Output a before/after SDL diff. Do not touch the frontend.
```

### 2.5 Mongo data migration script
```
Write an idempotent MongoDB migration script (scripts/migrations/<date>-petoria-domain.ts)
that renames enum values AGENT→SELLER in members.memberType and PROPERTY→PRODUCT in
likes/views/comments/notifications, renames properties→products, renames memberProperties→
memberProducts, and rebuilds indexes. Include a dry-run mode and a rollback. Do not run it.
```

### 2.6 Restore and rename the frontend
```
In ../petoria-next: restore pages/, public/ and scss/ deleted in commit 6a995bf
(git checkout 7cda7c8 -- pages public scss). Then do a safe identifier rename
Nestar→Petoria (package name, layouts, Footer, _document SEO, all 4 locales).
Do not change GraphQL documents. Validate with next build and tsc.
```

### 2.7 Frontend domain migration
```
In ../petoria-next, apply docs/FRONTEND_MIGRATION.md §2–5: rename routes (with redirects),
components, types/enums and GraphQL documents to match the backend after Phase 3.
Update all 4 locales. Replace the property filters and the AddNewProperty form with <fields>.
```

### 2.8 GraphQL contract check
```
Start petoria-api, dump the generated schema (SDL) and diff it against
<baseline file>. List added, removed and renamed types, fields and operations,
and flag breaking changes for the frontend.
```

### 2.9 End-of-session docs update
```
Update docs/COMPLETED_TASKS.md, docs/NEXT_STEPS.md and docs/DECISIONS.md with
everything done and decided in this session, including the validation results.
Change documentation only.
```
