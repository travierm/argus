# Argus

Locally hosted AI code reviews.

## Developing

```sh
bun install

bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## SvelteKit Reference

### Folder Structure

**`src/routes/`** - File-based routing
- `+page.svelte` - Page component (UI)
- `+page.server.ts` - Server-side code (load data, form actions)
- `+page.ts` - Universal load function (runs on both server & client)
- `+layout.svelte` - Shared layout wrapper for child routes
- `+layout.server.ts` - Server layout data
- `+server.ts` - API endpoints (GET, POST, etc.)
- `+error.svelte` - Error page for this route

**Route examples:**
- `src/routes/+page.svelte` → `/`
- `src/routes/about/+page.svelte` → `/about`
- `src/routes/blog/[slug]/+page.svelte` → `/blog/anything` (dynamic)

**`src/lib/`** - Reusable code
- Import via `$lib` alias: `import { foo } from '$lib/utils'`
- Components, utilities, helpers go here

**`src/lib/server/`** - Server-only code
- Never bundled for client
- Database connections, API keys, server utilities

**`static/`** - Static assets (root level, not in src/)
- Served as-is: `static/favicon.png` → `/favicon.png`

**`src/hooks.server.ts`** - Server hooks (intercept all requests)

**`src/app.html`** - HTML template (base shell)

### Form Actions & Redirects

**Redirecting from POST routes:**
```typescript
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  submit: async ({ request }) => {
    const data = await request.formData();
    // Process data...

    // Redirect after successful submission
    throw redirect(303, '/success');
  }
} satisfies Actions;
```

Use status code `303` (See Other) for POST-redirect-GET pattern.

## Powered By

- [SvelteKit](https://svelte.dev/docs/kit/introduction)
- [DaisyUI](https://daisyui.com/)
- [Bun](https://bun.com/docs)
