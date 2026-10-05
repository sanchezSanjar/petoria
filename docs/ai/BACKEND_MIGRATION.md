# Backend Migration — Nestar → Petoria

> Status as of 2026-10-05: **Phase 1 (identifier rename) complete, committed in `eab1fc8`.** Domain code is still real-estate. Items marked **Proposed** are not decided.

## 1. Original project (Nestar)

| Aspect | Value |
|---|---|
| Purpose | Real-estate listing platform (properties, agents, community board) |
| Stack | NestJS 10, `@nestjs/graphql` + Apollo Server 4 (code-first, `autoSchemaFile`), Mongoose 8, JWT auth, `@nestjs/schedule`, raw `ws` WebSocket gateway, `graphql-upload-minimal` |
| Layout | Nest monorepo, 2 application projects, **no `libs/` projects** |
| Apps | `apps/nestar-api` (GraphQL API, port `PORT_API`, default 3000) · `apps/nestar-batch` (cron ranking jobs, port `PORT_BATCH`, default 3001) |
| Shared code | Lives inside the API app: `apps/*-api/src/{libs,shemas,database}`. Batch imports it via relative paths (`../../<api>/src/...`) |
| Uploads | `apps/uploads/{member,property,article}` served at `/uploads` |
| Env keys | `PORT_API`, `PORT_BATCH`, `MONGO_DEV`, `MONGO_PROD`, `SECRET_TOKEN` (+ `NODE_ENV` read at runtime) |

## 2. New project (Petoria)

Petoria is a pet shop platform built from the Nestar codebase. The infrastructure is reused: auth, members, community board, comments, likes, views, follows, chat, batch ranking. The real-estate domain (Property and Agent) will be replaced with a pet commerce domain.

## 3. Migration goal

| Phase | Scope | Status |
|---|---|---|
| 1 | Rename project and app identifiers. No change to behaviour, the API or the database. | **Done** (`eab1fc8`) |
| 2 | Clean up lint and formatting, fix the `shemas` → `schemas` typo, extract shared `libs/` | Not started |
| 3 | Rename the domain: Property → Product (AGENT kept). This breaks the API and the database. | **Done (backend)**, see §9. The frontend is not migrated yet. |
| 4 | New commerce features: Order/Cart; wire up Notice and Notification | **Proposed** |

## 4. Naming changes (Phase 1, applied)

| Location | Before | After |
|---|---|---|
| App folder | `apps/nestar-api` | `apps/petoria-api` (`git mv`) |
| App folder | `apps/nestar-batch` | `apps/petoria-batch` (`git mv`) |
| `nest-cli.json` project keys | `nestar-api`, `nestar-batch` | `petoria-api`, `petoria-batch` |
| `nest-cli.json` `root` / `sourceRoot` / `tsConfigPath` | `apps/nestar-api/...` | `apps/petoria-api/...` |
| `package.json` / `package-lock.json` `name` | `nestar` | `petoria` |
| Script `start:dev:batch` | `nest start nestar-batch --watch` | `nest start petoria-batch --watch` |
| Script `start:prod` | `node dist/apps/nestar-api/main` | `node dist/apps/petoria-api/main` |
| Script `start:prod:batch` | `node dist/apps/nestar-batch/main` | `node dist/apps/petoria-batch/main` |
| Script `test:e2e` | `./apps/nestar-api/test/jest-e2e.json` | `./apps/petoria-api/test/jest-e2e.json` (file still missing) |
| Script `typecheck` | — | **new**: `tsc --noEmit` for both apps |
| `tsconfig.app.json` `outDir` | `../../dist/apps/nestar-*` | `../../dist/apps/petoria-*` |
| Batch imports (`batch.module.ts` ×3, `batch.service.ts` ×4) | `../../nestar-api/src/...` | `../../petoria-api/src/...` |
| `apps/petoria-api/src/app.service.ts` | `Welcome to Nestar REST API Server!` | `Welcome to Petoria REST API Server!` |
| `apps/petoria-batch/src/batch.service.ts` | `Welcome to Nestar BATCH Server!` | `Welcome to Petoria BATCH Server!` |
| `AGENTS.md` | "Peteria is NesJS GraphQL monorepo" | "Petoria is a NestJS GraphQL monorepo" |
| `README.md` | stock Nest readme | `# Petoria` heading + summary prepended |

