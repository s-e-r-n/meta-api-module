@AGENTS.md

# Stack

Next 16 (App Router, Turbopack), React Compiler, Tailwind 4, Biome, Cache Components, Vitest, Playwright.

## Commands

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Dev server. The MCP server in `.mcp.json` attaches to it. |
| `npm run typecheck` | `next typegen && tsc --noEmit`. The only thing that decides type safety. |
| `npm run lint`      | Biome check. Does not type-check.                         |
| `npm run format`    | Biome write: formatting, safe fixes and import sorting in one pass. |
| `npm test`          | Vitest, single run.                                       |
| `npm run test:watch` | Vitest in watch mode.                                    |
| `npm run e2e`       | Playwright. Boots the dev server itself.                  |
| `npm run build`     | Where `cacheComponents` enforces its rules.               |
| `npm run verify`    | All of the above, in order. The one to run before saying it works. |

Green lint means nothing about types, and a green build means nothing about behaviour. `verify` is what "it works" means here.

**Routes are typed.** `typedRoutes` is on, so `<Link href="...">` only accepts a route that exists. A link that fails to type-check is a dead link, not a typing nuisance to cast away.

**After deleting a route, `rm -rf .next`.** The generated validator keeps a reference to the removed file and `typecheck` fails with `Cannot find module '../../../src/app/<gone>/page.js'`. That error is stale cache, not your code.

## Tests

**Vitest owns the unit tests, in a sibling folder of the module they cover.** `src/lib/meta-capi/` is tested by `src/lib/meta-capi-tests/`, one test file per module, importing `../meta-capi/<module>`. Business files and test files never share a folder. Pure logic, helpers, and synchronous components.

**Playwright owns `tests/`**, at the project root, outside `src/`. Real browser, real app, real user flow. Its config boots the dev server on its own, so `npm run e2e` needs nothing running first.

**`async` Server Components cannot be unit tested.** Vitest does not support them, which the framework's own guide states plainly. They belong in an e2e test.

A change that touches runtime behaviour is not verified by types or by a green build. Reproduce it the way a user reaches it, then keep that reproduction as a test.

Setup guides for both ship with the install: `node_modules/next/dist/docs/01-app/02-guides/testing/`.

## Conventions

**Tailwind 4 has no config file.** The theme lives in `src/app/globals.css` under `@theme`. There is no `tailwind.config.js` to look for.

**Components take a `className` prop and merge it last.** Base styles live in the component, `cn()` from `@/lib/utils` puts the caller's classes last so they win. This is what lets one component ship across brands without being reset first.

```tsx
<hr className={cn("m-0 shrink-0 border-0", isVertical ? "h-full w-px" : "h-px w-full", className)} />
```

`cn()` wraps `tailwind-merge` only. It handles strings, arrays, and falsy values, but not object syntax (`{ "p-2": on }`). Use a ternary or `&&` rather than adding `clsx`.

**Biome is the only linter and formatter.** No ESLint, no Prettier. Anything Biome cannot express goes in a code review, not in a second tool.

**`noFloatingPromises` is on** through Biome's `types` domain. An un-awaited promise is an error. Await it, return it, handle it, or `void` it deliberately.

**Cache Components is on.** Dynamic reads (`cookies()`, `headers()`, `searchParams`) must sit inside a `<Suspense>` boundary or behind `'use cache'`. This is a build-time rule, so a route that ignores it fails `npm run build`, not `npm run dev`.

**Partial Prefetching is on**, which `cacheComponents` is a prerequisite for. Every `<Link>` prefetches its route's shared App Shell. `<Link prefetch={true}>` no longer carries the route's dynamic content, so reach for it deliberately when a destination needs its URL data resolved before the click. Insights about this appear in the dev overlay and never block the build.

**No shadcn/ui.** Do not install it or vendor its components. Raise the need and wait for a decision.

## Verifying a change

Compiling is not working. Confirm behaviour in the running app: the `next-dev-loop` skill drives `next dev` through the framework's own view and a real browser. Reach for it when a change touches runtime behaviour rather than types alone.

## Errors

Every error falls in exactly one of these. There is no overlap to arbitrate.

**Expected** (validation, a resource that is not there) is a **return value**, never a throw. A thrown message is replaced by a digest in production, so the user reads "Something went wrong" instead of what you wrote. Server Actions surface these through `useActionState`, typed.

**Unexpected** (the database is down, a payment is refused) **travels up untouched**. `instrumentation.ts` catches it with its route, execution kind and request attached. Wrapping it in a `try`/`catch` to log it destroys exactly that context.

**Catch only to name an operation**, then rethrow with `cause` so the original survives:

```ts
catch (err) {
  throw new Error(`Stripe charge failed for order ${orderId}`, { cause: err });
}
```

Next reports where the failure happened. This says what was being attempted. The framework cannot know the second, which is the only reason to write the catch.

The one thing never to do: catch, log, and continue. That is what produces "something failed somewhere".

## Framework docs

`node_modules/next/dist/docs/` holds the docs for the exact installed version. Next 16 broke APIs the training data still remembers, `middleware` becoming `proxy` among them. When these files and recollection disagree, or these files and a skill disagree, these files win.

`AGENTS.md` is regenerated by `next dev` between its `BEGIN`/`END` markers. Edits inside that block are lost. This file is never regenerated, so house rules belong here.
