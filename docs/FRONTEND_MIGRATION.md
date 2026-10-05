# Frontend Migration Plan — `nestar-next` → `petoria-next`

> **Phase 1 of the backend did not change the API**, so the frontend can keep using today's GraphQL documents until backend Phase 3. Every Petoria name below is **Proposed** until DECISIONS D9 and D10 are confirmed.

## 0. Current state (as of 2026-10-05)

| Item | Value |
|---|---|
| Repo | `C:\Users\user\Desktop\PROJECTS\petoria-next` (remote `sanchezSanjar/petoria-next`), forked from `nestar-next` |
| Last commit | `6a995bf feat: start client migration process`. It **deleted 166 files**: all of `pages/`, `public/` (images, `video/ads.mov`, `locales/`) and `scss/`. It also added empty `AGENTS.md` and `SKILLS.md`. |
| Build status | **Broken.** There is no `pages/_app.tsx`, and `libs/components` still imports `scss/` and `public/img`. |
| Intact | `apollo/` and `libs/` (identical to nestar-next) |
| `package.json` name | still `nestar-next` (v2.2.0) |
| Stack | Next 14.2 (Pages Router), React 18.2, `@apollo/client` 3.x, `apollo-upload-client`, `subscriptions-transport-ws`, `next-i18next` 14 (en, kr, ru, uz) |
| Apollo | `apollo/client.ts`: upload link to `REACT_APP_API_GRAPHQL_URL`; WS link to `REACT_APP_API_WS` (default `ws://127.0.0.1:3007`, with `?token=` appended); store in `apollo/store.ts` (`themeVar`, `userVar`, `socketVar`) |
| Env vars | `REACT_APP_API_URL`, `REACT_APP_API_GRAPHQL_URL`, `REACT_APP_API_WS` (passed through `next.config.js`) |

## 1. Step-by-step plan

| Step | Task | Breaks the API? | Done when |
|---|---|---|---|
| 0 | **Restore the UI layer.** Copy `pages/`, `public/` and `scss/` from `nestar-next` (or `git revert 6a995bf` / `git checkout 7cda7c8 -- pages public scss`). | No | `npm run dev` renders `/` |
| 1 | **Identifier rename** (same as backend Phase 1): `package.json` name → `petoria-next`; "Nestar" text in `libs/components/layout/{LayoutHome,LayoutFull,LayoutBasic}.tsx`, `Footer.tsx` and `mypage/RecentlyVisited.tsx`; `pages/_document.tsx` meta/SEO (nestar.uz, real-estate text in EN/RU/KR); `pages/account/join.tsx`; `pages/community/index.tsx`; `public/locales/*/common.json` ("Nestar Community", copyright) | No | `grep -ri nestar` is clean, `next build` passes |
| 2 | **Smoke test against the renamed backend** (`apps/petoria-api`): login, list properties, chat socket | No | Manual QA passes |
| 3 | **UI terminology only.** Change i18n strings and hard-coded text to pet shop language. Leave GraphQL documents alone. Rewrite the `libs/components/cs/Faq.tsx` FAQ content, which is hard-coded real-estate text. | No | No real-estate wording visible |
| 4 | **Rename types and enums** (`libs/types/property/*`, `libs/enums/*`) to match backend Phase 3 | **Yes**, release together with backend Phase 3 | `tsc` passes |
| 5 | **Rename GraphQL documents** (section 4), routes (section 2) and components (section 3) | **Yes** | All operations resolve |
| 6 | **Replace the filters and forms.** `property/Filter.tsx`, `homepage/HeaderFilter.tsx` and `mypage/AddNewProperty.tsx` get pet/product fields. Update `libs/config.ts` (`availableOptions`, `propertyYears`, `propertySquare`, `topPropertyRank`). | **Yes** | Create and search flows work |
| 7 | **Assets and SEO.** Replace `public/img` property and agent images, the logo, favicon and `video/ads.mov`. | No | — |
| 8 | **Admin.** Rework `/_admin/properties` and `admin/properties/PropertyList.tsx`. Wire up `/_admin/cs/*` once the Notice module exists (D12). | **Yes** | — |

## 2. Route mapping (Pages Router)

