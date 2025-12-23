# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Argus** (package name: "ghostwire") is a locally-hosted AI code review tool built with SvelteKit and Bun. It provides interactive diff viewing with syntax highlighting, fuzzy search, and persistent storage of code reviews in SQLite.

## Essential Commands

### Development
```bash
bun install              # Install dependencies
bun run dev             # Start dev server (logs to storage/logs/dev.log)
bun run dev -- --open   # Start dev server and open browser
bun run build           # Create production build
bun run preview         # Preview production build
```

### Code Quality
```bash
bun run check           # Type-check with svelte-check
bun run lint            # Check formatting and lint
bun run lint:fix        # Auto-fix formatting and lint issues
bun run format          # Format code with Prettier
bun run test            # Run unit tests (single run)
bun run test:unit       # Run unit tests in watch mode
```

### Database
```bash
bun run db:migrate           # Run pending migrations
bun run db:make:migration    # Generate new migration file
bun run db:fresh             # Reset database (drops all tables)
```

Database location: `/database/db.sqlite`

## Architecture Overview

### Core Data Flow

1. **Diff Generation**: User selects repo/branch → form POST to `/review` → `LocalGit.getBranchDiff()` executes `git diff` → stores raw diff in SQLite with UUID
2. **Diff Parsing**: Raw diff retrieved by UUID → `diffParser.parse()` converts to structured `DiffInfo[]`
3. **Rendering**: Parsed diffs → `ShikiService` highlights syntax → `TanStack Virtual` renders large files → User sees interactive diff viewer

### Key Architectural Patterns

**Three-Layer Architecture:**
- **Client Layer**: Svelte components in `/src/routes/`
- **Universal Layer**: Reusable code in `/src/lib/` (accessible via `$lib` alias)
- **Server Layer**: Server-only code in `/src/lib/server/` (never bundled to client)

**Singleton Services:**
- `ShikiService`: Code highlighter with ref counting to prevent multiple instances
- `database.ts`: Single SQLite connection used throughout app

**Repository Pattern:**
- `BranchDiffModel`: Abstracts database operations for diffs (create, findByUuid)

### Important File Locations

**Configuration:**
- `config/repos.ts` - Contains `LOCAL_REPOS` array with actual repo paths to review
- `config/repos.example.ts` - Template for repo configuration

**Core Parser:**
- `src/lib/diffParser.ts` (502 lines) - Sophisticated git unified diff parser
  - State machine parser with character-level optimizations
  - Handles quoted paths, renames, copies, deletes, mode changes, binary files
  - Can be complex to modify - test thoroughly when changing

**Main Diff Viewer:**
- `src/routes/review/+page.svelte` (405 lines) - Primary UI component
  - Uses Svelte 5 runes (`$state`, `$derived`) for reactivity
  - Integrates virtualization, syntax highlighting, performance tracking
  - Has debug mode: add `?debug` query param to see parse/render/highlight timings

**Database:**
- `src/lib/server/database.ts` - SQLite connection (uses `bun:sqlite`)
- `src/lib/server/models/BranchDiffModel.ts` - CRUD operations for diffs
- `database/migrations/*.sql` - Numbered migration files
- `src/lib/server/migrations/migrator.ts` - Migration orchestrator

**Git Operations:**
- `src/lib/server/actions/LocalGit.ts` - Wraps `Bun.spawn()` for git commands
  - `getBranches(repoPath)` - Lists branches
  - `getBranchDiff(repoPath, source, target)` - Gets diff between branches

### SvelteKit Routing Structure

```
routes/
├── repos/                    # List all configured repos
├── review/                   # Main diff viewer
│   ├── +page.server.ts      # Form action: generate & store diff
│   ├── [uuid]/              # Load stored diff by UUID
│   └── FileExplorer/        # Sidebar with fuzzy search (fuzzysort library)
└── api/branches/            # GET endpoint for repo branches
```

### Database Schema

**Table: `branch_diffs`**
- Stores generated diffs with UUID for sharing/retrieval
- Columns: `id`, `uuid` (unique), `repo`, `branch`, `diff` (BLOB), `created_at`, `updated_at`

**Table: `migrations`**
- Tracks applied migrations for idempotency

### Technology Stack Specifics

**Bun Runtime:**
- Uses `Bun.spawn()` for git commands (not Node's `child_process`)
- Native SQLite binding via `bun:sqlite` (not better-sqlite3)

**Svelte 5 Runes:**
- New reactivity model: `$state`, `$derived`, `$derived.by`, `$effect`
- Replaces old reactive declarations (`$:`)

**Styling:**
- Tailwind CSS 4.x with custom button system (`src/styles/buttons.css`)
- Custom CSS variables for button roundness (`--btn-border-radius`)
- Dark theme using GitHub-dark inspired color palette
- Recently removed DaisyUI dependency - pure Tailwind now

**Virtualization:**
- Large files (>1000 lines) use `@tanstack/svelte-virtual`
- Small files render normally without virtualization

### Performance Considerations

**Syntax Highlighting:**
- Shiki loads lazily on component mount (not at build time)
- Highlights visible files first, queues off-screen files
- Outputs inline `<span style="color: #xxx">` instead of CSS classes

**Diff Parser:**
- Uses character code checks (`charCodeAt()`) instead of string comparisons for performance
- Example: `100 = 'd'` for "diff" prefix detection

### Testing

The project uses Vitest with Playwright for browser testing. Component tests should use `vitest-browser-svelte`.

## Development Notes

- Dev server logs automatically saved to `storage/logs/dev.log`
- Repo configuration required: copy `config/repos.example.ts` to `config/repos.ts` and add your local repo paths
- Form submissions use POST-redirect-GET pattern with `redirect(303, path)`
- All form actions should use `throw redirect()` not `return redirect()`

## Debugging & Error Handling

**Dev Server Logs:**
The dev server automatically logs all output to `storage/logs/dev.log` (configured in package.json `dev` script).

**When the user mentions seeing errors:**
1. Read `storage/logs/dev.log` to see the actual error messages and stack traces
2. The log file contains real-time output from the dev server including:
   - Build errors (Vite, TypeScript, Svelte compilation)
   - Runtime errors and warnings
   - Console logs from both server and client
3. Always check this file first before asking the user to paste error messages

**Example workflow:**
```bash
# User runs: bun run dev
# You should: Read /Users/dev/repos/argus/storage/logs/dev.log
```
