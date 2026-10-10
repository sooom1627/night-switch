# Before You Start

Every change is tied to the whole product. Before any work:

1. **Sources of truth** are `docs/product.md` (product, spec §2, Epics §3) and [GitHub Issues](https://github.com/sooom1627/night-switch/issues). Anything else (chat notes, external docs) is reference only; if it disagrees, the repo and Issues win.
2. **Find the Issue first.** Do no work without one. Product work needs a Story (`story` label, `Epic: E-###`); tooling and docs use `chore` / `docs`; open questions only the owner can settle are `decision` Issues. If none exists, create it before starting (see `.cursor/rules/agile-workflow.mdc`).
3. **Read the context** the Issue points to: the Story, its Epic row in `docs/product.md` §3, and the spec section it cites in §2. Screen Stories also need their `docs/screens/*.md`.
4. **Follow the product language** in `docs/product.md` §1.5–1.6 for every user-facing string: no commands, no 「失敗」, no red, no warning icons, no falling numbers.
5. **Never open a PR without an Issue.** The PR body lists the Issues it closes or refers to.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code that touches an Expo, EAS, or React Native API. For anything else, start from https://docs.expo.dev/llms.txt (an index of all Expo docs with corrections to common LLM misconceptions) and follow its links. Never answer from memory.

You are an expert developer proficient in TypeScript, React and Expo SDK 57 (React Native), Expo Router and pnpm (not npm).

# Development Guidelines (TypeScript / Expo)

## Core Principles

1. **Simplicity over Sophistication**: Choose practical, straightforward solutions over architecturally "elegant" but complex ones.
2. **Integration over Fragmentation**: Prefer unified implementations over multiple small pieces that require complex integration.
3. **Current Requirements over Future Flexibility (YAGNI)**: Build for today's needs. Avoid speculative features or over-abstraction.
4. **Readability over Cleverness**: Code must be immediately understandable to any team member.
5. **Minimal Viable Abstraction**: Abstract only after a pattern has been proven and repeated at least 3 times.

---

## Technical Stack

- **Framework**: Expo SDK 57 (Continuous Native Generation; no `ios/` or `android/` in the repo)
- **Language**: TypeScript (Strict Mode)
- **Navigation**: Expo Router (File-based, typed routes)
- **Styling**: `StyleSheet` with the theme in `src/shared/theme/`
- **Testing**: Jest (jest-expo) + React Native Testing Library (Classical TDD)
- **Build**: EAS Build
- **Package Manager**: pnpm

The structure and tools follow [sooom1627/stamp-log](https://github.com/sooom1627/stamp-log) (read it for reference; never change it). Libraries stamp-log uses but night-switch does not have yet (Uniwind, TanStack Query, Zod, SQLite, i18next) are added by the first Story that needs them, the same way stamp-log uses them.

---

## Commands

```bash
pnpm install
pnpm start                     # dev server
pnpm run check                 # format:fix → lint → typecheck → test (also runs on pre-commit)
npx expo install <package>     # ALWAYS use instead of pnpm add — resolves SDK-compatible versions
npx expo-doctor                # diagnose dependency and config issues
npx expo install --fix         # fix incompatible package versions
```

- Dev-only packages: `npx expo install <package> -- -D`.
- If `expo install` fails because the Expo API is unreachable (e.g. behind a proxy), `EXPO_OFFLINE=1 npx expo install …` resolves versions from the locally installed `expo` package.
- EAS CLI: `npx eas-cli@latest <command>` (substitute for bare `eas` in docs examples).

---

## Implementation Principles

- **TDD**: Classical TDD with minimal mocking. Confirm Red → minimal implementation → confirm Green → refactor. Follow `.cursor/rules/tdd-cycle.mdc`.
- **Work units**: Epic (table in `docs/product.md` §3; not a milestone) / Story / Task (GitHub Issues) / Sub (checklist in the Task issue). A release is a GitHub milestone holding the Stories and Tasks that ship in it. Story branch once → plan → Task branch → Sub 完了まで実装 → merge Task into Story → merge Story to `master` (PR closes the Story and Task issues). `docs/` holds the current spec only; Story-scoped notes go in Issues. **Sub (`ST-###`) is the implementation unit** and may be a horizontal layer (schema / db / hooks / UI). Non-UI Subs get layer tests; UI Subs cover acceptance with RNTL. **Do not commit unless the user asks** (then one Sub = one commit). Follow `.cursor/rules/agile-workflow.mdc`.
- **Simplicity**: YAGNI, SOLID at feature granularity, no speculative abstraction. Follow `.cursor/rules/simplicity-first.mdc`.
- **Features / data**: Domain in `src/features/<name>/` (screens, feature components). Cross-feature code in `src/shared/`. Follow `.cursor/rules/feature-query.mdc`.
- **Quality gate**: Run `pnpm run check` at each Sub completion. Fix critical issues immediately; defer minor ones for batch refactor.

---

## Code Style & Structure

- **Functional Programming**: Use functional and declarative patterns; strictly avoid classes.
- **File Organization**: Organize by **Feature** under `src/features/<kebab-name>/` (`screens/`, `components/`, `hooks/`, `db/`, `schemas/`). Put cross-feature UI, hooks, theme and utils under `src/shared/`. Keep `src/app/` as routes only. Tests go in each layer's `test/` (e.g. `screens/test/`), not next to the source file.
- **Naming Conventions**:
  - Use lowercase with dashes (kebab-case) for directories and files (e.g., `features/home`, `shared/theme`).
  - Favor **named exports** for components and functions.
  - Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`, `shouldRedirect`).
  - Route default exports are named by role, without `Route`: tab roots `*Tab`, pushed screens and the root page `*Page`, form sheets `*Sheet`, layouts `*Layout`. Feature screen bodies stay `*Screen`.
- **Routing**: Import `Link`, `router` and `useLocalSearchParams` from `expo-router`. Read URL params in the route file and pass typed values to the feature screen.
- **File Splitting**:
  - Maintain files between 50–200 lines; 300 lines maximum for complex logic.
  - Do not split files for size alone—prioritize cohesion and readability.

---

## Error Handling

- Handle errors at the beginning of functions (Guard Clauses) and return early; avoid unnecessary `else`.
- Validate external data (deep links, stored data) before use.

---

## Testing Strategy: Classical TDD

Details and the mandatory Red → Green cycle live in `.cursor/rules/tdd-cycle.mdc`. Summary:

- **Classical Style**: Prefer sociable tests; mock only out-of-process dependencies (e.g. Screen Time, notifications); assert behavior, not implementation details.
- **Tools**: Jest for logic and React Native Testing Library (RNTL) for component behavior. RNTL 14: `await render(…)`. Route-level tests use `renderRouter("./src/app")` from `expo-router/testing-library`.
- **Location**: `src/features/<name>/<layer>/test/` (e.g. `screens/test/`). Do not colocate `*.test.ts(x)` with source. Never put tests in `src/app/` (every file there is a route).

---

## UI

- **Theme**: Colors, spacing and fonts come from `src/shared/theme/theme.ts` (light and dark). Use `ThemedText` / `ThemedView` from `src/shared/components/`. Never hard-code hex in feature components.
- **Safe Area**: Use `react-native-safe-area-context`.
- **Animations**: `react-native-reanimated` and `react-native-gesture-handler`.
- **Accessibility props**: Use ARIA props (`role`, `aria-label`, …), not `accessibility*` props.
- **Wiring**: `src/shared/theme/global.css` holds web font variables. `css.d.ts` declares `*.css` for `tsc` (CI has no gitignored `expo-env.d.ts`). Jest maps `.css` to `__mocks__/style-mock.ts`.

---

## Native Rules

- `ios/` and `android/` are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, use a development build (`eas build --profile development`).
- Prefer recommended Expo modules over third-party libraries.

---

## Git Commit Messages

- **Format**: `prefix: message`
- **Prefixes**:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes only
  - `style`: Formatting, missing semi-colons, etc. (no code change)
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding or correcting tests
  - `chore`: Changes to build process, libraries, or auxiliary tools