## 5. Module changes

All modules are in `apps/petoria-api/src/components/` unless noted.

| Module | Files | Phase 1 | Proposed target (Phase 3+) |
|---|---|---|---|
| `member` | module, resolver, service | Unchanged | Rename `AGENT` role to `SELLER`, `getAgents` to `getSellers`, `memberProperties` to `memberProducts` |
| `property` | module, resolver, service | Unchanged | Rename to `product` (and/or add `pet`) |
| `board-article` | module, resolver, service | Unchanged | Keep. Categories could become pet-related. |
| `comment` | module, resolver, service | Unchanged | Rename `CommentGroup.PROPERTY` to `PRODUCT` |
| `follow` | module, resolver, service | Unchanged | Keep |
| `like` | module, service | Unchanged | Rename `getFavoriteProperties` and `LikeGroup.PROPERTY` |
| `view` | module, service | Unchanged | Rename `getVisitedProperties` and `ViewGroup.PROPERTY` |
| `auth` | module, service, decorators, guards | Unchanged | Keep. Role guards follow the role rename. |
| `socket/` (`socket.gateway.ts`) | gateway, module | Unchanged | Keep |
| `apps/petoria-batch` | controller, service, module | Imports repointed | `BATCH_TOP_PROPERTIES` → `BATCH_TOP_PRODUCTS`, `BATCH_TOP_AGENTS` → `BATCH_TOP_SELLERS` |
| Notice / Notification | schemas only, no module | Unchanged | Add modules (**Proposed**) |
| Order / Cart | — | — | New modules (**Proposed**) |

## 6. GraphQL changes

**Phase 1 changed no operation names, arguments or types.** The schema generated by `autoSchemaFile` is the same as before.

| Resolver | Operation | Kind | Phase 1 | Proposed name |
|---|---|---|---|---|
| app | `sayHello` | Q | unchanged | — |
| member | `signup`, `login` | M | unchanged | — |
| member | `updateMember`, `likeTargetMember`, `updateMemberByAdmin` | M | unchanged | — |
| member | `imageUploader`, `imagesUploader` | M | unchanged | — (upload target `property` → `product`) |
| member | `checkAuth`, `checkAuthRoles`, `getMember`, `getAllMembersByAdmin` | Q | unchanged | — |
| member | `getAgents` | Q | unchanged | `getSellers` |
| property | `createProperty`, `updateProperty` | M | unchanged | `createProduct`, `updateProduct` |
| property | `likeTargetProperty` | M | unchanged | `likeTargetProduct` |
| property | `updatePropertyByAdmin`, `removePropertyByAdmin` | M | unchanged | `updateProductByAdmin`, `removeProductByAdmin` |
| property | `getProperty`, `getProperties` | Q | unchanged | `getProduct`, `getProducts` |
| property | `getFavorites`, `getVisited` | Q | unchanged | keep the names; they return products |
| property | `getAgentProperties` | Q | unchanged | `getSellerProducts` |
| property | `getAllPropertiesByAdmin` | Q | unchanged | `getAllProductsByAdmin` |
| board-article | `createBoardArticle`, `updateBoardArticle`, `likeTargetBoardArticle`, `updateBoardArticleByAdmin`, `removeBoardArticleByAdmin` | M | unchanged | — |
| board-article | `getBoardArticle`, `getBoardArticles`, `getAllBoardArticlesByAdmin` | Q | unchanged | — |
| comment | `createComment`, `updateComment`, `removeCommentByAdmin` | M | unchanged | — |
| comment | `getComments` | Q | unchanged | — |
| follow | `subscribe`, `unsubscribe` | M | unchanged | — |
| follow | `getMemberFollowings`, `getMemberFollowers` | Q | unchanged | — |

