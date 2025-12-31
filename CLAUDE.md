# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You should never attempt to run the project using `bun run dev` the developer already has it running.

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

**Development & Debugging:**
- `src/lib/dev/BrowserLogs.ts` - Browser logging system (dev mode only)
  - Intercepts console methods and error handlers
  - Posts batched logs to `/api/logs` endpoint
- `src/routes/api/logs/+server.ts` - Backend endpoint for browser logs
  - Receives browser logs and writes to `storage/logs/browser.log`
  - Dev mode only (returns 404 in production)
- `storage/logs/dev.log` - Server-side development logs (cleared on dev start)
- `storage/logs/browser.log` - Client-side browser logs (cleared on dev start)
- `storage/logs/tests.log` - Test execution output from Vitest

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
- Test execution logs automatically saved to `storage/logs/tests.log`
- Repo configuration required: copy `config/repos.example.ts` to `config/repos.ts` and add your local repo paths
- Form submissions use POST-redirect-GET pattern with `redirect(303, path)`
- All form actions should use `throw redirect()` not `return redirect()`

## Debugging & Error Handling

**Dev Server Logs:**
The dev server automatically logs all output to `storage/logs/dev.log` (configured in package.json `dev` script).

**Browser Logs:**
The browser automatically captures all console output and errors to `storage/logs/browser.log` in development mode.

Browser logging system (`src/lib/dev/BrowserLogs.ts`):
- Captures all console methods: `log`, `info`, `error`, `warn`, `table`
- Captures uncaught errors and unhandled promise rejections
- Batches logs and posts to `/api/logs` endpoint with 100ms debouncing
- Includes timestamp, type, URL, and user agent for each log entry
- Only active in development mode (tree-shaken from production builds)
- Loaded dynamically in root layout via `import.meta.env.DEV` check

**Test Logs:**
Test execution output is automatically saved to `storage/logs/tests.log`.
- Contains Vitest test results, failures, and stack traces
- Updated each time tests are run
- Critical for debugging test failures

**When the user mentions bugs, UI issues, or errors:**
1. **ALWAYS read the relevant log files:**
   - `storage/logs/dev.log` - Server-side errors, build errors, backend logs
   - `storage/logs/browser.log` - Client-side console logs, runtime errors, Svelte errors
   - `storage/logs/tests.log` - Test failures, assertion errors, test stack traces
2. Browser logs contain critical information about:
   - Client-side JavaScript errors
   - Console warnings and errors
   - Unhandled promise rejections
   - Component lifecycle errors
   - Network errors visible in the browser
3. Check browser logs FIRST for UI-related issues since they capture the exact error context
4. Never ask the user to paste error messages - read the log files directly

**When the user mentions test failures:**
1. **ALWAYS read `storage/logs/tests.log` first** to see:
   - Which tests failed
   - Assertion errors and expected vs actual values
   - Full stack traces
   - Test execution context
2. Never ask the user to copy/paste test output - read tests.log directly

**Example workflows:**
```bash
# User says: "I'm seeing an error when I click the button"
# You should:
# 1. Read /Users/dev/repos/argus/storage/logs/browser.log (check for client-side errors)
# 2. Read /Users/dev/repos/argus/storage/logs/dev.log (check for server-side errors)
# 3. Analyze both logs to understand the complete error context

# User says: "The tests are failing"
# You should:
# 1. Read /Users/dev/repos/argus/storage/logs/tests.log (check for test failures and stack traces)
# 2. Identify which tests failed and why
# 3. Read the test files to understand the test logic
# 4. Fix the issue based on the failure details
```