| Nestar route | File (in `nestar-next/pages`) | Petoria route (Proposed) | Notes |
|---|---|---|---|
| `/` | `index.tsx` | `/` | Homepage sections renamed (section 3) |
| `/property` | `property/index.tsx` | `/product` | Product list and filters |
| `/property/detail` | `property/detail.tsx` | `/product/detail` | |
| `/agent` | `agent/index.tsx` | `/seller` | |
| `/agent/detail` | `agent/detail.tsx` | `/seller/detail` | |
| `/community`, `/community/detail` | `community/*` | same | Categories could be pet-related |
| `/cs` | `cs/index.tsx` | same | Rewrite FAQ content |
| `/about` | `about/index.tsx` | same | Rewrite content |
| `/member` | `member/index.tsx` | same | `MemberProperties` → `MemberProducts` |
| `/mypage` | `mypage/index.tsx` | same | Sub-tabs renamed |
| `/account/join` | `account/join.tsx` | same | Role choice: AGENT → SELLER |
| `/_admin` | `_admin/index.tsx` | same | |
| `/_admin/users` | `_admin/users/index.tsx` | same | |
| `/_admin/properties` | `_admin/properties/index.tsx` | `/_admin/products` | |
| `/_admin/community` | `_admin/community/index.tsx` | same | |
| `/_admin/cs/{faq,notice,inquiry}` | `_admin/cs/*.tsx` | same | Needs the backend Notice module |

Add redirects from `/property*` to `/product*` and from `/agent*` to `/seller*` in `next.config.js` so old links keep working.

## 3. Component mapping (`libs/components/`)

| Nestar component | Petoria component (Proposed) |
|---|---|
| `homepage/TopProperties`, `TopPropertyCard` | `homepage/TopProducts`, `TopProductCard` |
| `homepage/PopularProperties`, `PopularPropertyCard` | `homepage/PopularProducts`, `PopularProductCard` |
| `homepage/TrendProperties`, `TrendPropertyCard` | `homepage/TrendProducts`, `TrendProductCard` |
| `homepage/TopAgents`, `TopAgentCard` | `homepage/TopSellers`, `TopSellerCard` |
| `homepage/HeaderFilter` | `homepage/HeaderFilter` (pet/product fields) |
| `homepage/Advertisement`, `CommunityBoards`, `CommunityCard`, `Events` | keep (content changes only) |
| `property/Filter`, `PropertyCard`, `Review` | `product/Filter`, `ProductCard`, `Review` |
| `agent/ReviewCard` | `seller/ReviewCard` |
| `common/AgentCard`, `PropertyBigCard` | `common/SellerCard`, `ProductBigCard` |
| `common/CommunityCard`, `FiberContainer`, `ScrollControls` | keep |
| `mypage/AddNewProperty`, `MyProperties`, `PropertyCard` | `mypage/AddNewProduct`, `MyProducts`, `ProductCard` |
| `mypage/MyFavorites`, `RecentlyVisited`, `MyArticles`, `Article`, `WriteArticle`, `MyMenu`, `MyProfile` | keep (labels change) |
| `member/MemberProperties` | `member/MemberProducts` |
| `member/MemberArticles`, `MemberFollowers`, `MemberFollowings`, `MemberMenu` | keep |
| `admin/properties/PropertyList` | `admin/products/ProductList` |
| `admin/users/MemberList`, `admin/community/CommunityArticleList`, `admin/cs/*`, `AdminMenuList` | keep (menu labels change) |
| `layout/*`, `Top`, `Footer`, `Chat` | keep (branding changes) |
| `libs/types/property/*` | `libs/types/product/*` |
| `libs/enums/property.enum.ts` | `libs/enums/product.enum.ts` |

## 4. GraphQL query and mutation rename plan

The documents live in `apollo/user/{query,mutation}.ts` and `apollo/admin/{query,mutation}.ts`. The operation names inside match the constants (e.g. `GET_PROPERTIES` → `query GetProperties`). Rename them in the **same release** as backend Phase 3.