DTOs and inputs that follow the same rename (Proposed): `Property`/`Properties` → `Product`/`Products`; `PropertyInput`, `PropertyUpdate`, `PropertiesInquiry`, `AgentPropertiesInquiry`, `AllPropertiesInquiry`, `AgentsInquiry`; and the range inputs `PricesRange`, `SquaresRange`, `PeriodsRange`. `SquaresRange` gets dropped.

## 7. MongoDB collection and schema changes

**Phase 1: no changes.** Collections, fields, indexes and the database name are identical. Schemas live in `apps/petoria-api/src/shemas/` (the folder name typo is kept).

| Collection | Schema file | Key fields | Proposed change |
|---|---|---|---|
| `members` | `Member.model.ts` | `memberType` (USER/AGENT/ADMIN), `memberNick`, `memberPhone`, `memberProperties`, `memberRank`, counters | `AGENT` → `SELLER`, `memberProperties` → `memberProducts` |
| `properties` | `Property.model.ts` | `propertyType` (APARTMENT/VILLA/HOUSE), `propertyStatus` (ACTIVE/SOLD/DELETE), `propertyLocation`, `propertyAddress`, `propertyTitle`, `propertyPrice`, `propertySquare`, `propertyBeds`, `propertyRooms`, `propertyBarter`, `propertyRent`, `soldAt`, `constructedAt`, counters, `propertyRank`; unique index on (type, location, title, price) | Becomes the `products` collection, with category, pet type, brand, stock and so on. Remove beds, rooms, square, barter, rent and constructedAt. Rebuild the unique index. |
| `boardArticles` | `BoardArticle.model.ts` | `articleCategory` (FREE/RECOMMEND/NEWS/HUMOR) | Optional changes to categories |
| `comments` | `Comment.model.ts` | `commentGroup` (MEMBER/ARTICLE/PROPERTY) | `PROPERTY` → `PRODUCT`, with a data migration |
| `likes` | `Like.model.ts` | `likeGroup` (MEMBER/PROPERTY/ARTICLE); unique (memberId, likeRefId) | `PROPERTY` → `PRODUCT` |
| `views` | `View.model.ts` | `viewGroup` (MEMBER/ARTICLE/PROPERTY); unique (memberId, viewRefId) | `PROPERTY` → `PRODUCT` |
| `follow` | `Follow.model.ts` | `followingId`, `followerId` | — |
| `notices` | `Notice.model.ts` | `noticeCategory` (FAQ/TERMS/INQUIRY) | No module wired to it yet |
| `notifications` | `Notification.model.ts` | `notificationGroup` (… PROPERTY), `propertyId` ref `Property` | `propertyId` → `productId` |

The config in `apps/petoria-api/src/libs/config.ts` also has property-specific helpers: `availablePropertySorts`, `availableAgentSorts`, `availableOptions = ['propertyBarter','propertyRent']`, `validUploadTargets` (includes `'property'`), and the `lookupFavorite` / `lookupVisit` aggregations (`favoriteProperty.*`, `visitedProperty.*`).

## 8. Compatibility notes

- **API contract:** unchanged. The existing frontend (`nestar-next` / `petoria-next`) works against the renamed backend without changes.
- **Database:** unchanged. The `.env` Mongo URIs have no `nestar` reference and were not touched.
- **Build output paths changed:** `dist/apps/nestar-*` is now `dist/apps/petoria-*`. Update any deploy script, PM2 ecosystem file, Dockerfile or CI job that points at the old paths. The `nest start <project>` project names changed too.
- **Uploads:** `apps/uploads/` was not moved. The static path `./apps/uploads` in `main.ts` still works.
- **Phase 3 is a breaking change.** Renaming GraphQL operations, enums (`AGENT`, `PROPERTY`) or collections breaks the existing frontend and existing data. It needs a coordinated frontend release, a Mongo migration script for enum values in `members`, `likes`, `views`, `comments` and `notifications`, and either renaming or re-creating the `properties` collection.
- **Lint baseline:** the repo has 1,436 lint problems that existed before the rename. Do not mix `eslint --fix` into refactor commits (see DECISIONS D6).

