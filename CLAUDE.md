# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Argus is a locally hosted AI code review tool built with SvelteKit, Bun, and DaisyUI. It provides a web interface for reviewing Git diffs with syntax highlighting and side-by-side comparisons.

## Development Commands

**Start development server:**
```sh
bun run dev
# or with auto-open
bun run dev -- --open
```

**Build for production:**
```sh
bun run build
bun run preview  # Preview production build
```

**Code quality:**
```sh
bun run check        # Type check with svelte-check
bun run check:watch  # Type check in watch mode
bun run lint         # Check formatting and lint
bun run lint:fix     # Auto-fix formatting and lint issues
bun run format       # Format all files
```

**Testing:**
```sh
bun run test         # Run unit tests once
bun run test:unit    # Run unit tests in watch mode
```

**Database:**
```sh
bun run db:migrate   # Run migrations
bun run db:seed      # Seed database
bun run db:reset     # Reset database
```

## Architecture

### Core Technologies
- **Runtime**: Bun (not Node.js)
- **Framework**: SvelteKit with Svelte 5 (runes mode enabled)
- **Database**: Bun's SQLite implementation
- **Styling**: Tailwind CSS 4 + DaisyUI
- **Syntax Highlighting**: Shiki

### Key Components

**Repository Configuration** (`src/config/repos.ts`)
- Copy from `repos.example.ts` to create your local config
- Defines `LOCAL_REPOS` array with local Git repository paths
- This file is gitignored and must be created manually

**Git Integration** (`src/lib/server/actions/LocalGit.ts`)
- Server-side only (uses Node's `child_process`)
- `getBranches()`: Lists local Git branches
- `getBranchDiff()`: Generates diff between two branches using `git diff`

**Diff Parser** (`src/lib/diffParser.ts`)
- Pure TypeScript git diff parser (no dependencies)
- Exports `parser.parse()` to convert git diff string to structured `DiffInfo[]`
- Supports split view conversion for side-by-side rendering
- Handles binary files, renames, copies, and all standard diff types

**Syntax Highlighting** (`src/lib/shikiService.ts`)
- Singleton service managing Shiki highlighter lifecycle
- Browser-side only (uses DOM APIs)
- Use `getInstance()`, `init()`, `highlight()`, `dispose()` pattern
- Configured with github-dark theme

**Database** (`src/lib/database.ts`, `src/lib/migrations.ts`)
- SQLite database at `../../../database/db.sqlite` (relative to lib folder)
- Auto-runs migrations on import
- Add new migrations to `migrations.ts` array with sequential IDs

### Route Structure

**`/repos`** - Repository listing page
- Server load: Returns `LOCAL_REPOS` from config

**`/review`** - Main review interface
- Server action `getDiff`: Fetches diff between main and selected branch
- Client components:
  - `FileExplorer/`: Tree view of changed files
  - `VirtualizedFileContent.svelte`: Virtualized diff rendering for performance
  - `FileHeader.svelte`, `ChangeRow.svelte`, `HunkDisplay.svelte`: Diff UI components
  - `diffViewerUtils.ts`: Utilities for diff rendering

**`/api/branches`** - API endpoint for branch listing

### SvelteKit Patterns

- Uses `+page.server.ts` for server-side data loading and form actions
- File-based routing in `src/routes/`
- Path alias `$lib` maps to `src/lib/`
- Svelte 5 runes mode enabled in `svelte.config.js`

## Important Notes

- This project uses **Bun**, not npm/yarn/pnpm. Always use `bun` commands.
- The `src/config/repos.ts` file must be created manually from the example file.
- Server-side code can use Node.js APIs (via Bun compatibility), but client code is browser-only.
- The diff parser is performance-optimized with character code comparisons instead of string operations.