| File | Constant (current) | Backend field (current) | Constant (Proposed) | Backend field (Proposed) |
|---|---|---|---|---|
| user/query | `GET_AGENTS` | `getAgents` | `GET_SELLERS` | `getSellers` |
| user/query | `GET_MEMBER` | `getMember` | — | — |
| user/query | `GET_PROPERTY` | `getProperty` | `GET_PRODUCT` | `getProduct` |
| user/query | `GET_PROPERTIES` | `getProperties` | `GET_PRODUCTS` | `getProducts` |
| user/query | `GET_AGENT_PROPERTIES` | `getAgentProperties` | `GET_SELLER_PRODUCTS` | `getSellerProducts` |
| user/query | `GET_FAVORITES`, `GET_VISITED` | `getFavorites`, `getVisited` | — | — (returns `Products`) |
| user/query | `GET_BOARD_ARTICLE(S)`, `GET_COMMENTS`, `GET_MEMBER_FOLLOWERS`, `GET_MEMBER_FOLLOWINGS` | — | — | — |
| user/mutation | `CREATE_PROPERTY` | `createProperty` | `CREATE_PRODUCT` | `createProduct` |
| user/mutation | `UPDATE_PROPERTY` | `updateProperty` | `UPDATE_PRODUCT` | `updateProduct` |
| user/mutation | `LIKE_TARGET_PROPERTY` | `likeTargetProperty` | `LIKE_TARGET_PRODUCT` | `likeTargetProduct` |
| user/mutation | `SIGN_UP`, `LOGIN`, `UPDATE_MEMBER`, `LIKE_TARGET_MEMBER`, `*_BOARD_ARTICLE`, `*_COMMENT`, `SUBSCRIBE`, `UNSUBSCRIBE` | — | — | — |
| admin/query | `GET_ALL_PROPERTIES_BY_ADMIN` | `getAllPropertiesByAdmin` | `GET_ALL_PRODUCTS_BY_ADMIN` | `getAllProductsByAdmin` |
| admin/query | `GET_ALL_MEMBERS_BY_ADMIN`, `GET_ALL_BOARD_ARTICLES_BY_ADMIN`, `GET_COMMENTS` | — | — | — |
| admin/mutation | `UPDATE_PROPERTY_BY_ADMIN` | `updatePropertyByAdmin` | `UPDATE_PRODUCT_BY_ADMIN` | `updateProductByAdmin` |
| admin/mutation | `REMOVE_PROPERTY_BY_ADMIN` | `removePropertyByAdmin` | `REMOVE_PRODUCT_BY_ADMIN` | `removeProductByAdmin` |
| admin/mutation | `UPDATE_MEMBER_BY_ADMIN`, `*_BOARD_ARTICLE_BY_ADMIN`, `REMOVE_COMMENT_BY_ADMIN` | — | — | — |

Field selections inside the documents must change as well. `propertyBeds`, `propertyRooms`, `propertySquare`, `propertyBarter`, `propertyRent`, `constructedAt` and `soldAt` are removed. `property*` becomes `product*`, and `memberProperties` becomes `memberProducts`. There are no subscription documents.

## 5. UI terminology changes

| Nestar term | Petoria term (Proposed) | Where |
|---|---|---|
| Nestar | Petoria | layouts, footer, `_document`, locales (6 matches in `en/common.json`) |
| Property / Properties | Product / Products | about 1,378 matches in `apollo` + `libs`, 268 in `pages`, 44 in the `en` locale |
| Agent / Agents | Seller / Sellers | about 174 matches in `libs`, 85 in `pages`, 22 in the `en` locale |
| Real estate | Pet shop / pet supplies | `cs/Faq.tsx` (9), locales (2) |
| Apartment / Villa / House (`PropertyType`) | Food / Toys / Accessories / Health / Grooming … (product category) | `property.enum.ts`, filters |
| Beds / Rooms | Pet type, breed or size | `property/Filter`, `HeaderFilter`, `AddNewProperty` (about 79 matches) |
| Square / sqft | Weight / volume (product spec) | same files (about 96 matches) |
| Location (`PropertyLocation`: SEOUL … JEJU) | Keep as a shipping region, or remove | filters, cards |
| Barter / Rent | Remove (could become In stock / On sale) | `libs/config.ts` `availableOptions` |
| Sold (`PropertyStatus.SOLD`) | Sold out / Out of stock | status badges |
| Year built (`constructedAt`, `propertyYears`) | Remove | filter, detail page |
| Top Agents / Top Properties | Top Sellers / Best Sellers | homepage |

Update all four locales (`en`, `kr`, `ru`, `uz`) at the same time. They share one namespace, `common.json` (352 keys each).