## 9. Phase 3 — Property → Product (applied)

> **This section supersedes the "Proposed" columns in §5–§7.** AGENT is kept, so `getAgents`, `BATCH_TOP_AGENTS` and the role guards are unchanged.

### File renames (`git mv`)
| Before | After |
|---|---|
| `components/property/property.{module,resolver,service}.ts` | `components/product/product.{module,resolver,service}.ts` |
| `libs/dto/property/property{,.input,.update}.ts` | `libs/dto/product/product{,.input,.update}.ts` |
| `libs/enums/property.enum.ts` | `libs/enums/product.enum.ts` |
| `shemas/Property.model.ts` | `shemas/Product.model.ts` |

### GraphQL
| Before | After |
|---|---|
| `createProperty`, `updateProperty`, `likeTargetProperty` | `createProduct`, `updateProduct`, `likeTargetProduct` |
| `getProperty`, `getProperties`, `getAgentProperties` | `getProduct`, `getProducts`, `getAgentProducts` |
| `getAllPropertiesByAdmin`, `updatePropertyByAdmin`, `removePropertyByAdmin` | `getAllProductsByAdmin`, `updateProductByAdmin`, `removeProductByAdmin` (arg `productId`) |
| `getFavorites`, `getVisited` | unchanged names, return `Products` |
| Types `Property`, `Properties`, `PropertyInput`, `PropertyUpdate`, `PropertiesInquiry`, `AgentPropertiesInquiry`, `AllPropertiesInquiry` | `Product`, `Products`, `ProductInput`, `ProductUpdate`, `ProductsInquiry`, `AgentProductsInquiry`, `AllProductsInquiry` |
| Enums `PropertyType`, `PropertyStatus`, `PropertyLocation` | `ProductType` (PET/FOOD/TOY/ACCESSORY), `ProductSpecies` (DOG/CAT/BIRD/FISH), `ProductGender` (MALE/FEMALE), `ProductStatus`, `ProductLocation` |
| `PISearch`: `roomsList`, `bedsList`, `squaresRange`, `options` | removed; **added** `speciesList`, `genderList` (kept `memberId`, `locationList`, `typeList`, `pricesRange`, `periodsRange`, `text`) |
| `SquaresRange` input | removed |
| `ALPISearch.propertyStatus` / `propertyLocationList` | `productStatus` / `productLocationList` |
| `LikeGroup` / `ViewGroup` / `CommentGroup` / `NotificationGroup` `PROPERTY` | `PRODUCT` |
| `Member.memberProperties` | `Member.memberProducts` |

### Business rules
- `createProduct`, `updateProduct` and `updateProductByAdmin` throw `BadRequestException(Message.PET_GENDER_REQUIRED)` when `productType = PET` and there is no `productGender`. On update, the stored gender is used if the input doesn't send one.
- SOLD/DELETE handling (`soldAt`, `deletedAt`, `memberProducts -1`) is the same as before.

### MongoDB
- `products` collection; unique index `{ productType, productLocation, productTitle, productPrice }`.
- `members.memberProducts`; `notifications.productId` (ref `Product`).
- `properties` collection is left in place (archive). The dev cleanup script is `scripts/2026-10-petoria-products.mongosh.js` (idempotent, has a `DRY_RUN` flag, **not run**).

### Config and batch
- `availableProductSorts`. `availableOptions` was deleted. `validUploadTargets` now has `'product'`; the `apps/uploads/product/` folder was created.
- `lookupFavorite` / `lookupVisit` use `favoriteProduct.*` / `visitedProduct.*`; the like/view services look up `from: 'products'`.
- Batch: `BATCH_TOP_PRODUCTS` (`productRank = productLikes*2 + productViews`). `BATCH_TOP_AGENTS` now uses `memberProducts*5 + memberArticles*3 + memberLikes*2 + memberViews`.
